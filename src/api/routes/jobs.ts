import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { getJobById, getAllJobs } from "../../db/queries/jobs.js";
import { getDeliveryAttemptsByJobId } from "../../db/queries/deliveryAttempts.js";
import { NotFoundError } from "../../shared/errors.js";

export const jobsRouter = Router();

// GET /api/jobs
jobsRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllJobs();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id
jobsRouter.get<{ id: string }>(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const job = await getJobById(id);
      if (!job) throw new NotFoundError("Job not found");
      res.status(200).json(job);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/jobs/:id/deliveries
jobsRouter.get<{ id: string }>(
  "/:id/deliveries",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const job = await getJobById(id);
      if (!job) throw new NotFoundError("Job not found");

      const attempts = await getDeliveryAttemptsByJobId(id);
      res.status(200).json(attempts);
    } catch (err) {
      next(err);
    }
  },
);
