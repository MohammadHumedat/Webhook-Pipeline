import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { jobs } from "../schema.js";

export async function createJob(pipelineId: string, payload: unknown) {
  const [result] = await db
    .insert(jobs)
    .values({
      pipelineId,
      payload,
      status: "pending",
    })
    .returning();
  return result;
}

export async function getJobById(id: string) {
  const [result] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id));
  return result;
}

export async function getAllJobs() {
  return await db.select().from(jobs);
}

export async function getPendingJobs() {
  return await db
    .select()
    .from(jobs)
    .where(eq(jobs.status, "pending"));
}

export async function updateJobStatus(
  id: string,
  status: "pending" | "processing" | "completed" | "failed",
  processedPayload?: unknown
) {
  const [result] = await db
    .update(jobs)
    .set({
      status,
      processedPayload: processedPayload ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, id))
    .returning();
  return result;
}