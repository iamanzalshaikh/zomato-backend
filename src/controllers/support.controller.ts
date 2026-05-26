import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  createSupportTicket,
  listCustomerTickets,
  getTicketById,
  addTicketReply,
  updateTicketAsCustomer,
} from "../services/support.service.js";

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

// POST /support/tickets
export const createTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticket = await createSupportTicket({
      customerId: req.userId!,
      ...req.body,
    });
    sendSuccess(res, "Support ticket created", { ticket }, 201);
  } catch (err) {
    next(err);
  }
};

// GET /support/tickets
export const listTickets = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await listCustomerTickets(req.userId!, {
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
      status: req.query.status as string | undefined,
    });
    sendSuccess(res, "Tickets fetched", result);
  } catch (err) {
    next(err);
  }
};

// GET /support/tickets/:ticketId
export const getTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticket = await getTicketById(paramId(req.params.ticketId), {
      userId: req.userId,
    });
    sendSuccess(res, "Ticket fetched", { ticket });
  } catch (err) {
    next(err);
  }
};

// POST /support/tickets/reply
export const replyToTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = req.body.ticketId ?? paramId(req.params.ticketId);
    const ticket = await addTicketReply({
      ticketId,
      authorId: req.userId!,
      authorRole: "customer",
      message: req.body.message,
    });
    sendSuccess(res, "Reply added", { ticket });
  } catch (err) {
    next(err);
  }
};

// PATCH /support/tickets/:ticketId — customer close only
export const updateTicket = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticket = await updateTicketAsCustomer(
      paramId(req.params.ticketId),
      req.userId!,
      req.body.status,
    );
    sendSuccess(res, "Ticket updated", { ticket });
  } catch (err) {
    next(err);
  }
};
