import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface Detection {
  _id: string;
  damageType?: string;
  severity?: string;
  confidence?: number;
  imageUrl?: string;
  status?: string;
  description?: string;
  aiModel?: string;
  modelVersion?: string;
  createdAt?: string;
  location?: {
    road?: string;
    area?: string;
  };
}

function DetectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detection, setDetection] =
    useState<Detection | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchDetection = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/detections/${id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Detection not found"
          );
        }

        setDetection(data.detection);
      } catch (err) {
        console.error(
          "Detection details error:",
          err
        );

        setError(
          "Unable to load detection details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetection();
    }
  }, [id]);

  const getSeverityClass = (
    severity?: string
  ) => {
    switch (
      severity?.toLowerCase()
    ) {
      case "critical":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "high":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "medium":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      default:
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }
  };

  const getImageUrl = (
    imageUrl?: string
  ) => {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `http://localhost:5000${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading detection...
        </div>
      </div>
    );
  }

  if (error || !detection) {
    return (
      <div className="space-y-5">

        <button
          onClick={() =>
            navigate("/detections")
          }
          className="
            flex items-center gap-2
            text-sm text-slate-400
            hover:text-emerald-400
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Detections
        </button>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-400">
          {error || "Detection not found."}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <button
          onClick={() =>
            navigate("/detections")
          }
          className="
            mb-5
            flex items-center gap-2
            text-sm text-slate-400
            transition
            hover:text-emerald-400
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Detections
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          RoadGuard AI
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Detection Details
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Complete AI analysis information for this road inspection.
        </p>

      </div>

      {/* MAIN */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* IMAGE */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">

          <div className="border-b border-slate-800 px-5 py-4">
            <h2 className="font-semibold text-white">
              Road Image
            </h2>
          </div>

          <div className="p-5">

            {detection.imageUrl ? (
              <img
                src={getImageUrl(
                  detection.imageUrl
                )}
                alt={
                  detection.damageType ||
                  "Road detection"
                }
                className="w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl bg-slate-900 text-sm text-slate-500">
                No image available
              </div>
            )}

          </div>

        </div>

        {/* INFORMATION */}

        <div className="space-y-4">

          {/* DAMAGE */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Damage Type
            </p>

            <div className="mt-3 flex items-center gap-3">

              <Activity className="h-6 w-6 text-emerald-400" />

              <h2 className="text-2xl font-bold capitalize text-white">
                {detection.damageType ||
                  "Unknown"}
              </h2>

            </div>

          </div>

          {/* SEVERITY */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Severity
            </p>

            <span
              className={`
                mt-3 inline-flex
                rounded-lg
                border
                px-4 py-2
                text-sm
                font-semibold
                ${getSeverityClass(
                  detection.severity
                )}
              `}
            >
              {detection.severity ||
                "Low"}
            </span>

          </div>

          {/* CONFIDENCE */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

            <div className="flex justify-between">

              <p className="text-xs uppercase tracking-wider text-slate-500">
                AI Confidence
              </p>

              <p className="font-bold text-emerald-400">
                {(
                  (detection.confidence ||
                    0) * 100
                ).toFixed(1)}
                %
              </p>

            </div>

            <div className="mt-3 h-2 rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-emerald-400"
                style={{
                  width: `${Math.min(
                    (detection.confidence ||
                      0) * 100,
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

          {/* STATUS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Status
            </p>

            <div className="mt-3 flex items-center gap-2">

              <CheckCircle className="h-5 w-5 text-emerald-400" />

              <span className="text-sm font-semibold text-white">
                {detection.status ||
                  "Detected"}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* DESCRIPTION */}

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">

        <h2 className="text-base font-semibold text-white">
          Analysis Information
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <div>
            <p className="text-xs text-slate-500">
              Description
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {detection.description ||
                "Road damage detected by AI."}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              AI Model
            </p>

            <p className="mt-2 text-sm text-white">
              {detection.aiModel ||
                "YOLOv8"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Model Version
            </p>

            <p className="mt-2 text-sm text-white">
              {detection.modelVersion ||
                "1.0.0"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Road
            </p>

            <p className="mt-2 text-sm text-white">
              {detection.location?.road ||
                "Unknown Road"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Area
            </p>

            <p className="mt-2 text-sm text-white">
              {detection.location?.area ||
                "Unknown Area"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Detected At
            </p>

            <p className="mt-2 text-sm text-white">
              {detection.createdAt
                ? new Date(
                    detection.createdAt
                  ).toLocaleString()
                : "Unknown"}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default DetectionDetails;