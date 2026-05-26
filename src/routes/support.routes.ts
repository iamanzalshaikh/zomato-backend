import { Router } from "express";
import isAuth from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createTicketSchema,
  addReplySchema,
  customerUpdateTicketSchema,
} from "../validators/support.validator.js";
import {
  createTicket,
  listTickets,
  getTicket,
  replyToTicket,
  updateTicket,
} from "../controllers/support.controller.js";

const router = Router();

router.use(isAuth);

router.post("/tickets", validate(createTicketSchema), asyncHandler(createTicket));
router.get("/tickets", asyncHandler(listTickets));
router.get("/tickets/:ticketId", asyncHandler(getTicket));
router.post("/tickets/reply", validate(addReplySchema), asyncHandler(replyToTicket));
router.patch(
  "/tickets/:ticketId",
  validate(customerUpdateTicketSchema),
  asyncHandler(updateTicket),
);

export default router;
