import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorMiddleware from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user.route.js";
import courseRoutes from "./routes/course.route.js";
import paymentRoutes from "./routes/payment.route.js";
import miscellaneousRoutes from "./routes/miscellaneous.route.js";

config();
const app = express();

// Middlewares
// Built-In
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Third-Party
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Allow frontend URL
    credentials: true, // Allow cookies & authentication headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);
app.use(cookieParser());
app.use(morgan("dev"));

// user routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/miscellaneous", miscellaneousRoutes);

app.use(errorMiddleware);

export default app;
