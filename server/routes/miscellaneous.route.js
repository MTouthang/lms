import { Router } from "express";
import {
  contactUs,
  userStats,
} from "../controllers/miscellaneous.controller.js";
import { authorizeRoles, isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

// {{URL}}/api/v1/
router.route("/contact").post(contactUs);
router.route("/user-stats").get(isLoggedIn, authorizeRoles("ADMIN"), userStats);

export default router;
