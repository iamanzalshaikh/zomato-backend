import "dotenv/config";
import mongoose from "mongoose";
import { beforeAll, afterAll } from "vitest";
import connectDB from "../src/config/db.js";
import { connectRedis } from "../src/config/redis.js";
import redisClient from "../src/config/redis.js";

process.env.NODE_ENV = "test";

beforeAll(async () => {
  await connectDB();
  try {
    await connectRedis();
  } catch {
    console.warn("Redis not available — some auth tests may fail");
  }
}, 60_000);

afterAll(async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  await mongoose.disconnect();
}, 30_000);
