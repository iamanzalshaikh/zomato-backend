import express from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import usersRoutes from "./users.routes.js";
import restaurantsRoutes from "./restaurants.routes.js";
import menuRoutes from "./menu.routes.js";
import cartRoutes from "./cart.routes.js";
import ordersRoutes from "./orders.routes.js";
import ridersRoutes from "./riders.routes.js";
import paymentsRoutes from "./payments.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import adminRoutes from "./admin.routes.js";
import supportRoutes from "./support.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import searchRoutes from "./search.routes.js";
import reviewsRoutes from "./reviews.routes.js";
import publicRoutes from "./public.routes.js";
import systemRoutes from "./system.routes.js";
import couponsRoutes from "./coupons.routes.js";

const router: express.Router = express.Router();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health Check
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 */
router.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    service: "Food App API v1",
  });
});

router.use("/system", systemRoutes);
router.use("/public", publicRoutes);
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/restaurants", restaurantsRoutes);
router.use("/menu", menuRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", ordersRoutes);
router.use("/riders", ridersRoutes);
router.use("/payments", paymentsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/admin", adminRoutes);
router.use("/support", supportRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/search", searchRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/profile", profileRoutes);
router.use("/coupons", couponsRoutes);

export default router;
