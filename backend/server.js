const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

const connectDatabase = require("./src/config/database");

const detectionRoutes = require("./src/routes/detectionRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

connectDatabase();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Static Uploads
|--------------------------------------------------------------------------
*/

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/detections", detectionRoutes);
app.use("/api/uploads", uploadRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RoadGuard AI Backend is running",
    database: "MongoDB",
    status: "Online",
  });
});

/*
|--------------------------------------------------------------------------
| Upload Route Test
|--------------------------------------------------------------------------
*/

app.get("/api/uploads", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Upload API is working",
  });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log(`
==========================================
        RoadGuard AI Backend
==========================================

✅ Server running:
http://localhost:${PORT}

✅ Health Check:
http://localhost:${PORT}/

✅ Detection API:
http://localhost:${PORT}/api/detections

✅ Upload API:
http://localhost:${PORT}/api/uploads

✅ Upload Files:
http://localhost:${PORT}/uploads/

==========================================
  `);
});