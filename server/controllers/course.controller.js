import asyncHandler from "../middlewares/ayncHandler.middleware.js";
import Course from "../models/course.model.js";
import AppError from "../utils/appError.js";

/**
 * @GET_ALL_COURSE
 * @ROUTE @GET {{URL}}/api/v1/course/
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

/**
 * @CREATE_COURSE
 * @ROUTE @POST {{URL}}/api/v1/course/
 * @ACCESS private
 * get fields -> validate fields -> add to db -> check if successfully added
 */
export const createCourse = asyncHandler(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy) {
    return next(new AppError("All fields are required", 400));
  }

  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
    thumbnail: {
      public_id: "public_id", // temporal string for now
      secure_url: "secure_url", // temporal string for
    },
  });

  if (!course) {
    return next(
      new AppError("Course could not be created, please try again", 400)
    );
  }

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    course,
  });
});
/**
 * @GET_LECTURES_BY_COURSE_ID
 * @ROUTE @GET {{URL}}/api/v1/course/
 * @ACCESS private
 * get course id -> make sure id is present -> db fetch -> check if successfully fetch
 */
export const getLecturesByCourseId = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id);

  if (!course) {
    return next(new AppError("Invalid course id or course not found.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Course lectures fetched successfully",
    lectures: course.lectures,
  });
});
