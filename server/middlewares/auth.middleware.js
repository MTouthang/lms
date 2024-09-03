import AppError from "../utils/appError.js";
import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.middleware.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    // extracting token from the cookies
    const { token } = req.cookies;

    // If no token send unauthorized message
    if (!token) {
      return next(new AppError("Unauthorized, please login to continue", 401));
    }

    // Decoding the token using jwt package verify method
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // If no decode send the message unauthorized
    if (!decoded) {
      return next(new AppError("Unauthorized, please login to continue", 401));
    }

    // If all good store the id in req object, here we are modifying the request object and adding a custom field user in it
    req.user = decoded;

    // Do not forget to call the next otherwise the flow of execution will not be passed further
    next();
  } catch (error) {
    //  handle token expire Error
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token has expired, please login again", 401));
    }
  }
};

// Middleware to check if user is admin or not
export const authorizeRoles = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to view this route", 403)
      );
    }

    next();
  });
