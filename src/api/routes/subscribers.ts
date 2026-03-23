import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import {
  createSubscriber,
  getSubscribersByPipelineId,
  deleteSubscriber,
  getSubscriberById,
} from "../../db/queries/subscribers.js";
import { getPipelineById } from "../../db/queries/pipelines.js";
import { NotFoundError, BadRequestError } from "../../shared/errors.js";

export const subscribersRouter = Router({ mergeParams: true });

// GET /api/pipelines/:pipelineId/subscribers
subscribersRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pipelineId } = req.params as { pipelineId: string };
      const pipeline = await getPipelineById(pipelineId);

      if (!pipeline) throw new NotFoundError("Pipeline not found");
      const result = await getSubscribersByPipelineId(pipelineId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/pipelines/:pipelineId/subscribers

subscribersRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pipelineId } = req.params as { pipelineId: string };
      const { url } = req.body;

      const pipeline = await getPipelineById(pipelineId);
      if (!pipeline) throw new NotFoundError("Pipeline not found");

      const subscriber = await createSubscriber(pipelineId, url);
      res.status(201).json(subscriber);
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/pipelines/:pipelineId/subscribers/:id
subscribersRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pipelineId, id } = req.params as {
        pipelineId: string;
        id: string;
      };

      const pipeline = await getPipelineById(pipelineId);
      if (!pipeline) throw new NotFoundError("Pipeline not found");

      const subscriber = await getSubscriberById(id);
      if (!subscriber) throw new NotFoundError("Subscriber not found");

      await deleteSubscriber(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
