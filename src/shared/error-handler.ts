import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError, ErrorCode, ErrorStatusCode, ErrorType } from "./errors";
import { env } from "../config/env";

export const notFoundHandler: RequestHandler = (req, res) => {
  res
    .status(ErrorStatusCode.NotFound404Error)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ message: err.message, details: err.details });
  }
  // Mongo duplicate key
  if (err?.code === ErrorCode.MongoDuplicateError) {
    return res
      .status(ErrorStatusCode.Conflict409Error)
      .json({ message: "Resource already exists" });
  }
  // Malformed JSON body
  if (err?.type === ErrorType.JsonParseFailed) {
    return res
      .status(ErrorStatusCode.BadRequest400Error)
      .json({ message: "Malformed JSON body" });
  }
  console.error(err);
  res.status(ErrorStatusCode.InternalServer500Error).json({
    message: "Internal server error",
    ...(env.isProduction ? {} : { details: String(err?.message ?? err) }),
  });
};
