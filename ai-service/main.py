
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image, UnidentifiedImageError
import io
import os
import time


# ==================================================
# ROADGUARD AI SERVICE
# ==================================================

app = FastAPI(
    title="RoadGuard AI Service",
    description="AI service for road damage detection",
    version="1.1.0",
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# MODEL CONFIGURATION
# ==================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "road_damage.pt",
)

print("=" * 50)
print("       RoadGuard AI Service")
print("=" * 50)
print("Loading model:", MODEL_PATH)

if not os.path.isfile(MODEL_PATH):
    raise FileNotFoundError(
        f"Road-damage model not found:\n{MODEL_PATH}\n"
        "Place road_damage.pt inside ai-service/models/."
    )

model = YOLO(MODEL_PATH)

print("Model loaded successfully!")
print("Available classes:")

for class_id, class_name in model.names.items():
    print(f"  {class_id}: {class_name}")


# ==================================================
# DETECTION SETTINGS
# ==================================================

IMAGE_SIZE = 1280
CONFIDENCE_THRESHOLD = 0.25
IOU_THRESHOLD = 0.45
MAX_DETECTIONS = 300


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/")
def home():
    return {
        "success": True,
        "message": "RoadGuard AI Service is running",
        "model": MODEL_PATH,
        "classes": model.names,
        "settings": {
            "image_size": IMAGE_SIZE,
            "confidence_threshold": CONFIDENCE_THRESHOLD,
            "iou_threshold": IOU_THRESHOLD,
            "max_detections": MAX_DETECTIONS,
        },
        "status": "Online",
    }


# ==================================================
# SEVERITY CLASSIFICATION
# ==================================================

def get_severity(confidence: float) -> str:
    """
    Temporary confidence-based classification.
    Confidence is not a measurement of physical damage.
    """

    if confidence >= 0.80:
        return "High"
    elif confidence >= 0.50:
        return "Medium"
    return "Low"


# ==================================================
# ROAD DAMAGE DETECTION
# ==================================================

@app.post("/detect")
async def detect_road_damage(image: UploadFile = File(...)):
    try:
        print("\n" + "=" * 50)
        print("New RoadGuard AI Detection")
        print("=" * 50)
        print("Filename:", image.filename)

        # ------------------------------------------
        # Read uploaded image
        # ------------------------------------------

        image_bytes = await image.read()

        if not image_bytes:
            return {
                "success": False,
                "filename": image.filename,
                "message": "The uploaded image is empty.",
                "detections": [],
                "count": 0,
            }

        print("Image size:", len(image_bytes), "bytes")

        # ------------------------------------------
        # Validate image
        # ------------------------------------------

        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                pil_image = img.convert("RGB")
        except (UnidentifiedImageError, OSError):
            return {
                "success": False,
                "filename": image.filename,
                "message": "Invalid or unsupported image file.",
                "detections": [],
                "count": 0,
            }

        print("Image dimensions:", pil_image.size)

        # ------------------------------------------
        # Run YOLO and measure inference time
        # ------------------------------------------

        print("Running YOLO...")

        start_time = time.perf_counter()

        results = model.predict(
            source=pil_image,
            imgsz=IMAGE_SIZE,
            conf=CONFIDENCE_THRESHOLD,
            iou=IOU_THRESHOLD,
            max_det=MAX_DETECTIONS,
            augment=False,
            verbose=False,
        )

        inference_time_ms = round(
            (time.perf_counter() - start_time) * 1000,
            2,
        )

        print("Inference time:", inference_time_ms, "ms")

        # ------------------------------------------
        # Process detections
        # ------------------------------------------

        detections = []

        for result in results:
            if result.boxes is None:
                continue

            for box in result.boxes:
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())

                class_name = model.names[class_id]

                coordinates = [
                    round(float(value), 2)
                    for value in box.xyxy[0].tolist()
                ]

                x1, y1, x2, y2 = coordinates

                # Skip invalid bounding boxes
                if x2 <= x1 or y2 <= y1:
                    continue

                severity = get_severity(confidence)

                detection = {
                    "class": class_name,
                    "confidence": round(confidence, 4),
                    "severity": severity,
                    "box": coordinates,
                }

                detections.append(detection)

                print(
                    f"Detected: {class_name} | "
                    f"Confidence: {confidence:.4f} | "
                    f"Severity: {severity} | "
                    f"Box: {coordinates}"
                )

        # ------------------------------------------
        # API response
        # ------------------------------------------

        response = {
            "success": True,
            "filename": image.filename,
            "detections": detections,
            "count": len(detections),
            "inference_time_ms": inference_time_ms,
            "image_dimensions": {
                "width": pil_image.width,
                "height": pil_image.height,
            },
        }

        print("-" * 50)
        print("Total detections:", len(detections))
        print("Inference time:", inference_time_ms, "ms")
        print("=" * 50)

        return response

    except Exception as error:
        print("\nAI Detection Error:", repr(error))

        return {
            "success": False,
            "filename": image.filename,
            "message": "AI detection failed. Check the AI service logs.",
            "detections": [],
            "count": 0,
        }

    finally:
        await image.close()


# ==================================================
# RUN SERVER
# ==================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
