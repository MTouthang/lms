import app from "./app.js";
import connectToDB from "./configs/dbConn.js";
import { v2 } from "cloudinary";

// Cloudinary configuration
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PORT = process.env.PORT;

app.get("/ping", (_req, res) => {
  res.send("pong");
});

// Default catch all route - 404
app.all("*", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "OOPS!!! 404 Not Found",
  });
});

app.listen(8080, async () => {
  await connectToDB();
  console.log(`App is running at http://localhost:${PORT}`);
});
