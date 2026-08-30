const mongoose = require("mongoose");

const detectionSchema = new mongoose.Schema(
  {
    damageType: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
    },

    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    location: {
      road: {
        type: String,
        default: "Unknown Road",
      },

      area: {
        type: String,
        default: "Unknown Area",
      },
    },

    aiModel: {
      type: String,
      default: "YOLOv8 RoadGuard",
    },

    modelVersion: {
      type: String,
      default: "1.0.0",
    },

    status: {
      type: String,
      default: "Detected",
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Detection",
  detectionSchema
);