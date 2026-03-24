# Webhook Processing Pipeline

A backend service that receives webhooks, processes them asynchronously via a job queue, and delivers results to subscribers — similar to a simplified Zapier.

## Architecture

```
Incoming Webhook → API Service → Job Queue (PostgreSQL) → Worker → Subscribers
```

**API Service** — receives webhooks, manages pipelines and subscribers, exposes job status endpoints.

**Worker Service** — polls for pending jobs every 5 seconds, applies processing actions, delivers results to subscribers with retry logic.

**PostgreSQL** — stores pipelines, subscribers, jobs, and delivery attempts.

## Tech Stack

- TypeScript + Node.js
- Express.js
- Drizzle ORM
- PostgreSQL
- Docker Compose
- GitHub Actions

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Run the project

```bash
git clone https://github.com/your-username/webhook-pipeline.git
cd webhook-pipeline
docker compose up --build
```

The API will be available at `http://localhost:3000`.

## API Documentation

### Pipelines

| Method | Endpoint             | Description                   |
| ------ | -------------------- | ----------------------------- |
| GET    | `/api/pipelines`     | get all pipelines             |
| GET    | `/api/pipelines/:id` | get pipeline with subscribers |
| POST   | `/api/pipelines`     | create new pipeline           |
| PUT    | `/api/pipelines/:id` | update pipeline               |
| DELETE | `/api/pipelines/:id` | delete pipeline               |

**create pipeline:**

```json
POST /api/pipelines
{
  "name": "My Pipeline",
  "actionType": "uppercase"
}
```

Available action types: `uppercase`, `add_timestamp`, `filter_fields`

---

### Subscribers

| Method | Endpoint                                     | Description       |
| ------ | -------------------------------------------- | ----------------- |
| GET    | `/api/pipelines/:pipelineId/subscribers`     | get subscribers   |
| POST   | `/api/pipelines/:pipelineId/subscribers`     | add subscriber    |
| DELETE | `/api/pipelines/:pipelineId/subscribers/:id` | delete subscriber |

**add subscriber:**

```json
POST /api/pipelines/:pipelineId/subscribers
{
  "url": "https://your-endpoint.com/webhook"
}
```

---

### Webhooks

| Method | Endpoint                | Description  |
| ------ | ----------------------- | ------------ |
| POST   | `/webhooks/:pipelineId` | send webhook |

```json
POST /webhooks/:pipelineId
{
  "message": "hello world"
}
```

Response:

```json
{
  "message": "Webhook received",
  "jobId": "xxxx-xxxx-xxxx"
}
```

---

### Jobs

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| GET    | `/api/jobs`                | get all jobs          |
| GET    | `/api/jobs/:id`            | get job with detailes |
| GET    | `/api/jobs/:id/deliveries` | get submition history |

---

## Processing Actions

| Action          | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `uppercase`     | Change all text to uppercase                                       |
| `add_timestamp` | Add `processedAt` and `requestId` for data                         |
| `filter_fields` | keeping some only feilds: `id`, `name`, `email`, `message`, `type` |

---

## Flow

```
1. POST /webhooks/:pipelineId
2. API saves job with status "pending"
3. Returns 202 Accepted immediately
4. Worker polls every 5 seconds
5. Worker picks up job, sets status to "processing"
6. Worker applies processing action
7. Worker delivers result to all subscribers
8. Retries up to 3 times on failure
9. Job status updated to "completed" or "failed"
```
