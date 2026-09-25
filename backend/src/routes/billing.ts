import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

export const billingRouter = Router();

/** Phase 25 stub — plans only; payments integrate later. */
billingRouter.get("/plans", (_req, res) => {
  res.json({
    plans: [
      {
        id: "FREE",
        name: "Free",
        features: ["Basic lyrics", "Basic templates", "Limited rendering"],
      },
      {
        id: "PRO",
        name: "Pro",
        features: ["HD videos", "Premium templates", "More renders", "Advanced animations", "Analytics"],
      },
      {
        id: "ARTIST_PRO",
        name: "Artist Pro",
        features: [
          "Artist profile",
          "Verified lyrics",
          "Unlimited songs",
          "Advanced video tools",
          "Analytics",
        ],
      },
    ],
  });
});

billingRouter.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.id },
    select: { subscriptionPlan: true },
  });
  res.json({ plan: user?.subscriptionPlan ?? "FREE" });
});
