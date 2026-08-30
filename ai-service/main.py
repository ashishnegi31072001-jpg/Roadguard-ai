from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import os


# ==================================================
# ROADGUARD AI SERVICE
# ==================================================

app = FastAPI(
    title="RoadGuard AI Service",
    description="AI service for road damage detection",
    version="1.0.0",
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
# MODEL
# ==================================================

# IMPORTANT:
# We will use a road-damage-trained YOLO model here.
#
# For the moment keep this as a local .pt file.
#
# Put your road-damage model inside:
#
# ai-service/models/road_damage.pt

MODEL_PATH = os.path.join(
    "models",
    "road_damage.pt"
)


print("==========================================")
print("        RoadGuard AI Service")
print("==========================================")
print("Loading model...")
print("Model:", MODEL_PATH)


if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        f"""
Road damage model not found.

Expected model location:

{os.path.abspath(MODEL_PATH)}

Please place the trained road-damage .pt model
inside the models folder.
"""
    )


model = YOLO(MODEL_PATH)

print("YOLO road-damage model loaded successfully!")

print("Classes:")

for class_id, class_name in model.names.items():
    print(
        f"  {class_id}: {class_name}"
    )


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
        "status": "Online",
    }


# ==================================================
# AI DETECTION
# ==================================================

@app.post("/detect")
async def detect_road_damage(
    image: UploadFile = File(...)
):

    try:

        print("")
        print("==========================================")
        print("New AI Detection")
        print("==========================================")

        print(
            "Filename:",
            image.filename
        )

        # ------------------------------------------
        # Read image
        # ------------------------------------------

        image_bytes = await image.read()

        print(
            "Image size:",
            len(image_bytes),
            "bytes"
        )


        # ------------------------------------------
        # Convert image
        # ------------------------------------------

        pil_image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")


        print(
            "Image dimensions:",
            pil_image.size
        )


        # ------------------------------------------
        # Run YOLO
        # ------------------------------------------

        print("Running YOLO...")

        results = model(
            pil_image,
            conf=0.40,
            iou = 0.50
        )


        # ------------------------------------------
        # Process detections
        # ------------------------------------------    

        detections = []


        for result in results:

            boxes = result.boxes


            if boxes is None:

                continue


            for box in boxes:

                class_id = int(
                    box.cls[0].item()
                )


                confidence = float(
                    box.conf[0].item()
                )


                class_name = model.names[
                    class_id
                ]


                coordinates = [
                    round(float(value), 2)
                    for value in box.xyxy[0].tolist()
                ]


                # ----------------------------------
                # Severity
                # ----------------------------------

                if confidence >= 0.80:

                    severity = "High"

                elif confidence >= 0.50:

                    severity = "Medium"

                else:

                    severity = "Low"


                detection = {

                    "class": class_name,

                    "confidence": round(
                        confidence,
                        4
                    ),

                    "severity": severity,

                    "box": coordinates,

                }


                detections.append(
                    detection
                )


                print(
                    "Detected:",
                    class_name,
                    "| Confidence:",
                    round(
                        confidence,
                        4
                    ),
                    "| Severity:",
                    severity
                )


        # ------------------------------------------
        # Response
        # ------------------------------------------

        response = {

            "success": True,

            "filename": image.filename,

            "detections": detections,

            "count": len(
                detections
            ),

        }


        print(
            "Total detections:",
            len(detections)
        )


        return response


    except Exception as error:

        print("")
        print("AI Detection Error:")
        print(error)


        return {

            "success": False,

            "filename": image.filename,

            "message": str(error),

            "detections": [],

            "count": 0,

        }


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