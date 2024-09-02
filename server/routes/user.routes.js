import { Router } from "express";
import {
  forgotPassword,
  getLoggedUserDetails,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUser,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", isLoggedIn, getLoggedUserDetails);
router.post("/reset", isLoggedIn, forgotPassword);
router.post("/reset/:resetToken", isLoggedIn, resetPassword);
router.post("/update/:id", isLoggedIn, upload.single("avatar"), updateUser);

export default router;
