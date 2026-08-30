const RoadDetection = require("../models/RoadDetection");

/*
|--------------------------------------------------------------------------
| Create Detection
|--------------------------------------------------------------------------
*/

const createDetection = async (req, res) => {
  try {
    const detection = await RoadDetection.create(req.body);

    res.status(201).json({
      success: true,
      message: "Road detection created successfully",
      data: detection,
    });
  } catch (error) {
    console.error("Create detection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to create road detection",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get All Detections
|--------------------------------------------------------------------------
*/

const getDetections = async (req, res) => {
  try {
    const detections = await RoadDetection.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: detections.length,
      data: detections,
    });
  } catch (error) {
    console.error("Get detections error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch detections",
      error: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Single Detection
|--------------------------------------------------------------------------
*/

const getDetectionById = async (req, res) => {
  try {
    const detection = await RoadDetection.findById(
      req.params.id
    );

    if (!detection) {
      return res.status(404).json({
        success: false,
        message: "Detection not found",
      });
    }

    res.status(200).json({
      success: true,
      data: detection,
    });
  } catch (error) {
    console.error("Get detection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch detection",
      error: error.message,
    });
  }
};

module.exports = {
  createDetection,
  getDetections,
  getDetectionById,
};