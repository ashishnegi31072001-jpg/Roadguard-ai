import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

interface Detection {
  _id: string;
  damageType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  imageUrl: string;
  aiModel: string;
  modelVersion: string;
  status: string;
  description: string;
  createdAt: string;

  location?: {
    road?: string;
    area?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

const API_URL = "http://localhost:5000/api/detections";

function Detections() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | FETCH DETECTIONS
  |--------------------------------------------------------------------------
  */

  const fetchDetections = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch detections");
      }

      const data = await response.json();

      if (data.success) {
        setDetections(data.detections || []);
      } else {
        throw new Error(
          data.message || "Failed to fetch detections"
        );
      }
    } catch (err) {
      console.error("Fetch detections error:", err);

      setError(
        "Unable to load detection history."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD ON PAGE OPEN
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchDetections();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | DELETE SINGLE DETECTION
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this detection report?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(id);
      setError("");

      console.log(
        "Deleting detection:",
        id
      );

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      console.log(
        "Delete response:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete detection"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Remove From UI Immediately
      |--------------------------------------------------------------------------
      */

      setDetections((previous) =>
        previous.filter(
          (detection) =>
            detection._id !== id
        )
      );
    } catch (err) {
      console.error(
        "Delete detection error:",
        err
      );

      setError(
        "Failed to delete detection."
      );
    } finally {
      setDeleting(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE ALL DETECTIONS
  |--------------------------------------------------------------------------
  */

  const handleDeleteAll = async () => {
    if (detections.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete all ${detections.length} detection reports?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAll(true);
      setError("");

      console.log(
        "Deleting all detections..."
      );

      const response = await fetch(
        API_URL,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      console.log(
        "Delete all response:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete all detections"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Clear UI
      |--------------------------------------------------------------------------
      */

      setDetections([]);
    } catch (err) {
      console.error(
        "Delete all detections error:",
        err
      );

      setError(
        "Failed to delete all detection reports."
      );
    } finally {
      setDeletingAll(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString();
  };

  /*
  |--------------------------------------------------------------------------
  | IMAGE URL
  |--------------------------------------------------------------------------
  */

  const getImageUrl = (
    imageUrl: string
  ) => {
    if (!imageUrl) {
      return "";
    }

    if (
      imageUrl.startsWith("http")
    ) {
      return imageUrl;
    }

    return `http://localhost:5000${imageUrl}`;
  };

  /*
  |--------------------------------------------------------------------------
  | SEVERITY STYLE
  |--------------------------------------------------------------------------
  */

  const getSeverityClass = (
    severity: string
  ) => {
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

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const total = detections.length;

  const high = detections.filter(
    (item) =>
      item.severity === "High"
  ).length;

  const medium = detections.filter(
    (item) =>
      item.severity === "Medium"
  ).length;

  const low = detections.filter(
    (item) =>
      item.severity === "Low"
  ).length;

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">

      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            RoadGuard AI
          </p>

          <h1 className="mt-2 text-3xl font-bold text-white">
            Detection History
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            View all road damage detections
            analyzed by RoadGuard AI.
          </p>
        </div>

        <div className="flex gap-3">

          {/* REFRESH */}

          <button
            type="button"
            onClick={fetchDetections}
            disabled={loading}
            className="
              flex items-center gap-2
              rounded-xl
              border border-slate-700
              bg-slate-900
              px-4 py-3
              text-sm font-medium
              text-slate-300
              transition
              hover:border-emerald-500/40
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </button>

          {/* DELETE ALL */}

          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={
              deletingAll ||
              detections.length === 0
            }
            className="
              flex items-center gap-2
              rounded-xl
              border border-red-500/20
              bg-red-500/10
              px-4 py-3
              text-sm font-medium
              text-red-400
              transition
              hover:bg-red-500/20
              hover:text-red-300
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Trash2 className="h-4 w-4" />

            {deletingAll
              ? "Deleting..."
              : "Delete All"}
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* ERROR */}
      {/* ================================================================ */}

      {error && (
        <div
          className="
            flex items-center gap-3
            rounded-xl
            border border-red-500/20
            bg-red-500/10
            px-4 py-3
            text-sm text-red-400
          "
        >
          <AlertTriangle className="h-5 w-5" />

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ================================================================ */}
      {/* STATISTICS */}
      {/* ================================================================ */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}

        <div
          className="
            rounded-2xl
            border border-slate-800
            bg-slate-900/70
            p-5
          "
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Total
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {total}
              </p>
            </div>

            <div
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                bg-emerald-500/10
                text-emerald-400
              "
            >
              <Activity className="h-6 w-6" />
            </div>

          </div>
        </div>

        {/* HIGH */}

        <div
          className="
            rounded-2xl
            border border-slate-800
            bg-slate-900/70
            p-5
          "
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                High
              </p>

              <p className="mt-2 text-3xl font-bold text-red-400">
                {high}
              </p>
            </div>

            <div
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                bg-red-500/10
                text-red-400
              "
            >
              <AlertTriangle className="h-6 w-6" />
            </div>

          </div>
        </div>

        {/* MEDIUM */}

        <div
          className="
            rounded-2xl
            border border-slate-800
            bg-slate-900/70
            p-5
          "
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Medium
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-400">
                {medium}
              </p>
            </div>

            <div
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                bg-yellow-500/10
                text-yellow-400
              "
            >
              <AlertTriangle className="h-6 w-6" />
            </div>

          </div>
        </div>

        {/* LOW */}

        <div
          className="
            rounded-2xl
            border border-slate-800
            bg-slate-900/70
            p-5
          "
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Low
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {low}
              </p>
            </div>

            <div
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                bg-emerald-500/10
                text-emerald-400
              "
            >
              <CheckCircle className="h-6 w-6" />
            </div>

          </div>
        </div>

      </div>

      {/* ================================================================ */}
      {/* DETECTION LIST */}
      {/* ================================================================ */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border border-slate-800
          bg-slate-950
        "
      >

        {/* LIST HEADER */}

        <div
          className="
            border-b border-slate-800
            px-6 py-5
          "
        >
          <h2 className="text-lg font-semibold text-white">
            All Detection Reports
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {total}{" "}
            {total === 1
              ? "report"
              : "reports"}{" "}
            found
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

        {/* EMPTY */}

        {!loading &&
          detections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">

              <div
                className="
                  flex h-16 w-16
                  items-center justify-center
                  rounded-2xl
                  bg-slate-900
                "
              >
                <Activity className="h-8 w-8 text-slate-600" />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                No detection reports
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Analyze a road image to create
                your first detection report.
              </p>

            </div>
          )}

        {/* REPORTS */}

        {!loading &&
          detections.map(
            (detection) => (
              <div
                key={detection._id}
                className="
                  border-b border-slate-800
                  p-5
                  transition
                  hover:bg-slate-900/40
                  last:border-b-0
                "
              >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

                  {/* IMAGE */}

                  <div
                    className="
                      h-24 w-32
                      flex-shrink-0
                      overflow-hidden
                      rounded-xl
                      border border-slate-800
                      bg-slate-900
                    "
                  >
                    <img
                      src={getImageUrl(
                        detection.imageUrl
                      )}
                      alt="Detected road"
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>

                  {/* INFORMATION */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-3">

                      <h3 className="text-lg font-semibold capitalize text-white">
                        {detection.damageType}
                      </h3>

                      <span
                        className={`
                          rounded-full
                          border
                          px-3 py-1
                          text-xs
                          font-semibold
                          ${getSeverityClass(
                            detection.severity
                          )}
                        `}
                      >
                        {detection.severity}
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      {detection.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">

                      <span className="text-slate-500">
                        Confidence:{" "}
                        <strong className="text-emerald-400">
                          {(
                            detection.confidence *
                            100
                          ).toFixed(1)}
                          %
                        </strong>
                      </span>

                      <span className="text-slate-500">
                        Model:{" "}
                        <strong className="text-white">
                          {detection.aiModel}
                        </strong>
                      </span>

                      <span className="text-slate-500">
                        {formatDate(
                          detection.createdAt
                        )}
                      </span>

                    </div>

                    {/* GPS */}

                    {detection.location
                      ?.latitude !==
                      null &&
                      detection.location
                        ?.latitude !==
                        undefined && (
                        <p className="mt-2 text-xs text-slate-500">
                          📍{" "}
                          {detection.location.latitude.toFixed(
                            6
                          )}
                          ,{" "}
                          {detection.location.longitude?.toFixed(
                            6
                          )}
                        </p>
                      )}

                  </div>

                  {/* ACTIONS */}

                  <div className="flex items-center gap-3 lg:ml-auto">

                    {/* STATUS */}

                    <span
                      className="
                        rounded-lg
                        bg-emerald-500/10
                        px-3 py-2
                        text-xs
                        font-semibold
                        text-emerald-400
                      "
                    >
                      {detection.status}
                    </span>

                    {/* VIEW */}

                    <button
                      type="button"
                      title="View detection"
                      className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl
                        border border-slate-700
                        bg-slate-900
                        text-slate-400
                        transition
                        hover:border-emerald-500/40
                        hover:text-emerald-400
                      "
                      onClick={() => {
                        window.open(
                          getImageUrl(
                            detection.imageUrl
                          ),
                          "_blank"
                        );
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {/* DELETE SINGLE */}

                    <button
                      type="button"
                      title="Delete detection"
                      disabled={
                        deleting ===
                        detection._id
                      }
                      onClick={() =>
                        handleDelete(
                          detection._id
                        )
                      }
                      className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl
                        border border-red-500/20
                        bg-red-500/10
                        text-red-400
                        transition
                        hover:bg-red-500/20
                        hover:text-red-300
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      {deleting ===
                      detection._id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>

                  </div>

                </div>

              </div>
            )
          )}

      </div>

    </div>
  );
}

export default Detections;