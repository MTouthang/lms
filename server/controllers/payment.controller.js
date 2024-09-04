import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import User from "../models/user.model.js";
import { razorpay } from "../server.js";
import AppError from "../utils/appError.js";

/**
 * @BUY_SUBSCRIPTION_PLAN
 * @ROUTE @POST {{URL}}/api/v1/payments/subscribe
 * @ACCESS private
 * userId -> find user -> check role(admin cannot purchase)
 * -> create razorpay subscription plan -> persist subscription status -> save
 */
export const buySubScriptionPlan = asyncHandler(async (req, res, next) => {
  // get user ID from middleware
  const { id } = req.user;

  // finding user
  const user = await User.findById(id);

  // check role
  if (user.role === "ADMIN") {
    return next(new AppError("Admin cannot buy subscription", 400));
  }

  // create razorpay subscription
  const subscription = await razorpay.subscriptions.create({
    plan_id: process.env.RAZORPAY_PLAN_ID, // unique plan ID
    customer_notify: 1, // 1 means razorpay will notify the customer 0 means razorpay will not notify the customer
    total_count: 12, // 12 means annually subscript
  });

  // adding the ID and status to the account
  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;

  // save to db
  // Saving the user object
  await user.save();

  res.status(200).json({
    success: true,
    message: "subscribed successfully",
    subscription_id: subscription.id,
  });
});
