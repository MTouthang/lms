import express from "express";
import {
  createCourse,
  getAllCourse,
} from "../controllers/course.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", getAllCourse);
router.post("/", isLoggedIn, createCourse);

export default router;
