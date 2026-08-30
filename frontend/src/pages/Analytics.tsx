import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/detections";

interface Detection {
  _id: string;
  damageType?: string;
  severity?: string;
  confidence?: number;
  status?: string;
  createdAt?: string;
}

function Analytics() {
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
          data.message || "Failed to fetch analytics"
        );
      }

      setDetections(data.detections || []);
    } catch (err) {
      console.error("Analytics error:", err);
      setError(
        "Unable to load analytics. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, []);

  const stats = useMemo(() => {
    const total = detections.length;

    const high = detections.filter(
      (item) =>
        item.severity?.toLowerCase() === "high" ||
        item.severity?.toLowerCase() === "critical"
    ).length;

    const medium = detections.filter(
      (item) =>
        item.severity?.toLowerCase() === "medium"
    ).length;

    const low = detections.filter(
      (item) =>
        item.severity?.toLowerCase() === "low"
    ).length;

    const averageConfidence =
      total > 0
        ? detections.reduce(
            (sum, item) =>
              sum + (item.confidence || 0),
            0
          ) / total
        : 0;

    const damageMap: Record<string, number> = {};

    detections.forEach((item) => {
      const type =
        item.damageType || "Unknown";

      damageMap[type] =
        (damageMap[type] || 0) + 1;
    });

    const damageTypes = Object.entries(
      damageMap
    ).sort((a, b) => b[1] - a[1]);

    return {
      total,
      high,
      medium,
      low,
      averageConfidence,
      damageTypes,
    };
  }, [detections]);

  const maxDamageCount =
    stats.damageTypes.length > 0
      ? Math.max(
          ...stats.damageTypes.map(
            ([, count]) => count
          )
        )
      : 1;

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading analytics...
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
            <BarChart3 className="h-4 w-4" />
            Road Intelligence
          </div>

          <h1 className="text-3xl font-bold text-white">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Real-time analysis of your RoadGuard AI detection data.
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

      {/* STAT CARDS */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Total Detections
              </p>

              <p className="mt-3 text-3xl font-bold text-white">
                {stats.total}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <Activity className="h-6 w-6" />
            </div>

          </div>
        </div>

        {/* HIGH */}

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                High Severity
              </p>

              <p className="mt-3 text-3xl font-bold text-red-400">
                {stats.high}
              </p>
            </div>

            <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
              <ShieldAlert className="h-6 w-6" />
            </div>

          </div>
        </div>

        {/* MEDIUM */}

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Medium Severity
              </p>

              <p className="mt-3 text-3xl font-bold text-yellow-400">
                {stats.medium}
              </p>
            </div>

            <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
              <AlertTriangle className="h-6 w-6" />
            </div>

          </div>
        </div>

        {/* CONFIDENCE */}

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Avg Confidence
              </p>

              <p className="mt-3 text-3xl font-bold text-emerald-400">
                {(stats.averageConfidence * 100).toFixed(1)}%
              </p>
            </div>

            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>

          </div>
        </div>

      </div>

      {/* MAIN ANALYTICS */}

      <div className="grid gap-6 lg:grid-cols-2">

        {/* SEVERITY DISTRIBUTION */}

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Severity Distribution
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Road damage grouped by severity.
            </p>
          </div>

          <div className="space-y-6">

            {/* HIGH */}

            <div>
              <div className="mb-2 flex justify-between text-sm">

                <span className="text-slate-300">
                  High / Critical
                </span>

                <span className="font-semibold text-red-400">
                  {stats.high}
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-red-500"
                  style={{
                    width:
                      stats.total > 0
                        ? `${(stats.high / stats.total) * 100}%`
                        : "0%",
                  }}
                />

              </div>
            </div>

            {/* MEDIUM */}

            <div>
              <div className="mb-2 flex justify-between text-sm">

                <span className="text-slate-300">
                  Medium
                </span>

                <span className="font-semibold text-yellow-400">
                  {stats.medium}
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{
                    width:
                      stats.total > 0
                        ? `${(stats.medium / stats.total) * 100}%`
                        : "0%",
                  }}
                />

              </div>
            </div>

            {/* LOW */}

            <div>
              <div className="mb-2 flex justify-between text-sm">

                <span className="text-slate-300">
                  Low
                </span>

                <span className="font-semibold text-emerald-400">
                  {stats.low}
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{
                    width:
                      stats.total > 0
                        ? `${(stats.low / stats.total) * 100}%`
                        : "0%",
                  }}
                />

              </div>
            </div>

          </div>

        </div>

        {/* DAMAGE TYPES */}

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Damage Types
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Most frequently detected road damage.
            </p>
          </div>

          {stats.damageTypes.length === 0 ? (

            <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-500">
              No detection data available.
            </div>

          ) : (

            <div className="space-y-5">

              {stats.damageTypes.map(
                ([type, count]) => (

                  <div key={type}>

                    <div className="mb-2 flex justify-between">

                      <span className="text-sm capitalize text-slate-300">
                        {type}
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {count}
                      </span>

                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{
                          width: `${
                            (count /
                              maxDamageCount) *
                            100
                          }%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* RECENT ACTIVITY */}

      <div className="rounded-2xl border border-slate-800 bg-slate-950">

        <div className="border-b border-slate-800 px-6 py-5">

          <h2 className="text-lg font-semibold text-white">
            Recent Detection Activity
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest road damage detections.
          </p>

        </div>

        {detections.length === 0 ? (

          <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
            No detection activity yet.
          </div>

        ) : (

          <div className="divide-y divide-slate-800">

            {detections.slice(0, 5).map(
              (detection) => (

                <div
                  key={detection._id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div className="flex items-center gap-3">

                    <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                      <Activity className="h-5 w-5" />
                    </div>

                    <div>

                      <p className="text-sm font-semibold capitalize text-white">
                        {detection.damageType ||
                          "Unknown Damage"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {detection.createdAt
                          ? new Date(
                              detection.createdAt
                            ).toLocaleString()
                          : "Unknown date"}
                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-5">

                    <div className="text-right">

                      <p className="text-[10px] uppercase text-slate-500">
                        Confidence
                      </p>

                      <p className="mt-1 text-sm font-semibold text-emerald-400">
                        {(
                          (detection.confidence ||
                            0) * 100
                        ).toFixed(1)}
                        %
                      </p>

                    </div>

                    <span
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        detection.severity?.toLowerCase() ===
                          "high" ||
                        detection.severity?.toLowerCase() ===
                          "critical"
                          ? "border-red-500/30 bg-red-500/10 text-red-400"
                          : detection.severity?.toLowerCase() ===
                            "medium"
                          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {detection.severity ||
                        "Low"}
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

export default Analytics;