import { Router } from "express";
import isAdminAuth from "../middlewares/adminAuth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  adminLoginRateLimiter,
  adminApiRateLimiter,
} from "../middlewares/rateLimit.middleware.js";
import {
  adminLoginSchema,
  rejectReasonSchema,
  adminCancelOrderSchema,
} from "../validators/admin.validator.js";
import {
  addReplySchema,
  adminUpdateTicketSchema,
} from "../validators/support.validator.js";
import {
  login,
  dashboard,
  getUsers,
  blockUser,
  unblockUser,
  getRestaurants,
  approveRestaurantHandler,
  rejectRestaurantHandler,
  getRiders,
  approveRiderHandler,
  rejectRiderHandler,
  getOrders,
  cancelOrder,
  getRefunds,
  getSupportTickets,
  getSupportTicket,
  adminReplyTicket,
  resolveSupportTicket,
  bannersStub,
} from "../controllers/admin.controller.js";

const router = Router();

router.post(
  "/login",
  adminLoginRateLimiter,
  validate(adminLoginSchema),
  asyncHandler(login),
);

router.use(isAdminAuth);
router.use(adminApiRateLimiter);

router.get("/dashboard", asyncHandler(dashboard));
router.get("/users", asyncHandler(getUsers));
router.patch("/users/block/:userId", asyncHandler(blockUser));
router.patch("/users/unblock/:userId", asyncHandler(unblockUser));

router.get("/restaurants", asyncHandler(getRestaurants));
router.patch(
  "/restaurants/approve/:restaurantId",
  asyncHandler(approveRestaurantHandler),
);
router.patch(
  "/restaurants/reject/:restaurantId",
  validate(rejectReasonSchema),
  asyncHandler(rejectRestaurantHandler),
);

router.get("/riders", asyncHandler(getRiders));
router.patch("/riders/approve/:riderId", asyncHandler(approveRiderHandler));
router.patch(
  "/riders/reject/:riderId",
  validate(rejectReasonSchema),
  asyncHandler(rejectRiderHandler),
);

router.get("/orders", asyncHandler(getOrders));
router.patch(
  "/orders/cancel/:orderId",
  validate(adminCancelOrderSchema),
  asyncHandler(cancelOrder),
);

router.get("/refunds", asyncHandler(getRefunds));

router.get("/support/tickets", asyncHandler(getSupportTickets));
router.get("/support/tickets/:ticketId", asyncHandler(getSupportTicket));
router.post(
  "/support/tickets/reply",
  validate(addReplySchema),
  asyncHandler(adminReplyTicket),
);
router.patch(
  "/support/tickets/:ticketId",
  validate(adminUpdateTicketSchema),
  asyncHandler(resolveSupportTicket),
);

router.get("/banners", asyncHandler(bannersStub));

export default router;
