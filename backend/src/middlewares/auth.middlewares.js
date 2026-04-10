import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../models/blackList.model.js";
import { ApiError } from "../utils/apiError.js";

export async function authUser(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "token not provided.");
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });

    if (isTokenBlacklisted) {
      throw new ApiError(401, "token is invalid");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "invalid token"));
  }
}

