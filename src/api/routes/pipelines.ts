import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import {
  createPipeline,
  getAllPipelines,
  getPipelineWithSubscribers,
  updatePipeline,
  deletePipeline,
} from "../../db/queries/pipelines.js";
import { NotFoundError, BadRequestError } from "../../shared/errors.js";
import { VALID_ACTION_TYPES } from "../../shared/types.js";

export const pipelinesRouter = Router();

// Get /api/pipelines

pipelinesRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getAllPipelines();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);
// Get /api/pipelines/:id
pipelinesRouter.get<{ id: string }>(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const pipeline = await getPipelineWithSubscribers(id);
      if (!pipeline) throw new NotFoundError("Pipeline not found");
      res.status(200).json(pipeline);
    } catch (err) {
      next(err);
    }
  },
);
// post /api/pipelines
pipelinesRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, actionType } = req.body;

      if (!name || !actionType)
        throw new BadRequestError("name and actionType are required");

      if (!VALID_ACTION_TYPES.includes(actionType))
        throw new BadRequestError(
          `actionType must be one of: ${VALID_ACTION_TYPES.join(", ")}`,
        );

      const pipeline = await createPipeline(name, actionType);
      res.status(201).json(pipeline);
    } catch (err) {
      next(err);
    }
  },
);

// put /api/pipelines/:id
pipelinesRouter.put(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, actionType } = req.body;
      const { id } = req.params as { id: string };
      if (!name || !actionType)
        throw new BadRequestError("name and actionType are required");

      if (!VALID_ACTION_TYPES.includes(actionType))
        throw new BadRequestError(
          `actionType must be one of: ${VALID_ACTION_TYPES.join(", ")}`,
        );

      const existing = await getPipelineWithSubscribers(id);
      if (!existing) throw new NotFoundError("Pipeline not found");

      const updated = await updatePipeline(id, name, actionType);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// delete /api/pipelines/:id
pipelinesRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const existing = await getPipelineWithSubscribers(id);
      if (!existing) throw new NotFoundError("Pipeline not found");

      await deletePipeline(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
