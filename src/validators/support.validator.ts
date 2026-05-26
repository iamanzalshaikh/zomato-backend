import { z } from "zod";
import { SupportIssueType, TicketStatus } from "../types/enums.js";

export const createTicketSchema = z.object({
  issueType: z.nativeEnum(SupportIssueType),
  description: z.string().min(10).max(2000),
  orderId: z.string().optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

export const addReplySchema = z.object({
  ticketId: z.string().min(1),
  message: z.string().min(1).max(2000),
});

export const customerUpdateTicketSchema = z.object({
  status: z.literal(TicketStatus.CLOSED),
});

export const adminUpdateTicketSchema = z.object({
  status: z
    .enum([
      TicketStatus.OPEN,
      TicketStatus.IN_PROGRESS,
      TicketStatus.RESOLVED,
      TicketStatus.CLOSED,
    ])
    .optional(),
  resolution: z.string().max(2000).optional(),
  assignedAdminId: z.string().optional(),
});
