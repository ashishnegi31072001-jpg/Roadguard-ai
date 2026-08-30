const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

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
|   imageUrl: "/uploads/example.jpg"
| }
|
| Backend:
|
| 1. Finds uploaded image
| 2. Sends image to Python AI service
| 3. Receives YOLO detections
| 4. Saves result to MongoDB
| 5. Sends result back to frontend
|
|--------------------------------------------------------------------------
*/

router.post("/analyze", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate image URL
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
    | Find uploaded image
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
    | Check image exists
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
        | Fallback Severity Logic
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
| Deletes all detection records from MongoDB.
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
| GET SINGLE DETECTION
|--------------------------------------------------------------------------
*/

router.get("/:id", async (req, res) => {
  try {
    const detection =
      await Detection.findById(
        req.params.id
      );

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