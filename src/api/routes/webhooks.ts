import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { getPipelineById } from "../../db/queries/pipelines.js";
import { createJob } from "../../db/queries/jobs.js";
import { NotFoundError } from "../../shared/errors.js";

export const webhooksRouter = Router();

// POST /webhooks/:pipelineId
webhooksRouter.post(
  "/:pipelineId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pipelineId } = req.params as { pipelineId: string };

      const pipeline = await getPipelineById(pipelineId);
      if (!pipeline) throw new NotFoundError("Pipeline not found");

      const job = await createJob(pipelineId, req.body);

      res.status(202).json({
        message: "Webhook received",
        jobId: job.id,
      });
    } catch (err) {
      next(err);
    }
  }
);