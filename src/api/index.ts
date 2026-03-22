import express from "express";
import { pipelinesRouter } from "./routes/pipelines.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { jobsRouter } from "./routes/jobs.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from "../shared/errors.js";

import type { Request, Response, NextFunction } from "express";
import { error } from "node:console";

const app = express();
const Port = process.env.PORT || 3000;

app.use(express.json());

//routes: to implement modular routing principle

app.use("/api/pipelines", pipelinesRouter);
app.use("/webhooks", webhooksRouter);
app.use("/api/jobs", jobsRouter);

app.get("/health", (req: Request, res: Response) => {
  // to chack if the server is alive (doker or depolyment process) if the server stop response 200 status, make auto re-running
  res.status(200).json({ status: "OK" });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${err.name}]: ${err.message}`);
  console.error(err.stack);
  console.error("CAUSE:", err.cause);
  if (err instanceof BadRequestError) {
    return res.status(400).json({ error: err.message });
  } else if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  } else if (err instanceof ConflictError) {
    return res.status(409).json({ error: err.message });
  } else {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(Port, () => {
  console.log(`API server running on port ${Port}`);
});
