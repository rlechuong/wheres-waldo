import { ApiError } from "../lib/error.js";
import type { Request, Response, NextFunction } from "express";

const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  console.error(err);
  res
    .status(500)
    .json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." } });
};

export { errorHandler };
