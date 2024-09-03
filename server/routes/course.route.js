import express from "express";
import {
  createCourse,
  getAllCourse,
  getLecturesByCourseId,
} from "../controllers/course.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", getAllCourse);
router.post("/", isLoggedIn, createCourse);
router.get("/:id", isLoggedIn, getLecturesByCourseId);

export default router;
