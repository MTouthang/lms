import express from "express";
import {
  addLecturesToCourseById,
  createCourse,
  getAllCourse,
  getLecturesByCourseId,
} from "../controllers/course.controller.js";
import { authorizeRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const router = express.Router();

router.get("/", getAllCourse);
router.post("/", isLoggedIn, createCourse);
router.get("/:id", isLoggedIn, getLecturesByCourseId);
router.post(
  "/:id",
  isLoggedIn,
  authorizeRoles("ADMIN"),
  upload.single("lecture"),
  addLecturesToCourseById
);

export default router;
