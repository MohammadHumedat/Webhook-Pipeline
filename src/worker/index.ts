import "../db/index.js";
import { getPendingJobs, updateJobStatus } from "../db/queries/jobs.js";
import { getSubscribersByPipelineId } from "../db/queries/subscribers.js";
import { getPipelineById } from "../db/queries/pipelines.js";
import {
  createDeliveryAttempt,
  updateDeliveryAttempt,
} from "../db/queries/deliveryAttempts.js";
import { processPayload } from "../shared/actions.js";
import { Subscriber } from "../db/schema.js";

const POLL_INTERVAL_MS = 5000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

console.log("Worker started, polling every 5 seconds...");

async function processJob(jobId: string) {
  // get the job and pipleine
  const { getJobById } = await import("../db/queries/jobs.js");
  const job = await getJobById(jobId);
  if (!job) return;

  const pipeline = await getPipelineById(job.pipelineId);
  if (!pipeline) return;

  // change states to processing.
  await updateJobStatus(jobId, "processing");

  //perform the actions
  const processedPayload = processPayload(job.payload, pipeline.actionType);

  //  get the subscribers
  const subscribers = await getSubscribersByPipelineId(job.pipelineId);

  if (subscribers.length === 0) {
    await updateJobStatus(jobId, "completed", processedPayload);
    console.log(`[Job ${jobId}] No subscribers, marked as completed`);
    return;
  }

  // post the result to Subscribers
  const results = await Promise.allSettled(
    subscribers.map((subscriber) =>
      deliverToSubscriber(jobId, subscriber.id, subscriber.url, processedPayload)
    )
  );

  
  const allFailed = results.every((r) => r.status === "rejected");
  await updateJobStatus(
    jobId,
    allFailed ? "failed" : "completed",
    processedPayload
  );

  console.log(`[Job ${jobId}] Finished — action: ${pipeline.actionType}`);
}

async function deliverToSubscriber(
  jobId: string,
  subscriberId: string,
  url: string,
  payload: unknown
) {
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    const deliveryAttempt = await createDeliveryAttempt(
      jobId,
      subscriberId,
      attempt
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      await updateDeliveryAttempt(
        deliveryAttempt.id,
        response.ok ? "success" : "failed",
        response.status,
        response.ok ? undefined : `HTTP ${response.status}`
      );

      if (response.ok) {
        console.log(`[Delivery] subscriber ${subscriberId} — attempt ${attempt} SUCCESS`);
        return;
      }

      console.log(`[Delivery] subscriber ${subscriberId} — attempt ${attempt} FAILED (${response.status})`);
    } catch (err: any) {
      await updateDeliveryAttempt(
        deliveryAttempt.id,
        "failed",
        0,
        err.message
      );
      console.log(`[Delivery] subscriber ${subscriberId} — attempt ${attempt} ERROR: ${err.message}`);
    }

   
    if (attempt < MAX_RETRY_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  throw new Error(`All ${MAX_RETRY_ATTEMPTS} attempts failed for subscriber ${subscriberId}`);
}

async function poll() {
  const pendingJobs = await getPendingJobs();

  if (pendingJobs.length === 0) {
    return;
  }

  console.log(`[Worker] Found ${pendingJobs.length} pending job(s)`);

  for (const job of pendingJobs) {
    await processJob(job.id);
  }
}

// the actual running
setInterval(async () => {
  try {
    await poll();
  } catch (err) {
    console.error("[Worker] Poll error:", err);
  }
}, POLL_INTERVAL_MS);

// graceful shutdown
process.on("SIGINT", () => {
  console.log("\nWorker shutting down...");
  process.exit(0);
});