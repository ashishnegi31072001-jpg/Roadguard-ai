const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Upload Directory
|--------------------------------------------------------------------------
*/

const uploadDir = path.join(
  __dirname,
  "../../uploads"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

/*
|--------------------------------------------------------------------------
| Multer Storage
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

/*
|--------------------------------------------------------------------------
| File Filter
|--------------------------------------------------------------------------
*/

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, and WEBP images are allowed"
      ),
      false
    );
  }
};

/*
|--------------------------------------------------------------------------
| Multer
|--------------------------------------------------------------------------
*/

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/*
|--------------------------------------------------------------------------
| POST /api/uploads
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const imageUrl =
        `/uploads/${req.file.filename}`;

      console.log(
        "Image uploaded:",
        req.file.filename
      );

      console.log(
        "Image URL:",
        imageUrl
      );

      return res.status(201).json({
        success: true,
        message: "Image uploaded successfully",

        filename:
          req.file.filename,

        originalName:
          req.file.originalname,

        mimetype:
          req.file.mimetype,

        size:
          req.file.size,

        imageUrl,
      });
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Image upload failed",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| POST /api/uploads/image
|--------------------------------------------------------------------------
|
| Compatibility route.
| Your current frontend is calling this URL.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/image",
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const imageUrl =
        `/uploads/${req.file.filename}`;

      console.log(
        "Image uploaded:",
        req.file.filename
      );

      return res.status(201).json({
        success: true,
        message: "Image uploaded successfully",

        filename:
          req.file.filename,

        originalName:
          req.file.originalname,

        mimetype:
          req.file.mimetype,

        size:
          req.file.size,

        imageUrl,
      });
    } catch (error) {
      console.error(
        "Upload error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Image upload failed",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

router.use(
  (error, req, res, next) => {
    console.error(
      "Upload middleware error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Upload failed",
    });
  }
);

module.exports = router;