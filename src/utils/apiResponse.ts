import { Response } from "express";
import { IApiResponse } from "../types/index.js";

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
) => {
  const body: IApiResponse<T> = { success: true, message };
  if (data !== undefined) body.data = data;
  res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  error?: string,
) => {
  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};
