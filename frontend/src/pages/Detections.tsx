import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface Detection {
  _id: string;
  damageType: string;
  severity: string;
  confidence: number;
  imageUrl: string;
  aiModel: string;
  modelVersion: string;
  status: string;
  description: string;
  createdAt?: string;
  location?: {
    road?: string;
    area?: string;
  };
}

function Detections() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchDetections = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/detections"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch detections"
        );
      }

      setDetections(data.detections || []);
    } catch (err) {
      console.error("Detection fetch error:", err);

      setError(
        "Unable to load detections. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, []);

  const filteredDetections = detections.filter((detection) => {
    const searchText = search.toLowerCase();

    return (
      detection.damageType
        ?.toLowerCase()
        .includes(searchText) ||
      detection.severity
        ?.toLowerCase()
        .includes(searchText) ||
      detection.status
        ?.toLowerCase()
        .includes(searchText) ||
      detection.location?.road
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  const getSeverityClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "high":
        return "border-red-400/30 bg-red-400/10 text-red-400";

      case "medium":
        return "border-yellow-400/30 bg-yellow-400/10 text-yellow-400";

      default:
        return "border-emerald-400/30 bg-emerald-400/10 text-emerald-400";
    }
  };

  const formatConfidence = (confidence: number) => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-7">

      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            <ShieldAlert className="h-4 w-4" />
            AI Detection Center
          </div>

          <h1 className="text-3xl font-bold text-white">
            Detections
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            View and manage road damage detected by RoadGuard AI.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDetections}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-400 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>

      </div>

      {/* SEARCH */}
      <div className="relative">

        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search detections..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950 py-4 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50"
        />

      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-400">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading detections...
          </p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && filteredDetections.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-12 text-center">

          <ShieldAlert className="mx-auto h-10 w-10 text-slate-600" />

          <h2 className="mt-4 text-lg font-bold text-white">
            No detections found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Analyze a road image to create your first detection.
          </p>

        </div>
      )}

      {/* DETECTION COUNT */}
      {!loading && filteredDetections.length > 0 && (
        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Detection History
            </p>

            <p className="mt-1 text-sm text-slate-300">
              {filteredDetections.length} detection
              {filteredDetections.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-400">
            {detections.length} Total
          </div>

        </div>
      )}

      {/* DETECTION CARDS */}
      {!loading && filteredDetections.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">

          {filteredDetections.map((detection) => (
            <div
              key={detection._id}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 transition hover:border-emerald-400/30"
            >

              {/* IMAGE */}
              <div className="relative h-56 bg-slate-900">

                <img
                  src={`http://localhost:5000${detection.imageUrl}`}
                  alt={detection.damageType}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <div className="absolute left-4 top-4 rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur">
                  {detection.aiModel || "YOLOv8"}
                </div>

              </div>

              {/* CONTENT */}
              <div className="p-5">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Damage Type
                    </p>

                    <h2 className="mt-1 text-xl font-bold capitalize text-white">
                      {detection.damageType}
                    </h2>

                  </div>

                  <span
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${getSeverityClass(
                      detection.severity
                    )}`}
                  >
                    {detection.severity}
                  </span>

                </div>

                {/* CONFIDENCE */}
                <div className="mt-5">

                  <div className="flex items-center justify-between">

                    <p className="text-xs text-slate-500">
                      AI Confidence
                    </p>

                    <p className="text-sm font-bold text-emerald-400">
                      {formatConfidence(
                        detection.confidence
                      )}
                    </p>

                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{
                        width: `${Math.min(
                          detection.confidence * 100,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

                {/* INFO */}
                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">

                    <p className="text-[10px] uppercase text-slate-500">
                      Status
                    </p>

                    <div className="mt-2 flex items-center gap-2">

                      <CheckCircle className="h-4 w-4 text-emerald-400" />

                      <p className="text-xs font-medium text-slate-200">
                        {detection.status}
                      </p>

                    </div>

                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">

                    <p className="text-[10px] uppercase text-slate-500">
                      Model
                    </p>

                    <p className="mt-2 text-xs font-medium text-slate-200">
                      {detection.modelVersion || "1.0.0"}
                    </p>

                  </div>

                </div>

                {/* DESCRIPTION */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">

                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Description
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    {detection.description}
                  </p>

                </div>

                {/* FOOTER */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">

                  <div>

                    <p className="text-[10px] uppercase text-slate-500">
                      Detected
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(detection.createdAt)}
                    </p>

                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-emerald-400/40 hover:text-emerald-400"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Detections;