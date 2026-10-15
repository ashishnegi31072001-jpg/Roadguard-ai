
const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const mongoose = require("mongoose");

const Detection = require("../models/Detection");

const router = express.Router();

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

const MODEL_VERSION = "1.0.0";

/*
|--------------------------------------------------------------------------
| GET ALL DETECTIONS
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const detections = await Detection.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: detections.length,
      detections,
    });
  } catch (error) {
    console.error("Get detections error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch detections",
    });
  }
});

/*
|--------------------------------------------------------------------------
| ANALYZE IMAGE
|--------------------------------------------------------------------------
| POST /api/detections/analyze
|
| Body:
| {
|   "imageUrl": "/uploads/example.jpg",
|   "latitude": 30.306697,
|   "longitude": 77.949907
| }
|--------------------------------------------------------------------------
*/

router.post("/analyze", async (req, res) => {
  try {
    const { imageUrl, latitude, longitude } = req.body || {};

    if (
      typeof imageUrl !== "string" ||
      !imageUrl.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid imageUrl is required",
      });
    }

    // Only allow files inside the backend uploads directory.
    const filename = path.basename(imageUrl.trim());

    if (
      !/^uploads[\\/]/i.test(imageUrl.trim()) &&
      !imageUrl.trim().startsWith("/uploads/")
    ) {
      return res.status(400).json({
        success: false,
        message: "imageUrl must point to an uploaded file",
      });
    }

    const uploadsDir = path.resolve(__dirname, "../../uploads");
    const imagePath = path.resolve(uploadsDir, filename);

    if (
      !imagePath.startsWith(uploadsDir + path.sep) ||
      !fs.existsSync(imagePath) ||
      !fs.statSync(imagePath).isFile()
    ) {
      return res.status(404).json({
        success: false,
        message: "Uploaded image not found",
      });
    }

    const formData = new FormData();

    formData.append(
      "image",
      fs.createReadStream(imagePath)
    );

    console.log("Sending image to AI service:", filename);

    const aiResponse = await axios.post(
      `${AI_SERVICE_URL}/detect`,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 120000,
      }
    );

    const aiData = aiResponse.data;

    if (
      !aiData ||
      aiData.success !== true ||
      !Array.isArray(aiData.detections)
    ) {
      return res.status(502).json({
        success: false,
        message:
          aiData?.message ||
          "AI service returned an invalid response",
      });
    }

    // Keep valid individual detections, not just the best one.
    const validDetections = aiData.detections.filter(
      (item) =>
        item &&
        typeof item.class === "string" &&
        Number.isFinite(Number(item.confidence)) &&
        Number(item.confidence) >= 0 &&
        Number(item.confidence) <= 1
    );

    const parseCoordinate = (value) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return null;
      }

      const number = Number(value);

      return Number.isFinite(number) ? number : NaN;
    };

    const parsedLatitude = parseCoordinate(latitude);
    const parsedLongitude = parseCoordinate(longitude);

    if (
      (parsedLatitude !== null &&
        (!Number.isFinite(parsedLatitude) ||
          parsedLatitude < -90 ||
          parsedLatitude > 90)) ||
      (parsedLongitude !== null &&
        (!Number.isFinite(parsedLongitude) ||
          parsedLongitude < -180 ||
          parsedLongitude > 180))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid GPS coordinates",
      });
    }

    const location = {
      road: "Unknown Road",
      area: "Unknown Area",
      latitude: parsedLatitude,
      longitude: parsedLongitude,
    };

    const imagePathForClient = `/uploads/${filename}`;

    /*
    |--------------------------------------------------------------------------
    | SAVE EACH DETECTED OBJECT
    |--------------------------------------------------------------------------
    */

    if (validDetections.length === 0) {
      const detection = await Detection.create({
        damageType: "No Damage",
        severity: "Low",
        confidence: 0,
        imageUrl: imagePathForClient,
        location,
        aiModel: "YOLOv8",
        modelVersion: MODEL_VERSION,
        status: "No Damage",
        description: "No road damage detected by AI",
      });

      return res.status(201).json({
        success: true,
        message: "Analysis completed; no damage detected",
        detection,
        ai: {
          count: 0,
          detections: [],
        },
      });
    }

    const documents = validDetections.map((item) => {
      const confidence = Number(item.confidence);

      let severity = item.severity;

      if (
        !["Low", "Medium", "High", "Critical"].includes(
          severity
        )
      ) {
        // Confidence is not the same as physical damage severity.
        // These thresholds are provisional fallbacks only.
        severity =
          confidence >= 0.85
            ? "High"
            : confidence >= 0.60
              ? "Medium"
              : "Low";
      }

      return {
        damageType: item.class,
        severity,
        confidence,
        imageUrl: imagePathForClient,
        location,
        aiModel: "YOLOv8",
        modelVersion: MODEL_VERSION,
        status: "Detected",
        description: `${item.class} detected by AI`,
      };
    });

    const savedDetections = await Detection.insertMany(
      documents,
      { ordered: true }
    );

    const bestDetection = savedDetections.reduce(
      (best, current) =>
        current.confidence > best.confidence
          ? current
          : best
    );

    return res.status(201).json({
      success: true,
      message: "Road analysis completed successfully",
      detection: bestDetection,
      ai: {
        count: validDetections.length,
        detections: validDetections,
      },
      savedCount: savedDetections.length,
    });
  } catch (error) {
    console.error("AI analysis error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message:
          "AI service is not running. Start Python on port 8000.",
      });
    }

    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        success: false,
        message: "AI analysis timed out",
      });
    }

    if (error.response) {
      console.error(
        "AI service response:",
        error.response.data
      );
    }

    return res.status(500).json({
      success: false,
      message: "AI analysis failed",
    });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE ALL DETECTIONS
|--------------------------------------------------------------------------
| DELETE /api/detections
|--------------------------------------------------------------------------
*/

router.delete("/", async (req, res) => {
  try {
    const result = await Detection.deleteMany({});

    return res.status(200).json({
      success: true,
      message: "All detections deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete all detections error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete detections",
    });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE SINGLE DETECTION
|--------------------------------------------------------------------------
| DELETE /api/detections/:id
|--------------------------------------------------------------------------
*/

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid detection ID",
      });
    }

    const detection = await Detection.findByIdAndDelete(id);

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: "Detection not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detection deleted successfully",
      detectionId: id,
    });
  } catch (error) {
    console.error("Delete detection error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete detection",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET SINGLE DETECTION
|--------------------------------------------------------------------------
| GET /api/detections/:id
|--------------------------------------------------------------------------
*/

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid detection ID",
      });
    }

    const detection = await Detection.findById(id);

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: "Detection not found",
      });
    }

    return res.status(200).json({
      success: true,
      detection,
    });
  } catch (error) {
    console.error("Get detection error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch detection",
    });
  }
});

module.exports = router;
