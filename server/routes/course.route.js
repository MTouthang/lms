import express from "express";
import { getAllCourse } from "../controllers/course.controller.js";
const router = express.Router();

router.get("/", getAllCourse);

export default router;
