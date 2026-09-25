import { Router } from "express";
import { authenticate } from "../middleware/auth.js";

export const usersRouter = Router();

usersRouter.get("/me", authenticate, (req, res) => {
  res.json({ user: req.auth });
});
