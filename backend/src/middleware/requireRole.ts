import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { roleAtLeast } from "../lib/permissions.js";

export function requireRole(...allowed: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
      return;
    }

    const ok =
      req.auth!.role === "ADMIN" ||
      allowed.some(
        (role) => req.auth!.role === role || roleAtLeast(req.auth!.role, role),
      );

    if (!ok) {
      res.status(403).json({
        error: { code: "FORBIDDEN", message: "Insufficient permissions" },
      });
      return;
    }

    next();
  };
}
