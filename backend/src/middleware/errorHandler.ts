import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { sendError } from "../lib/apiResponse.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (res.headersSent) {
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P1001" || err.code === "P1002" || err.code === "P1017") {
      sendError(
        res,
        503,
        "Database is temporarily unavailable. Check your network and Neon project, then retry.",
        [{ code: err.code }],
      );
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    sendError(res, 503, "Database connection failed. Verify DATABASE_URL in backend/.env.", [
      { code: "DB_INIT" },
    ]);
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    const hint =
      err.message.includes("creatorStudioMode") ||
      err.message.includes("Unknown argument")
        ? " Run npm run db:migrate and npm run db:generate, then restart the API."
        : "";
    sendError(res, 500, `Database schema mismatch.${hint}`, [{ code: "PRISMA_VALIDATION" }]);
    return;
  }

  if (err instanceof Error && /connection is closed/i.test(err.message)) {
    sendError(res, 503, "Background queue unavailable. Retry shortly or start Redis.", [
      { code: "REDIS_CLOSED" },
    ]);
    return;
  }

  if (
    err instanceof Error &&
    (/kind: Closed/i.test(err.message) ||
      /Server has closed the connection/i.test(err.message) ||
      /Connection terminated unexpectedly/i.test(err.message))
  ) {
    sendError(res, 503, "Database connection closed (Neon idle). Refresh and try again.", [
      { code: "DB_CLOSED" },
    ]);
    return;
  }

  console.error("[api] unhandled error:", err);

  const message =
    env.isProduction && err instanceof Error
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Internal server error";

  sendError(res, 500, message);
}
