import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../models/blackList.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };
}

/**
 * @name registerUserController
 * @description This controller will handle the registration of a new user.
 *  It will receive the user data from the request body,
 *  validate it, and then create a new user in the database.
 * @access Public
 */
const registerUserController = asyncHandler(async (req, res) => {

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const isUserAlreadyExist = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isUserAlreadyExist) {
    throw new ApiError(400, "User already exists");
  }

  const user = await userModel.create({ username, email, password });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
    
  );

  res.cookie("token", token, getCookieOptions());

  res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      },
      "User registered successfully"
    )
  );

});

/**
 * @loginUserController
 * @description login new user
 * @access registered user
 * 
 */
const loginUserController = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    throw new ApiError(400, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, getCookieOptions());

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      },
      "User logged in successfully"
    )
  );

});

/**
 * @logoutUserController
 * @description login new user
 * @access registered user
 * 
 */
const logoutUserController = asyncHandler(async (req, res) => {

  const token = req.cookies.token;

  if (token) {
    await tokenBlacklistModel.create({ token });
  }

  res.clearCookie("token", getCookieOptions());

  res.status(200).json(
    new ApiResponse(200, {}, "User logged out successfully")
  );

});
/**
 * @getMeController
 * @description get the current loggedIn user details
 * @access Private
 * 
 */
const getMeController = asyncHandler(async(req,res) => {
   const user = await userModel.findById(req.user.id)
if (!user) {
  throw new ApiError(404, "User not found");
}
   res.status(200).json(
  new ApiResponse(
    200,
    {
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    },
    "User fetched successfully"
  )
);
})
export { 
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
 };
