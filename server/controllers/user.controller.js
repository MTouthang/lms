import asyncHandler from "../middlewares/ayncHandler.middleware.js";
import AppError from "../utils/appError.js";
import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

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

/**
 * @FORGOT_PASSWORD
 * @ROUTE @POST {{URL}}/api/v1/user/reset
 * @ACCESS Public
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // If no email send email required message
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  // Finding the user via email
  const user = await User.findOne({ email });

  // If no email found send the message email not found
  if (!user) {
    return next(new AppError("Email not registered", 400));
  }

  // Generating the reset token via the method we have in user model
  const resetToken = await user.generatePasswordResetToken();

  // Saving the forgotPassword* to DB
  await user.save();

  // constructing a url to send the correct data
  /**HERE
   * req.protocol will send if http or https
   * req.get('host') will get the hostname
   * the rest is the route that we will create to verify if token is correct or not
   */
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/reset/${resetToken}`;

  // We here need to send an email to the user with the token
  // For now let's log and see it

  // we need to send mail to the user with token
  const subject = "Reset Password";
  const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

  try {
    await sendEmail(email, subject, message);

    // If email sent successfully send the success response
    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email} successfully`,
    });
  } catch (error) {
    // If some error happened we need to clear the forgotPassword* fields in our DB
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    return next(
      new AppError(
        error.message || "Something went wrong, please try again.",
        500
      )
    );
  }
});

/**
 * @RESET_PASSWORD
 * @ROUTE @POST {{URL}}/api/v1/user/reset/:resetToken
 * @ACCESS Public
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Extracting resetToken from req.params object
  const { resetToken } = req.params;
  console.log(resetToken);
  // Extracting password from req.body object
  const { password } = req.body;

  console.log(password);

  // We are again hashing the resetToken using sha256 since we have stored our resetToken in DB using the same algorithm
  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log(forgotPasswordToken);
  // Check if password is not there then send response saying password is required
  if (!password) {
    return next(new AppError("Password is required", 400));
  }

  // Checking if token matches in DB and if it is still valid(Not expired)
  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() }, // $gt will help us check for greater than value, with this we can check if token is valid or expired
  });

  // If not found or expired send the response
  if (!user) {
    return next(
      new AppError("Token is invalid or expired, please try again", 400)
    );
  }

  // Update the password if token is valid and not expired
  user.password = password;

  // making forgotPassword* values undefined in the DB
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  // Saving the updated user values
  await user.save();

  // Sending the response when everything goes good
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
