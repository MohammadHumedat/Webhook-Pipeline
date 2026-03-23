import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { deliveryAttempts } from "../schema.js";

export async function createDeliveryAttempt(
  jobId: string,
  subscriberId: string,
  attemptNumber: number
) {
  const [result] = await db
    .insert(deliveryAttempts)
    .values({ jobId, subscriberId, attemptNumber, status: "pending" })
    .returning();
  return result;
}

export async function updateDeliveryAttempt(
  id: string,
  status: "success" | "failed",
  statusCode: number,
  errorMessage?: string
) {
  const [result] = await db
    .update(deliveryAttempts)
    .set({ status, statusCode, errorMessage })
    .where(eq(deliveryAttempts.id, id))
    .returning();
  return result;
}

export async function getDeliveryAttemptsByJobId(jobId: string) {
  return await db
    .select()
    .from(deliveryAttempts)
    .where(eq(deliveryAttempts.jobId, jobId));
}
