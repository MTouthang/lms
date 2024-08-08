import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorMiddleware from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user.routes.js";

config();
const app = express();

// Middlewares
// Built-In
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Third-Party
app.use(cors());
app.use(cookieParser());
app.use(morgan("dev"));

// user routes
app.use("/api/v1/user", userRoutes);

app.use(errorMiddleware);

export default app;
