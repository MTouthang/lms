import express from "express";
import {
  buySubScriptionPlan,
  cancelSubscription,
  getRazorpayAPIKey,
  verifySubscription,
} from "../controllers/payment.controller.js";
import { authorizeRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.route("/subscribe").post(isLoggedIn, buySubScriptionPlan);

router.route("/verify").post(isLoggedIn, verifySubscription);
router.route("/unsubscribe").post(isLoggedIn, cancelSubscription);
router
  .route("/razorpay-key")
  .get(isLoggedIn, authorizeRoles("ADMIN"), getRazorpayAPIKey);

export default router;
