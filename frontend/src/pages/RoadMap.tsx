import { useEffect, useState } from "react";
import {
  Map,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Activity,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/detections";

interface Detection {
  _id: string;
  damageType?: string;
  severity?: string;
  confidence?: number;
  imageUrl?: string;
  createdAt?: string;
  location?: {
    road?: string;
    area?: string;
  };
}

function RoadMap() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetections = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load road data"
        );
      }

      setDetections(data.detections || []);
    } catch (err) {
      console.error("Road map error:", err);

      setError(
        "Unable to load road detection data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, []);

  const highCount = detections.filter(
    (item) =>
      item.severity?.toLowerCase() === "high" ||
      item.severity?.toLowerCase() === "critical"
  ).length;

  const mediumCount = detections.filter(
    (item) =>
      item.severity?.toLowerCase() === "medium"
  ).length;

  const lowCount = detections.filter(
    (item) =>
      item.severity?.toLowerCase() === "low"
  ).length;

  const getSeverityStyle = (
    severity?: string
  ) => {
    switch (severity?.toLowerCase()) {
      case "high":
      case "critical":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "medium":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      default:
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading road map...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            <Map className="h-4 w-4" />
            Road Intelligence
          </div>

          <h1 className="text-3xl font-bold text-white">
            Road Map
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            View road damage detection locations and severity.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDetections}
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
          "
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl border border-red-500/20 bg-slate-950 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            High Risk
          </p>

          <p className="mt-2 text-3xl font-bold text-red-400">
            {highCount}
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-500/20 bg-slate-950 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Medium Risk
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-400">
            {mediumCount}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-slate-950 p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Low Risk
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {lowCount}
          </p>
        </div>

      </div>

      {/* MAP PLACEHOLDER */}

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">

        <div className="border-b border-slate-800 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">
            Detection Map
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Geographic visualization will be enabled when GPS coordinates are available.
          </p>
        </div>

        <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden bg-slate-900">

          {/* GRID */}

          <div
            className="
              absolute inset-0
              opacity-20
              [background-image:linear-gradient(rgba(148,163,184,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.2)_1px,transparent_1px)]
              [background-size:40px_40px]
            "
          />

          <div className="relative z-10 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <MapPin className="h-10 w-10 text-emerald-400" />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              GPS Mapping Ready
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your detection system is working. GPS coordinates can be connected next to place each road-damage detection on the map.
            </p>

          </div>

        </div>

      </div>

      {/* RECENT LOCATIONS */}

      <div className="rounded-2xl border border-slate-800 bg-slate-950">

        <div className="border-b border-slate-800 px-6 py-5">

          <div className="flex items-center gap-3">

            <Activity className="h-5 w-5 text-emerald-400" />

            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Road Detections
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest detected road damage.
              </p>
            </div>

          </div>

        </div>

        {detections.length === 0 ? (

          <div className="p-10 text-center text-sm text-slate-500">
            No road detections available.
          </div>

        ) : (

          <div className="divide-y divide-slate-800">

            {detections.slice(0, 10).map(
              (detection) => (

                <div
                  key={detection._id}
                  className="
                    flex flex-col gap-4
                    p-5
                    transition
                    hover:bg-slate-900/50
                    md:flex-row
                    md:items-center
                  "
                >

                  <div className="flex flex-1 items-center gap-4">

                    <div className="rounded-xl bg-emerald-500/10 p-3">
                      <MapPin className="h-5 w-5 text-emerald-400" />
                    </div>

                    <div>

                      <h3 className="text-sm font-semibold capitalize text-white">
                        {detection.damageType ||
                          "Unknown Damage"}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {detection.location?.road ||
                          "Unknown Road"}
                        {" • "}
                        {detection.location?.area ||
                          "Unknown Area"}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-4">

                    <span
                      className={`
                        rounded-lg
                        border
                        px-3 py-1.5
                        text-xs
                        font-semibold
                        ${getSeverityStyle(
                          detection.severity
                        )}
                      `}
                    >
                      {detection.severity ||
                        "Low"}
                    </span>

                    <span className="text-xs font-semibold text-slate-400">
                      {(
                        (detection.confidence ||
                          0) * 100
                      ).toFixed(1)}
                      %
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default RoadMap;