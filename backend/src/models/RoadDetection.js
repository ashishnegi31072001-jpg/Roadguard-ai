const mongoose = require("mongoose");

const roadDetectionSchema = new mongoose.Schema(
  {
    // ---------------------------------------------------------
    // Detection Information
    // ---------------------------------------------------------

    damageType: {
      type: String,
      required: true,
      enum: [
        "Pothole",
        "Crack",
        "Surface Damage",
        "Road Wear",
        "Other",
      ],
    },

    severity: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Critical"],
    },

    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    // ---------------------------------------------------------
    // Media
    // ---------------------------------------------------------

    mediaType: {
      type: String,
      enum: ["Image", "Video"],
      default: "Image",
    },

    mediaUrl: {
      type: String,
      default: null,
    },

    // ---------------------------------------------------------
    // Location
    // ---------------------------------------------------------

    location: {
      address: {
        type: String,
        default: "Unknown",
      },

      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    // ---------------------------------------------------------
    // AI Model Information
    // ---------------------------------------------------------

    aiModel: {
      type: String,
      default: "YOLOv8 RoadGuard",
    },

    modelVersion: {
      type: String,
      default: "1.0.0",
    },

    // ---------------------------------------------------------
    // Detection Status
    // ---------------------------------------------------------

    status: {
      type: String,
      enum: [
        "Detected",
        "Verified",
        "Reported",
        "In Maintenance",
        "Resolved",
      ],
      default: "Detected",
    },

    // ---------------------------------------------------------
    // Additional Information
    // ---------------------------------------------------------

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

const RoadDetection = mongoose.model(
  "RoadDetection",
  roadDetectionSchema
);

module.exports = RoadDetection;