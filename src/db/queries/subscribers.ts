import { subscribers } from "@db/schema";
import { db } from "../index.js";
import { eq } from "drizzle-orm";
export async function createSubscriber(pipelineId: string, url: string) {
  const [result] = await db
    .insert(subscribers)
    .values({ pipelineId: pipelineId, url: url })
    .returning();

  return result;
}

export async function getSubscribersByPipelineId(pipelineId: string) {
  const result = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.pipelineId, pipelineId));

  return result;
}

export async function deleteSubscriber(id: string) {
  await db.delete(subscribers).where(eq(subscribers.id, id));
}

export async function getSubscriberById(id: string) {
  const [result] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.id, id));
  return result;
}
