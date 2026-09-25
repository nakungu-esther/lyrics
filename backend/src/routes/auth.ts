import { Router } from "express";

import cookieParser from "cookie-parser";

import { env } from "../config/env.js";

import { authenticate } from "../middleware/auth.js";

import { asyncHandler } from "../middleware/asyncHandler.js";

import { authRateLimiter } from "../middleware/authRateLimit.js";

import { sendAuthResult, sendError } from "../lib/apiResponse.js";

import {

  AuthError,

  getUserById,

  loginUser,

  logoutByRefreshToken,

  registerUser,

  toPublicUser,

} from "../services/authService.js";

import { hashRefreshToken, signAccessToken } from "../lib/tokens.js";

import { loginSchema, registerSchema } from "../lib/validation.js";

import { prisma } from "../lib/prisma.js";



const REFRESH_COOKIE = "nyimba_refresh";



export const authRouter = Router();

authRouter.use(cookieParser());



function setRefreshCookie(res: import("express").Response, token: string): void {

  res.cookie(REFRESH_COOKIE, token, {

    httpOnly: true,

    secure: env.cookieSecure,

    sameSite: "lax",

    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,

    path: "/api/v1/auth",

  });

}



function clearRefreshCookie(res: import("express").Response): void {

  res.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });

}



authRouter.post("/register", authRateLimiter, asyncHandler(async (req, res) => {

  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {

    sendError(res, 400, "Validation failed", [parsed.error.flatten()]);

    return;

  }



  try {

    const result = await registerUser(parsed.data);

    setRefreshCookie(res, result.refreshToken);

    sendAuthResult(res, 201, {

      user: result.user,

      accessToken: result.accessToken,

    });

  } catch (err) {

    if (err instanceof AuthError) {

      const status = err.code === "EMAIL_TAKEN" ? 409 : 400;

      sendError(res, status, err.message, [{ code: err.code }]);

      return;

    }

    throw err;

  }

}));



authRouter.post("/login", authRateLimiter, asyncHandler(async (req, res) => {

  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {

    sendError(res, 400, "Validation failed", [parsed.error.flatten()]);

    return;

  }



  try {

    const result = await loginUser(parsed.data);

    setRefreshCookie(res, result.refreshToken);

    sendAuthResult(res, 200, {

      user: result.user,

      accessToken: result.accessToken,

    });

  } catch (err) {

    if (err instanceof AuthError) {

      const status =

        err.code === "INVALID_CREDENTIALS" || err.code === "ACCOUNT_DISABLED"

          ? 401

          : 400;

      sendError(res, status, err.message, [{ code: err.code }]);

      return;

    }

    throw err;

  }

}));



authRouter.post("/refresh", asyncHandler(async (req, res) => {

  const refresh = req.cookies?.[REFRESH_COOKIE] as string | undefined;

  if (!refresh) {

    sendError(res, 401, "No session");

    return;

  }



  const refreshHash = hashRefreshToken(refresh);

  const session = await prisma.session.findUnique({

    where: { refreshHash },

    include: { user: true },

  });



  if (

    !session ||

    session.expiresAt < new Date() ||

    !session.user.isActive ||

    session.user.suspendedAt

  ) {

    clearRefreshCookie(res);

    sendError(res, 401, "Session expired");

    return;

  }



  const accessToken = await signAccessToken({

    sub: session.user.id,

    email: session.user.email,

    role: session.user.role,

  });



  sendAuthResult(res, 200, {

    user: toPublicUser(session.user),

    accessToken,

  });

}));



authRouter.post("/logout", asyncHandler(async (req, res) => {

  const refresh = req.cookies?.[REFRESH_COOKIE] as string | undefined;

  if (refresh) {

    await logoutByRefreshToken(refresh);

  }

  clearRefreshCookie(res);

  res.json({ success: true, data: { ok: true }, ok: true });

}));



authRouter.get("/me", authenticate, asyncHandler(async (req, res) => {

  const user = await getUserById(req.auth!.id);

  if (!user) {

    sendError(res, 401, "User not found or account disabled");

    return;

  }

  res.json({ success: true, data: { user }, user });

}));



/** Dashboard summary (no AI / media yet) */

authRouter.get("/dashboard", authenticate, asyncHandler(async (req, res) => {

  const userId = req.auth!.id;

  const role = req.auth!.role;



  const [playlistCount, videoProjectCount] = await Promise.all([

    prisma.playlist.count({ where: { ownerUserId: userId } }),

    prisma.videoProject.count({ where: { ownerUserId: userId } }),

  ]);



  let songCount = 0;

  if (role === "ARTIST" || role === "ADMIN") {

    songCount = await prisma.song.count({

      where: { artist: { ownerUserId: userId } },

    });

  }



  res.json({

    success: true,

    data: {

      user: req.auth,

      stats: {

        songs: songCount,

        playlists: playlistCount,

        videos: videoProjectCount,

        recentlyPlayed: [],

      },

    },

    user: req.auth,

    stats: {

      songs: songCount,

      playlists: playlistCount,

      videos: videoProjectCount,

      recentlyPlayed: [],

    },

  });

}));


