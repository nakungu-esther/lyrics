import type { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/tokens.js";
import { getUserById } from "../services/authService.js";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isActive: boolean;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

export {};

/** Alias used in curriculum docs (`requireAuth()`). */
export const requireAuth = authenticate;

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice(7)
    : undefined;

  if (!token) {
    res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    });
    return;
  }

  try {
    const payload = await verifyAccessToken(token);
    const user = await getUserById(payload.sub);
    if (!user) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "User not found or account suspended",
        },
      });
      return;
    }
    req.auth = user;
    next();
  } catch {
    res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    });
  }
}

export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    next();
    return;
  }
  verifyAccessToken(token)
    .then(async (payload) => {
      const user = await getUserById(payload.sub);
      if (user) {
        req.auth = user;
      }
      next();
    })
    .catch(() => next());
}
