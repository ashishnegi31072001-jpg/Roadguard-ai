import { useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Target,
  Activity,
  MapPin,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Detection Type
|--------------------------------------------------------------------------
*/

interface AIDetection {
  class: string;
  confidence: number;
  severity?: string;
  box: [number, number, number, number];
}

/*
|--------------------------------------------------------------------------
| AI Result Type
|--------------------------------------------------------------------------
*/

interface AIResult {
  count: number;
  detections: AIDetection[];
}

/*
|--------------------------------------------------------------------------
| MongoDB Detection Result
|--------------------------------------------------------------------------
*/

interface DetectionResult {
  damageType: string;
  severity: string;
  confidence: number;

  location?: {
    road?: string;
    area?: string;
    latitude?: number;
    longitude?: number;
  };

  imageUrl: string;

  aiModel: string;
  modelVersion: string;

  status: string;
  description: string;
}

/*
|--------------------------------------------------------------------------
| GPS Location Type
|--------------------------------------------------------------------------
*/

interface GPSLocation {
  latitude: number;
  longitude: number;
}

/*
|--------------------------------------------------------------------------
| Analyze Road Component
|--------------------------------------------------------------------------
*/

function AnalyzeRoad() {
  /*
  |--------------------------------------------------------------------------
  | File State
  |--------------------------------------------------------------------------
  */

  const [file, setFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string>("");

  /*
  |--------------------------------------------------------------------------
  | Upload State
  |--------------------------------------------------------------------------
  */

  const [uploading, setUploading] =
    useState<boolean>(false);

  const [message, setMessage] =
    useState<string>("");

  /*
  |--------------------------------------------------------------------------
  | Detection Result
  |--------------------------------------------------------------------------
  */

  const [result, setResult] =
    useState<DetectionResult | null>(null);

  /*
  |--------------------------------------------------------------------------
  | AI Detection Result
  |--------------------------------------------------------------------------
  */

  const [aiResult, setAIResult] =
    useState<AIResult | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Image Dimensions
  |--------------------------------------------------------------------------
  */

  const [imageDimensions, setImageDimensions] =
    useState({
      width: 1,
      height: 1,
    });

  /*
  |--------------------------------------------------------------------------
  | GPS Location
  |--------------------------------------------------------------------------
  */

  const [gpsLocation, setGpsLocation] =
    useState<GPSLocation | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Get Current Location
  |--------------------------------------------------------------------------
  */

 const getCurrentLocation = (): Promise<GPSLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          "GPS is not supported by this browser."
        )
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: GPSLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        console.log("📍 GPS Location:", location);

        setGpsLocation(location);

        resolve(location);
      },

      (error) => {
        console.error("❌ GPS Error:", error);

        let message = "Unable to get GPS location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "GPS permission denied. Please allow location access in your browser.";
            break;

          case error.POSITION_UNAVAILABLE:
            message =
              "GPS position is currently unavailable.";
            break;

          case error.TIMEOUT:
            message =
              "GPS request timed out. Please try again.";
            break;
        }

        reject(new Error(message));
      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  });
};
  /*
  |--------------------------------------------------------------------------
  | File Selection
  |--------------------------------------------------------------------------
  */

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate File Type
    |--------------------------------------------------------------------------
    */

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setMessage(
        "Please select a JPG, PNG, or WEBP image."
      );

      setFile(null);
      setPreview("");
      setResult(null);
      setAIResult(null);
      setGpsLocation(null);

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate File Size
    |--------------------------------------------------------------------------
    */

    const maxSize =
      10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setMessage(
        "Image size must be less than 10 MB."
      );

      setFile(null);
      setPreview("");
      setResult(null);
      setAIResult(null);
      setGpsLocation(null);

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Set File
    |--------------------------------------------------------------------------
    */

    setFile(selectedFile);

    setMessage("");

    setResult(null);

    setAIResult(null);

    setGpsLocation(null);

    /*
    |--------------------------------------------------------------------------
    | Create Preview
    |--------------------------------------------------------------------------
    */

    const imageUrl =
      URL.createObjectURL(
        selectedFile
      );

    setPreview(imageUrl);
  };

  /*
  |--------------------------------------------------------------------------
  | Analyze Image
  |--------------------------------------------------------------------------
  */

  const handleAnalyze = async () => {
    console.log(
      "🔥 ANALYZE BUTTON CLICKED"
    );

    if (!file) {
      setMessage(
        "Please select an image first."
      );

      return;
    }

    try {
      setUploading(true);

      setMessage("");

      setResult(null);

      setAIResult(null);

      /*
      |--------------------------------------------------------------------------
      | STEP 1: Get GPS Location
      |--------------------------------------------------------------------------
      */

      let location:
        | GPSLocation
        | null = null;

      try {
        setMessage(
          "Getting your location..."
        );

        location =
          await getCurrentLocation();

        console.log(
          "✅ Location received:",
          location
        );
     } catch (locationError) {
  console.warn(
    "⚠️ Could not get GPS location:",
    locationError
  );

  setGpsLocation(null);

  setMessage(
    locationError instanceof Error
      ? `${locationError.message} Continuing AI analysis...`
      : "GPS unavailable. Continuing AI analysis..."
  );
}

      /*
      |--------------------------------------------------------------------------
      | STEP 2: Upload Image
      |--------------------------------------------------------------------------
      */

      const formData =
        new FormData();

      formData.append(
        "image",
        file
      );

      console.log(
        "📤 Uploading image..."
      );

      const uploadResponse =
        await fetch(
          "http://localhost:5000/api/uploads",
          {
            method: "POST",
            body: formData,
          }
        );

      const uploadData =
        await uploadResponse.json();

      console.log(
        "Upload response:",
        uploadData
      );

      if (
        !uploadResponse.ok ||
        !uploadData.success
      ) {
        throw new Error(
          uploadData.message ||
            "Image upload failed."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | STEP 3: Get Image URL
      |--------------------------------------------------------------------------
      */

      const imageUrl =
        uploadData.file?.url ||
        uploadData.file?.imageUrl ||
        uploadData.imageUrl ||
        uploadData.url ||
        uploadData.fileUrl;

      if (!imageUrl) {
        console.error(
          "❌ Upload response structure:",
          uploadData
        );

        throw new Error(
          "Upload succeeded but image URL was not returned."
        );
      }

      console.log(
        "✅ Final image URL:",
        imageUrl
      );

      /*
      |--------------------------------------------------------------------------
      | STEP 4: Analyze Image
      |--------------------------------------------------------------------------
      */

      setMessage(
        location
          ? "Image uploaded. GPS location captured. AI analysis started..."
          : "Image uploaded. AI analysis started..."
      );

      const detectionResponse =
        await fetch(
          "http://localhost:5000/api/detections/analyze",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              imageUrl,

              latitude:
                location?.latitude ??
                null,

              longitude:
                location?.longitude ??
                null,
            }),
          }
        );

      const detectionData =
        await detectionResponse.json();

      console.log(
        "Detection response:",
        detectionData
      );

      if (
        !detectionResponse.ok ||
        !detectionData.success
      ) {
        throw new Error(
          detectionData.message ||
            "Road analysis failed."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | STEP 5: Store MongoDB Result
      |--------------------------------------------------------------------------
      */

      setResult(
        detectionData.detection
      );

      /*
      |--------------------------------------------------------------------------
      | STEP 6: Store ALL AI Detections
      |--------------------------------------------------------------------------
      */

      if (detectionData.ai) {
        setAIResult({
          count:
            detectionData.ai.count || 0,

          detections:
            detectionData.ai.detections ||
            [],
        });
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      */

      setMessage(
        location
          ? "Road analysis completed successfully with GPS location!"
          : "Road analysis completed successfully!"
      );
    } catch (error) {
      console.error(
        "❌ Analysis error:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setUploading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reset
  |--------------------------------------------------------------------------
  */

  const handleReset = () => {
    setFile(null);

    setPreview("");

    setMessage("");

    setResult(null);

    setAIResult(null);

    setGpsLocation(null);

    setImageDimensions({
      width: 1,
      height: 1,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Severity Color
  |--------------------------------------------------------------------------
  */

  const getSeverityClass = (
    severity: string
  ) => {
    switch (
      severity.toLowerCase()
    ) {
      case "critical":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "high":
        return "border-red-400/30 bg-red-400/10 text-red-400";

      case "medium":
        return "border-orange-400/30 bg-orange-400/10 text-orange-400";

      case "low":
        return "border-yellow-400/30 bg-yellow-400/10 text-yellow-400";

      default:
        return "border-slate-700 bg-slate-900 text-slate-300";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-7">

      {/* ================================================================ */}
      {/* PAGE HEADER */}
      {/* ================================================================ */}

      <div>

        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">

          <ImageIcon className="h-4 w-4" />

          AI Road Inspection

        </div>

        <h1 className="text-3xl font-bold text-white">
          Analyze Road
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Upload a road image and RoadGuard AI
          will analyze it for potholes, cracks,
          and other road damage.
        </p>

      </div>

      {/* ================================================================ */}
      {/* UPLOAD CARD */}
      {/* ================================================================ */}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">

        <div className="border-b border-slate-800 px-5 py-5">

          <h2 className="text-base font-bold text-white">
            Upload Road Media
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Supported formats: JPG, PNG, WEBP
          </p>

        </div>

        <div className="p-5">

          {/* ============================================================ */}
          {/* UPLOAD AREA */}
          {/* ============================================================ */}

          <label
            htmlFor="road-image"
            className="
              flex min-h-[300px]
              cursor-pointer flex-col
              items-center justify-center
              rounded-2xl border
              border-dashed border-emerald-400/30
              bg-emerald-400/[0.03]
              transition
              hover:border-emerald-400/60
              hover:bg-emerald-400/[0.06]
            "
          >

            {preview ? (

              <div className="flex w-full flex-col items-center gap-5 px-5">

                <img
                  src={preview}
                  alt="Selected road"
                  className="
                    max-h-[300px]
                    max-w-full
                    rounded-xl
                    object-contain
                  "
                />

                <div className="text-center">

                  <p className="text-sm font-semibold text-white">
                    {file?.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Click to choose another image
                  </p>

                </div>

              </div>

            ) : (

              <>
                <div
                  className="
                    flex h-16 w-16
                    items-center justify-center
                    rounded-2xl
                    bg-emerald-500/10
                    ring-1 ring-emerald-400/20
                  "
                >
                  <Upload className="h-7 w-7 text-emerald-400" />
                </div>

                <p className="mt-5 text-sm font-semibold text-white">
                  Upload road image
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Click here to choose a file
                </p>

                <span
                  className="
                    mt-4 rounded-lg
                    border border-slate-700
                    bg-slate-900
                    px-4 py-2
                    text-xs font-medium
                    text-slate-300
                  "
                >
                  Choose File
                </span>
              </>

            )}

            <input
              id="road-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

          </label>

          {/* ============================================================ */}
          {/* GPS STATUS */}
          {/* ============================================================ */}

          {gpsLocation && (

            <div
              className="
                mt-4
                flex items-center gap-3
                rounded-xl
                border border-emerald-500/20
                bg-emerald-500/5
                px-4 py-3
              "
            >

              <MapPin className="h-5 w-5 text-emerald-400" />

              <div>

                <p className="text-xs font-semibold text-emerald-400">
                  GPS Location Captured
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  Lat:{" "}
                  {gpsLocation.latitude.toFixed(6)}
                  {" • "}
                  Lng:{" "}
                  {gpsLocation.longitude.toFixed(6)}
                </p>

              </div>

            </div>

          )}

          {/* ============================================================ */}
          {/* SELECTED FILE */}
          {/* ============================================================ */}

          {file && (

            <div
              className="
                mt-4 flex
                flex-col gap-4
                rounded-xl
                border border-slate-800
                bg-slate-900
                px-4 py-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div className="flex items-center gap-3">

                <CheckCircle className="h-5 w-5 text-emerald-400" />

                <div>

                  <p className="text-xs font-semibold text-white">
                    {file.name}
                  </p>

                  <p className="text-[10px] text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={uploading}
                  className="
                    rounded-lg
                    border border-slate-700
                    px-4 py-2
                    text-xs font-medium
                    text-slate-400
                    transition
                    hover:bg-slate-800
                    hover:text-white
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={uploading}
                  className="
                    flex items-center gap-2
                    rounded-lg
                    bg-emerald-500
                    px-5 py-2
                    text-xs font-semibold
                    text-slate-950
                    transition
                    hover:bg-emerald-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      Analyze Image
                    </>
                  )}

                </button>

              </div>

            </div>

          )}

          {/* ============================================================ */}
          {/* MESSAGE */}
          {/* ============================================================ */}

          {message && (

            <div
              className="
                mt-4 flex items-center gap-2
                rounded-xl
                border border-slate-800
                bg-slate-900
                px-4 py-3
                text-xs text-slate-300
              "
            >

              {message.includes(
                "successfully"
              ) ? (
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-emerald-400" />
              )}

              {message}

            </div>

          )}

        </div>
      </div>

      {/* ================================================================ */}
      {/* AI DETECTION RESULT */}
      {/* ================================================================ */}

      {result && (

        <div
          className="
            overflow-hidden
            rounded-2xl
            border border-emerald-400/20
            bg-slate-950
          "
        >

          {/* Result Header */}

          <div
            className="
              flex items-center justify-between
              border-b border-slate-800
              px-5 py-5
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  bg-emerald-500/10
                  ring-1 ring-emerald-400/20
                "
              >
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>

              <div>

                <h2 className="text-base font-bold text-white">
                  AI Detection Result
                </h2>

                <p className="text-xs text-slate-400">
                  RoadGuard AI analysis
                </p>

              </div>

            </div>

            <span
              className="
                rounded-lg
                border border-emerald-400/30
                bg-emerald-400/10
                px-3 py-1
                text-[10px]
                font-semibold
                text-emerald-400
              "
            >
              {result.status}
            </span>

          </div>

          {/* Result Content */}

          <div className="grid gap-5 p-5 lg:grid-cols-2">

            {/* IMAGE */}

            <div>

              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Analyzed Image
              </p>

              <div className="relative w-full overflow-visible rounded-xl">

                <img
                  src={preview}
                  alt="Analyzed road"
                  className="
                    block
                    h-auto
                    w-full
                    rounded-xl
                  "
                  onLoad={(event) => {
                    const img =
                      event.currentTarget;

                    setImageDimensions({
                      width:
                        img.naturalWidth,

                      height:
                        img.naturalHeight,
                    });
                  }}
                />

                {/* YOLO BOXES */}

                {aiResult?.detections?.map(
                  (
                    detection,
                    index
                  ) => {

                    const [
                      x1,
                      y1,
                      x2,
                      y2,
                    ] = detection.box;

                    const imageWidth =
                      imageDimensions.width;

                    const imageHeight =
                      imageDimensions.height;

                    const left =
                      (x1 /
                        imageWidth) *
                      100;

                    const top =
                      (y1 /
                        imageHeight) *
                      100;

                    const width =
                      ((x2 - x1) /
                        imageWidth) *
                      100;

                    const height =
                      ((y2 - y1) /
                        imageHeight) *
                      100;

                    return (
                      <div
                        key={index}
                        className="
                          absolute
                          border-2
                          border-red-400
                          pointer-events-none
                        "
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          width: `${width}%`,
                          height: `${height}%`,
                        }}
                      >

                        <div
                          className="
                            absolute
                            -top-7
                            left-0
                            whitespace-nowrap
                            rounded-md
                            bg-red-500
                            px-2
                            py-1
                            text-[10px]
                            font-bold
                            text-white
                          "
                        >
                          {detection.class}{" "}
                          {(
                            detection.confidence *
                            100
                          ).toFixed(1)}
                          %
                        </div>

                      </div>
                    );
                  }
                )}

              </div>

              {/* Detection Count */}

              {aiResult && (

                <div
                  className="
                    mt-3
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-900
                    px-4
                    py-3
                  "
                >

                  <span className="text-xs text-slate-400">
                    Total AI detections
                  </span>

                  <span className="text-sm font-bold text-emerald-400">
                    {aiResult.count}
                  </span>

                </div>

              )}

            </div>

            {/* INFORMATION */}

            <div className="space-y-4">

              {/* Damage Type */}

              <div
                className="
                  rounded-xl
                  border border-slate-800
                  bg-slate-900
                  p-4
                "
              >

                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Damage Type
                </p>

                <div className="mt-2 flex items-center gap-2">

                  <Activity className="h-5 w-5 text-emerald-400" />

                  <p className="text-xl font-bold capitalize text-white">
                    {result.damageType}
                  </p>

                </div>

              </div>

              {/* Severity */}

              <div
                className="
                  rounded-xl
                  border border-slate-800
                  bg-slate-900
                  p-4
                "
              >

                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Severity
                </p>

                <span
                  className={`
                    mt-2 inline-flex
                    rounded-lg
                    border
                    px-3 py-1.5
                    text-xs font-semibold
                    ${getSeverityClass(
                      result.severity
                    )}
                  `}
                >
                  {result.severity}
                </span>

              </div>

              {/* Confidence */}

              <div
                className="
                  rounded-xl
                  border border-slate-800
                  bg-slate-900
                  p-4
                "
              >

                <div className="flex items-center justify-between">

                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Detection Confidence
                  </p>

                  <p className="text-sm font-bold text-emerald-400">
                    {(
                      result.confidence *
                      100
                    ).toFixed(1)}
                    %
                  </p>

                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                  <div
                    className="
                      h-full
                      rounded-full
                      bg-emerald-400
                      transition-all
                    "
                    style={{
                      width: `${Math.min(
                        result.confidence *
                          100,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

              {/* GPS */}

              <div
                className="
                  rounded-xl
                  border border-slate-800
                  bg-slate-900
                  p-4
                "
              >

                <div className="flex items-center gap-2">

                  <MapPin className="h-4 w-4 text-emerald-400" />

                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Detection Location
                  </p>

                </div>

                {gpsLocation ? (

                  <div className="mt-3 space-y-1">

                    <p className="text-xs text-slate-300">
                      Latitude:{" "}
                      <span className="font-semibold text-white">
                        {gpsLocation.latitude.toFixed(
                          6
                        )}
                      </span>
                    </p>

                    <p className="text-xs text-slate-300">
                      Longitude:{" "}
                      <span className="font-semibold text-white">
                        {gpsLocation.longitude.toFixed(
                          6
                        )}
                      </span>
                    </p>

                  </div>

                ) : (

                  <p className="mt-2 text-xs text-slate-500">
                    GPS location unavailable
                  </p>

                )}

              </div>

              {/* Description */}

              <div
                className="
                  rounded-xl
                  border border-slate-800
                  bg-slate-900
                  p-4
                "
              >

                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {result.description}
                </p>

              </div>

              {/* Model */}

              <div className="flex justify-between text-xs">

                <span className="text-slate-500">
                  AI Model
                </span>

                <span className="font-medium text-slate-300">
                  {result.aiModel}
                </span>

              </div>

              <div className="flex justify-between text-xs">

                <span className="text-slate-500">
                  Model Version
                </span>

                <span className="font-medium text-slate-300">
                  {result.modelVersion}
                </span>

              </div>

            </div>

          </div>

          {/* ============================================================ */}
          {/* ALL DETECTIONS */}
          {/* ============================================================ */}

          {aiResult &&
            aiResult.detections.length >
              0 && (

              <div
                className="
                  border-t
                  border-slate-800
                  p-5
                "
              >

                <div className="mb-4 flex items-center justify-between">

                  <div>

                    <h3 className="text-sm font-bold text-white">
                      All Detections
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      YOLO road damage detections
                    </p>

                  </div>

                  <span className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                    {aiResult.detections.length}{" "}
                    found
                  </span>

                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

                  {aiResult.detections.map(
                    (
                      detection,
                      index
                    ) => (

                      <div
                        key={index}
                        className="
                          rounded-xl
                          border
                          border-slate-800
                          bg-slate-900
                          p-4
                        "
                      >

                        <div className="flex items-center justify-between">

                          <span className="text-sm font-semibold capitalize text-white">
                            {detection.class}
                          </span>

                          <span
                            className={`
                              rounded-md
                              border
                              px-2
                              py-1
                              text-[10px]
                              font-semibold
                              ${getSeverityClass(
                                detection.severity ||
                                  "Low"
                              )}
                            `}
                          >
                            {detection.severity ||
                              "Low"}
                          </span>

                        </div>

                        <div className="mt-3 flex items-center justify-between">

                          <span className="text-xs text-slate-500">
                            Confidence
                          </span>

                          <span className="text-xs font-bold text-emerald-400">
                            {(
                              detection.confidence *
                              100
                            ).toFixed(1)}
                            %
                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

        </div>

      )}

      {/* ================================================================ */}
      {/* STEPS */}
      {/* ================================================================ */}

      <div className="grid gap-4 lg:grid-cols-3">

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

          <p className="text-xs text-slate-500">
            STEP 01
          </p>

          <h3 className="mt-3 text-base font-bold text-white">
            Upload
          </h3>

          <p className="mt-2 text-xs leading-6 text-slate-400">
            Upload road imagery from a phone,
            dashcam, or inspection vehicle.
          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

          <p className="text-xs text-slate-500">
            STEP 02
          </p>

          <h3 className="mt-3 text-base font-bold text-white">
            AI Detection
          </h3>

          <p className="mt-2 text-xs leading-6 text-slate-400">
            YOLO-based computer vision identifies
            road damage and calculates confidence.
          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

          <p className="text-xs text-slate-500">
            STEP 03
          </p>

          <h3 className="mt-3 text-base font-bold text-white">
            Severity Analysis
          </h3>

          <p className="mt-2 text-xs leading-6 text-slate-400">
            Damage is classified into Low,
            Medium, High, and Critical.
          </p>

        </div>

      </div>

    </div>
  );
}

export default AnalyzeRoad;