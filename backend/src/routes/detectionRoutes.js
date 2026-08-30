const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const mongoose = require("mongoose");

const Detection = require("../models/Detection");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL DETECTIONS
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const detections = await Detection.find().sort({
      createdAt: -1,
    });

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
|
| Frontend sends:
|
| {
|   imageUrl: "/uploads/example.jpg",
|   latitude: 30.306697,
|   longitude: 77.949907
| }
|
| Backend:
|
| 1. Finds uploaded image
| 2. Sends image to Python AI service
| 3. Receives YOLO detections
| 4. Determines best detection
| 5. Saves detection + GPS to MongoDB
| 6. Returns result to frontend
|
|--------------------------------------------------------------------------
*/

router.post("/analyze", async (req, res) => {
  try {
    const {
      imageUrl,
      latitude,
      longitude,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate Image URL
    |--------------------------------------------------------------------------
    */

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "imageUrl is required",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Uploaded Image
    |--------------------------------------------------------------------------
    */

    const cleanPath = imageUrl.replace(/^[/\\]+/, "");

    const imagePath = path.join(
      __dirname,
      "../../",
      cleanPath
    );

    console.log("Image URL:", imageUrl);
    console.log("Image path:", imagePath);

    /*
    |--------------------------------------------------------------------------
    | Check Image Exists
    |--------------------------------------------------------------------------
    */

    if (!fs.existsSync(imagePath)) {
      console.error(
        "Uploaded image not found:",
        imagePath
      );

      return res.status(404).json({
        success: false,
        message: "Uploaded image not found",
        imageUrl,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare FormData
    |--------------------------------------------------------------------------
    */

    const formData = new FormData();

    formData.append(
      "image",
      fs.createReadStream(imagePath)
    );

    /*
    |--------------------------------------------------------------------------
    | Send Image To Python AI Service
    |--------------------------------------------------------------------------
    */

    console.log(
      "Sending image to AI service..."
    );

    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/detect",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },

        maxContentLength: Infinity,
        maxBodyLength: Infinity,

        timeout: 120000,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | AI Response
    |--------------------------------------------------------------------------
    */

    const aiData = aiResponse.data;

    console.log(
      "AI response:",
      JSON.stringify(aiData, null, 2)
    );

    /*
    |--------------------------------------------------------------------------
    | Check AI Response
    |--------------------------------------------------------------------------
    */

    if (!aiData || !aiData.success) {
      return res.status(500).json({
        success: false,
        message:
          aiData?.message ||
          "AI detection failed",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Get Detections
    |--------------------------------------------------------------------------
    */

    const detections =
      aiData.detections || [];

    /*
    |--------------------------------------------------------------------------
    | Determine Best Detection
    |--------------------------------------------------------------------------
    */

    let damageType = "No Damage";
    let confidence = 0;
    let severity = "Low";

    if (detections.length > 0) {
      const bestDetection =
        detections.reduce(
          (best, current) => {
            return current.confidence >
              best.confidence
              ? current
              : best;
          }
        );

      damageType =
        bestDetection.class || "Unknown";

      confidence =
        Number(
          bestDetection.confidence
        ) || 0;

      /*
      |--------------------------------------------------------------------------
      | Use AI Severity
      |--------------------------------------------------------------------------
      */

      if (bestDetection.severity) {
        severity =
          bestDetection.severity;
      } else {
        /*
        |--------------------------------------------------------------------------
        | Fallback Severity
        |--------------------------------------------------------------------------
        */

        if (confidence >= 0.85) {
          severity = "High";
        } else if (confidence >= 0.60) {
          severity = "Medium";
        } else {
          severity = "Low";
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare GPS Location
    |--------------------------------------------------------------------------
    */

    const parsedLatitude =
      latitude !== null &&
      latitude !== undefined &&
      latitude !== ""
        ? Number(latitude)
        : null;

    const parsedLongitude =
      longitude !== null &&
      longitude !== undefined &&
      longitude !== ""
        ? Number(longitude)
        : null;

    /*
    |--------------------------------------------------------------------------
    | Create Detection Document
    |--------------------------------------------------------------------------
    */

    const detection =
      await Detection.create({
        damageType,

        severity,

        confidence,

        imageUrl,

        location: {
          road: "Unknown Road",

          area: "Unknown Area",

          latitude:
            Number.isFinite(parsedLatitude)
              ? parsedLatitude
              : null,

          longitude:
            Number.isFinite(parsedLongitude)
              ? parsedLongitude
              : null,
        },

        aiModel: "YOLOv8",

        modelVersion: "1.0.0",

        status:
          detections.length > 0
            ? "Detected"
            : "No Damage",

        description:
          detections.length > 0
            ? `${damageType} detected by AI`
            : "No road damage detected",
      });

    /*
    |--------------------------------------------------------------------------
    | Successful Response
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,

      message:
        "Road analysis completed successfully",

      detection,

      ai: {
        count:
          aiData.count ||
          detections.length,

        detections,
      },
    });
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | Error Handling
    |--------------------------------------------------------------------------
    */

    console.error(
      "AI analysis error:",
      error.message
    );

    if (error.response) {
      console.error(
        "AI service response:",
        error.response.data
      );
    }

    /*
    |--------------------------------------------------------------------------
    | AI Service Not Running
    |--------------------------------------------------------------------------
    */

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message:
          "AI service is not running. Start the Python AI service on port 8000.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | General Error
    |--------------------------------------------------------------------------
    */

    return res.status(500).json({
      success: false,
      message: "AI analysis failed",
      error: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE ALL DETECTIONS
|--------------------------------------------------------------------------
|
| DELETE:
| http://localhost:5000/api/detections
|
|--------------------------------------------------------------------------
*/

router.delete("/", async (req, res) => {
  try {
    const result =
      await Detection.deleteMany({});

    console.log(
      `Deleted ${result.deletedCount} detections`
    );

    return res.status(200).json({
      success: true,
      message:
        "All detections deleted successfully",
      deletedCount:
        result.deletedCount,
    });
  } catch (error) {
    console.error(
      "Delete detections error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete detections",
    });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE SINGLE DETECTION
|--------------------------------------------------------------------------
|
| DELETE:
| http://localhost:5000/api/detections/:id
|
|--------------------------------------------------------------------------
*/

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    /*
    |--------------------------------------------------------------------------
    | Validate MongoDB ID
    |--------------------------------------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid detection ID",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find And Delete Detection
    |--------------------------------------------------------------------------
    */

    const detection =
      await Detection.findByIdAndDelete(id);

    /*
    |--------------------------------------------------------------------------
    | Detection Not Found
    |--------------------------------------------------------------------------
    */

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: "Detection not found",
      });
    }

    console.log(
      `Deleted detection: ${id}`
    );

    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      message:
        "Detection deleted successfully",
      detectionId: id,
    });
  } catch (error) {
    console.error(
      "Delete single detection error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete detection",
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET SINGLE DETECTION
|--------------------------------------------------------------------------
*/

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    /*
    |--------------------------------------------------------------------------
    | Validate MongoDB ID
    |--------------------------------------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid detection ID",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find Detection
    |--------------------------------------------------------------------------
    */

    const detection =
      await Detection.findById(id);

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: "Detection not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,
      detection,
    });
  } catch (error) {
    console.error(
      "Get detection error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch detection",
    });
  }
});

/*
|--------------------------------------------------------------------------
| EXPORT ROUTER
|--------------------------------------------------------------------------
*/

module.exports = router;