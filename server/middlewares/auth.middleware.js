import AppError from "../utils/appError.js";
import jwt from "jsonwebtoken";

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
