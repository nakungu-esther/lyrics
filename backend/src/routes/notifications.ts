import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService.js";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get("/me", async (req, res) => {
  const notifications = await listNotifications(req.auth!.id);
  res.json({ notifications });
});

notificationsRouter.post("/:id/read", async (req, res) => {
  await markNotificationRead(req.auth!.id, String(req.params.id));
  res.json({ ok: true });
});

notificationsRouter.post("/read-all", async (req, res) => {
  await markAllNotificationsRead(req.auth!.id);
  res.json({ ok: true });
});
