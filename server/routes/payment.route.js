import express from "express";
import { buySubScriptionPlan } from "../controllers/payment.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.route("/subscribe").post(isLoggedIn, buySubScriptionPlan);

export default router;
