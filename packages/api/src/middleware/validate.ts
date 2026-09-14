import { ApiError } from "../lib/error.js";
import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

const validateBody = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid request body.";
    next(new ApiError(400, "INVALID_REQUEST_BODY", message));
    return;
  }

  req.body = result.data;
  next();
};

export { validateBody };
