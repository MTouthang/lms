import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import Course from "../models/course.model.js";
import AppError from "../utils/appError.js";
import fs from "fs/promises";
import path from "path";

import cloudinary from "cloudinary";

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

/**
 * @ADD_LECTURES_TO_COURSE
 * @ROUTE @POST {{URL}}/api/v1/course/
 * @ACCESS private
 * get course ID -> gather lectures data fields -> validate fields -> check for the course existence -> check if field is present upload to cloudinary (using the fs/promise and path)
 */

export const addLecturesToCourseById = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const { id } = req.params;

  let lectureData = {};

  if (!title || !description) {
    return next(new AppError("Title and Description are required", 400));
  }

  const course = await Course.findById(id);

  if (!course) {
    return next(new AppError("Invalid course id or course not found.", 400));
  }

  // Run only if user sends a file
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms", // Save files in a folder named lms
        chunk_size: 50000000, // 50 mb size
        resource_type: "video",
      });

      // If success
      if (result) {
        // Set the public_id and secure_url in array
        lectureData.public_id = result.public_id;
        lectureData.secure_url = result.secure_url;
      }

      // After successful upload remove the file from local storage
      fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
      // Empty the uploads directory without deleting the uploads directory
      for (const file of await fs.readdir("uploads/")) {
        await fs.unlink(path.join("uploads/", file));
      }

      // Send the error message
      return next(
        new AppError(
          JSON.stringify(error) || "File not uploaded, please try again",
          400
        )
      );
    }
  }

  course.lectures.push({
    title,
    description,
    lecture: lectureData,
  });

  course.numberOfLectures = course.lectures.length;

  // Save the course object
  await course.save();

  res.status(200).json({
    success: true,
    message: "Course lecture added successfully",
    course,
  });
});

/**
 * @ADD_LECTURES_TO_COURSE
 * @ROUTE @DELETE {{URL}}/api/v1/course/
 * @ACCESS private
 * get course and lecture ID -> validate the course and lecture ID -> remove the lecture using splice method -> update the course and lecture
 */
export const removeLectureFromCourse = asyncHandler(async (req, res, next) => {
  // Grabbing the courseId and lectureId from req.query
  const { courseId, lectureId } = req.params;

  // Checking if both courseId and lectureId are present
  if (!courseId) {
    return next(new AppError("Course ID is required", 400));
  }

  if (!lectureId) {
    return next(new AppError("Lecture ID is required", 400));
  }

  // Find the course using the courseId
  const course = await Course.findById(courseId);

  // If no course send custom message
  if (!course) {
    return next(new AppError("Invalid ID or Course does not exist.", 404));
  }

  // Find the index of the lecture using the lectureId
  const lectureIndex = course.lectures.findIndex(
    (lecture) => lecture._id.toString() === lectureId.toString()
  );

  // If returned index is -1 then send error as mentioned below
  if (lectureIndex === -1) {
    return next(new AppError("Lecture does not exist.", 404));
  }

  // Remove the lecture from the array
  course.lectures.splice(lectureIndex, 1);

  // update the number of lectures based on lectures array length
  course.numberOfLectures = course.lectures.length;

  // Save the course object
  await course.save();

  // Return response
  res.status(200).json({
    success: true,
    message: "Course lecture removed successfully",
  });
});
