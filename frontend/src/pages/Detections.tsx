
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Trash2,
  X,
  ImageOff,
  MapPin,
} from "lucide-react";

interface Detection {
  _id: string;
  damageType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  imageUrl?: string;
  aiModel?: string;
  modelVersion?: string;
  status?: string;
  description?: string;
  createdAt?: string;
  location?: {
    road?: string;
    area?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

interface ApiResponse {
  success: boolean;
  message?: string;
  detections?: Detection[];
  detection?: Detection;
  deletedCount?: number;
}

const API_URL = "http://localhost:5000/api/detections";
const BACKEND_URL = "http://localhost:5000";

async function readResponse(response: Response): Promise<ApiResponse> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data as ApiResponse;
}

// ==================================================
// IMAGE WITH FALLBACK
// ==================================================

function DetectionImage({
  imageUrl,
  damageType,
}: {
  imageUrl?: string;
  damageType: string;
}) {
  const [failed, setFailed] = useState(false);

  const src = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${BACKEND_URL}${
          imageUrl.startsWith("/") ? "" : "/"
        }${imageUrl}`
    : "";

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="flex h-24 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      {src && !failed ? (
        <img
          src={src}
          alt={`${damageType} road damage`}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <ImageOff className="h-6 w-6" />
          <span className="text-xs">Image unavailable</span>
        </div>
      )}
    </div>
  );
}

// ==================================================
// MAIN COMPONENT
// ==================================================

function Detections() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // ----------------------------------------------
  // FETCH DETECTIONS
  // ----------------------------------------------

  const fetchDetections = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: { Accept: "application/json" },
      });

      const data = await readResponse(response);

      if (!Array.isArray(data.detections)) {
        throw new Error("Invalid detection history response.");
      }

      setDetections(data.detections);
    } catch (err) {
      console.error("Fetch detections error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load detection history."
      );
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDetections();

  }, [fetchDetections]);

  // ----------------------------------------------
  // DELETE SINGLE DETECTION
  // ----------------------------------------------

  const handleDelete = async (id: string) => {
    if (deleting || deletingAll) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this detection report?"
    );

    if (!confirmed) return;

    try {
      setDeleting(id);
      setError("");
      setNotice("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      await readResponse(response);

      setDetections((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setNotice("Detection report deleted successfully.");
    } catch (err) {
      console.error("Delete detection error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete detection."
      );
    } finally {
      setDeleting(null);
    }
  };

  // ----------------------------------------------
  // DELETE ALL DETECTIONS
  // ----------------------------------------------

  const handleDeleteAll = async () => {
    if (detections.length === 0 || deleting || deletingAll) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete all ${detections.length} detection reports? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingAll(true);
      setError("");
      setNotice("");

      const response = await fetch(API_URL, {
        method: "DELETE",
      });

      const data = await readResponse(response);

      setDetections([]);
      setNotice(
        `Deleted ${data.deletedCount ?? detections.length} detection report(s).`
      );
    } catch (err) {
      console.error("Delete all detections error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete detection reports."
      );
    } finally {
      setDeletingAll(false);
    }
  };

  // ----------------------------------------------
  // FORMAT DATE SAFELY
  // ----------------------------------------------

  const formatDate = (date?: string) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString();
  };

  // ----------------------------------------------
  // OPEN IMAGE
  // ----------------------------------------------

  const openImage = (imageUrl?: string) => {
    if (!imageUrl) {
      setError("No image is available for this detection.");
      return;
    }

    const url = imageUrl.startsWith("http")
      ? imageUrl
      : `${BACKEND_URL}${
          imageUrl.startsWith("/") ? "" : "/"
        }${imageUrl}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ----------------------------------------------
  // SEVERITY STYLE
  // ----------------------------------------------

  const getSeverityClass = (severity?: string) => {
    switch (severity) {
      case "Critical":
        return "border-purple-500/30 bg-purple-500/10 text-purple-400";

      case "High":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "Medium":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      default:
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }
  };

  // ----------------------------------------------
  // STATISTICS
  // ----------------------------------------------

  const total = detections.length;

  const critical = detections.filter(
    (item) => item.severity === "Critical"
  ).length;

  const high = detections.filter(
    (item) => item.severity === "High"
  ).length;

  const medium = detections.filter(
    (item) => item.severity === "Medium"
  ).length;

  const low = detections.filter(
    (item) => item.severity === "Low"
  ).length;

  // ----------------------------------------------
  // GPS VALIDATION
  // ----------------------------------------------

  const hasCoordinates = (detection: Detection) => {
    const latitude = detection.location?.latitude;
    const longitude = detection.location?.longitude;

    return (
      typeof latitude === "number" &&
      Number.isFinite(latitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      typeof longitude === "number" &&
      Number.isFinite(longitude) &&
      longitude >= -180 &&
      longitude <= 180
    );
  };

  // ----------------------------------------------
  // UI
  // ----------------------------------------------

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            RoadGuard AI
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Detection History
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            View road damage detections saved by RoadGuard AI.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void fetchDetections()}
            disabled={loading || deletingAll}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={deletingAll || deleting !== null || total === 0}
            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deletingAll ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deletingAll ? "Deleting..." : "Delete All"}
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* SUCCESS MESSAGE */}

      {notice && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="flex-1">{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Reports"
          value={total}
          icon={<Activity className="h-6 w-6" />}
          color="text-emerald-400"
          background="bg-emerald-500/10"
        />

        <StatCard
          label="Critical / High"
          value={critical + high}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="text-red-400"
          background="bg-red-500/10"
        />

        <StatCard
          label="Medium"
          value={medium}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="text-yellow-400"
          background="bg-yellow-500/10"
        />

        <StatCard
          label="Low"
          value={low}
          icon={<CheckCircle className="h-6 w-6" />}
          color="text-emerald-400"
          background="bg-emerald-500/10"
        />
      </div>

      {/* DETECTION LIST */}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">
            All Detection Reports
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {total} {total === 1 ? "report" : "reports"} found
          </p>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-7 w-7 animate-spin text-emerald-400" />
            <span className="ml-3 text-sm text-slate-400">
              Loading detections...
            </span>
          </div>
        )}

        {/* EMPTY STATE */}

        {!loading && total === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900">
              <Activity className="h-8 w-8 text-slate-600" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-white">
              No detection reports
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Analyze a road image to create your first report.
            </p>
          </div>
        )}

        {/* REPORTS */}

        {!loading &&
          detections.map((detection) => {
            const confidence = Number(detection.confidence);
            const validConfidence =
              Number.isFinite(confidence) &&
              confidence >= 0 &&
              confidence <= 1;

            return (
              <div
                key={detection._id}
                className="border-b border-slate-800 p-5 transition hover:bg-slate-900/40 last:border-b-0"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  {/* IMAGE */}

                  <DetectionImage
                    imageUrl={detection.imageUrl}
                    damageType={detection.damageType || "Road damage"}
                  />

                  {/* INFORMATION */}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold capitalize text-white">
                        {detection.damageType || "Unknown damage"}
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSeverityClass(
                          detection.severity
                        )}`}
                      >
                        {detection.severity || "Unknown"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {detection.description || "No description available."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
                      <span className="text-slate-500">
                        Confidence:{" "}
                        <strong className="text-emerald-400">
                          {validConfidence
                            ? `${(confidence * 100).toFixed(1)}%`
                            : "Unavailable"}
                        </strong>
                      </span>

                      <span className="text-slate-500">
                        Model:{" "}
                        <strong className="text-white">
                          {detection.aiModel || "YOLOv8"}
                        </strong>
                      </span>

                      <span className="text-slate-500">
                        Version:{" "}
                        <strong className="text-white">
                          {detection.modelVersion || "Unknown"}
                        </strong>
                      </span>

                      <span className="text-slate-500">
                        {formatDate(detection.createdAt)}
                      </span>
                    </div>

                    {/* LOCATION */}

                    {hasCoordinates(detection) ? (
                      <a
                        href={`https://www.google.com/maps?q=${detection.location!.latitude},${detection.location!.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300"
                      >
                        <MapPin className="h-4 w-4" />
                        {detection.location!.latitude!.toFixed(6)},{" "}
                        {detection.location!.longitude!.toFixed(6)}
                        <span>· Open map</span>
                      </a>
                    ) : (
                      <p className="mt-3 text-xs text-slate-500">
                        GPS coordinates unavailable
                      </p>
                    )}

                    <p className="mt-1 text-xs text-slate-500">
                      {detection.location?.road &&
                      detection.location.road !== "Unknown Road"
                        ? detection.location.road
                        : "Unknown Road"}
                      {" · "}
                      {detection.location?.area &&
                      detection.location.area !== "Unknown Area"
                        ? detection.location.area
                        : "Unknown Area"}
                    </p>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center gap-3 lg:ml-auto">
                    <span className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400">
                      {detection.status || "Detected"}
                    </span>

                    <button
                      type="button"
                      title="View detection image"
                      aria-label="View detection image"
                      onClick={() => openImage(detection.imageUrl)}
                      disabled={!detection.imageUrl}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      title="Delete detection"
                      aria-label="Delete detection"
                      disabled={
                        deleting === detection._id ||
                        deletingAll ||
                        deleting !== null
                      }
                      onClick={() => void handleDelete(detection._id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {deleting === detection._id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ==================================================
// STAT CARD
// ==================================================

function StatCard({
  label,
  value,
  icon,
  color,
  background,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  background: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className={`mt-2 text-3xl font-bold ${color}`}>
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${background} ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Detections;
