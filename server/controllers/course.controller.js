import asyncHandler from "../middlewares/ayncHandler.middleware.js";
import Course from "../models/course.model.js";
import AppError from "../utils/appError.js";

/**
 * @GET_ALL_COURSE
 * @ROUTE @POST {{URL}}/api/v1/course/
 * @ACCESS public
 * fetch from db except lecture, check the length course
 */
export const getAllCourse = asyncHandler(async (_req, res, next) => {
  const courses = await Course.find({}).select("-lectures");

  // If no courses send the same
  if (!courses.length) {
    return next(new AppError("No course found", 404));
  }

  res.status(200).json({
    success: true,
    message: "All courses",
    courses,
  });
});
