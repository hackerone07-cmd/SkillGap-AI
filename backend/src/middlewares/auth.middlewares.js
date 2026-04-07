import jwt, { decode } from "jsonwebtoken"
import tokenBlacklistModel from "../models/blackList.model.js"
import { ApiError } from "../utils/apiError.js"

export async function authUser(req, res, next) {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(" ")[1]

    console.log(req.cookies)
console.log(req.headers.authorization)


  if (!token) {
    return new ApiError(401, "token not provided.");
  }

  const isTokenBlacklist = await tokenBlacklistModel.findOne({ token })

  if (isTokenBlacklist) {
       return new ApiError(401,"token is invalid")
  }
await tokenBlacklistModel.create({ token });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return new ApiError(401, "invalid token");
  }
}

