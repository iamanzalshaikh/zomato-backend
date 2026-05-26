import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse.js";
import config from "../config/config.js";

export const getAppInfo = async (_req: Request, res: Response) => {
  sendSuccess(res, "App info", {
    name: "Food App",
    version: "1.0.0",
    apiVersion: "v1",
    environment: config.NODE_ENV,
  });
};

export const getTerms = async (_req: Request, res: Response) => {
  sendSuccess(res, "Terms of service", {
    content: "Terms placeholder — update before production.",
  });
};
