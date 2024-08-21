import { Router } from "express";
import {
  getLoggedUserDetails,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", isLoggedIn, getLoggedUserDetails);

export default router;
