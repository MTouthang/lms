import asyncHandler from "../middlewares/ayncHandler.middleware.js";
import AppError from "../middlewares/appError.js";
import User from "../models/user.model.js";
// cookie options
const cookieOptions = {
  secure: process.env.NODE_ENV === "production" ? true : false, // ensures that the cookie is sent only over HTTPS
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
  httpOnly: true, // cookie accessible only by the server side and prevent client side from accessing
};

/**
 * Register user steps.
 * -> take the input data from req.body
 * -> validation and make sure data are present
 * -> check if user is already present in the database and throw error if present
 * -> create the user with the given data
 * -> check if the user has been created successfully
 * -> if user created successfully generate token
 * - response the success with message and user data (user password should be omitted)
 */
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // check if the data are present
  if (!name || !email || !password) {
    return next(new AppError("All fields are required", 400));
  }

  // Check if the user exists with the provided email
  const userExists = await User.findOne({ email });

  // If user exists send the response
  if (userExists) {
    return next(new AppError("Email already exists", 409));
  }

  // Create new user with the given necessary data and save to DB
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "135",
      secure_url: "random_url",
    },
  });

  // If user not created send message response
  if (!user) {
    return next(
      new AppError("User registration failed, please try again later", 400)
    );
  }

  // Generating a JWT token
  const token = await user.generateJWTToken();

  // Setting the password to undefined so it does not get sent in the response
  user.password = undefined;

  // Setting the token in the cookie with name token along with cookieOptions
  res.cookie("token", token, cookieOptions);

  // If all good send the response to the frontend
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
});
