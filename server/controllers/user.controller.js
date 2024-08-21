import asyncHandler from "../middlewares/ayncHandler.middleware.js";
import AppError from "../utils/appError.js";
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
 * -> response the success with message and user data (user password should be omitted)
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

/**
 * Login users
 * /**
 * @function loginUser
 * @description Logs in a user by verifying their email and password, generating a JWT token, and setting a cookie.
 * @async
 *
 * @param {string} req.body.email - The email of the user
 * @param {string} req.body.password - The password of the user
 * @param {Function} next - Express next middleware function
 *
 * @throws {AppError} 400 - If email or password is not provided
 * @throws {AppError} 401 - If email or password is incorrect, or user does not exist
 *
 * @returns {Promise<void>} Responds with success message, user data (without password), and sets a cookie with JWT token if login is successful
 * --- Flow ---
 * -> get the field (password, email)
 * -> validate if the email and present
 * -> find the user with email along with the password
 * -> check and compared the password
 * -> generate token and cookie
 * -> response with success message, with user data
 */
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and Password are required", 400));
  }

  // finding the user with sent email
  const user = await User.findOne({ email }).select("+password");
  console.log(user);

  if (!(user && (await user.comparePassword(password)))) {
    return next(
      new AppError("Email or Password do not match or user does not exist", 401)
    );
  }

  // generate token
  const token = await user.generateJWTToken();

  // setting password to undefined so it does not send to the user
  user.password = undefined;

  res.cookie("token", token, cookieOptions);

  // if all good response send to the client
  res.status(200).json({
    success: true,
    message: " User logged in successfully",
    user,
  });
});

/**
 * @function logoutUser
 * @description Logs out a user by clearing the authentication token cookie and sending a success response.
 * @async
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @returns {Promise<void>} Responds with a success message and clears the token cookie
 * @route - api/v1/user/logout
 * --- Flow ---
 * -> clear or set the token to null
 */
export const logoutUser = asyncHandler(async (req, res, next) => {
  // setting cookie to null
  res.cookie("token", null, {
    secure: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 0,
    httpOnly: true,
  });

  // Sending the response
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

export const getLoggedUserDetails = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    message: "User details",
    user,
  });
});
