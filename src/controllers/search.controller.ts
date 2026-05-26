import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/apiResponse.js";
import {
  globalSearch,
  searchRestaurantsWithTrending,
  searchFoodsWithTrending,
  getTrendingSearches,
} from "../services/search.service.js";

// GET /search?q=
export const searchGlobal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { q, lat, lng, radiusKm, page, limit } = req.query as {
      q: string;
      lat?: string;
      lng?: string;
      radiusKm?: string;
      page?: string;
      limit?: string;
    };

    const result = await globalSearch({
      q,
      lat: lat !== undefined ? Number(lat) : undefined,
      lng: lng !== undefined ? Number(lng) : undefined,
      radiusKm: radiusKm !== undefined ? Number(radiusKm) : undefined,
      page,
      limit,
    });

    sendSuccess(res, "Search results", { search: result });
  } catch (err) {
    next(err);
  }
};

// GET /search/restaurants?q=
export const searchRestaurantsOnly = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { q, page, limit } = req.query as {
      q: string;
      page?: string;
      limit?: string;
    };
    const result = await searchRestaurantsWithTrending(q, page, limit);
    sendSuccess(res, "Restaurant search results", result);
  } catch (err) {
    next(err);
  }
};

// GET /search/foods?q=
export const searchFoodsOnly = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { q, page, limit, restaurantId, foodType } = req.query as {
      q: string;
      page?: string;
      limit?: string;
      restaurantId?: string;
      foodType?: string;
    };
    const result = await searchFoodsWithTrending({
      q,
      page,
      limit,
      restaurantId,
      foodType,
    });
    sendSuccess(res, "Food search results", result);
  } catch (err) {
    next(err);
  }
};

// GET /search/trending
export const searchTrending = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const result = await getTrendingSearches(limit);
    sendSuccess(res, "Trending searches", result);
  } catch (err) {
    next(err);
  }
};
