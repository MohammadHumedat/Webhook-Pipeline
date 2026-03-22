import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  varchar,
} from "drizzle-orm/pg-core";

// Enums
export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "success",
  "failed",
]);

export const actionTypeEnum = pgEnum("action_type", [
  "uppercase",
  "add_timestamp",
  "filter_fields",
]);

//pipelines
export const pipelines = pgTable("pipelines", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  name: text("name").notNull(),
  actionType: actionTypeEnum("action_type").notNull(),
});

// Subscribers
export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
});

//Jobs
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  status: jobStatusEnum("status").notNull().default("pending"),
  payload: jsonb("payload").notNull(), // jsonb:becuase we dont know how the form of data is.
  processedPayload: jsonb("processed_payload"),
  attempts: integer("attempts").notNull().default(0),
});

// Delivery Attempts
export const deliveryAttempts = pgTable("delivery_attempts", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  subscriberId: uuid("subscriber_id")
    .notNull()
    .references(() => subscribers.id, { onDelete: "cascade" }),
  status: deliveryStatusEnum("status").notNull().default("pending"),
  statusCode: integer("status_code"),
  attemptNumber: integer("attempt_number").notNull().default(1),
  errorMessage: text("error_message"),
});

// Types
export type Pipeline = typeof pipelines.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type DeliveryAttempt = typeof deliveryAttempts.$inferSelect;
