import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { pipelines, subscribers } from "../schema.js";
import type { ActionType } from "../../shared/types.js";

export async function createPipeline(name: string, actionType: ActionType) {
  const [result] = await db
    .insert(pipelines)
    .values({ name, actionType })
    .returning();
  return result;
}

export async function getAllPipelines() {
  const [result] = await db.select().from(pipelines);
  return result;
}

export async function getPipelineById(id: string) {
  const [result] = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.id, id));

  return result;
}

export async function updatePipeline(
  id: string,
  newName: string,
  newActionType: ActionType,
) {
  const [result] = await db
    .update(pipelines)
    .set({ name: newName, actionType: newActionType, updatedAt: new Date() })
    .where(eq(pipelines.id, id))
    .returning();

  return result;
}

export async function deletePipeline(id: string) {
  return await db.delete(pipelines).where(eq(pipelines.id, id));
}

export async function getPipelineWithSubscribers(id: string) {
  const pipeline = await getPipelineById(id);
  if (!pipeline) return null;

  const subs = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.pipelineId, id));

  return { ...pipeline, subscribers: subs };
}