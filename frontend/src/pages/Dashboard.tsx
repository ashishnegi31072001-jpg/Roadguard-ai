
import { useEffect, useMemo, useState } from "react";

import HeroInspection from "../components/dashboard/HeroInspection";
import LiveDetectionFeed from "../components/dashboard/LiveDetectionFeed";
import StatCard from "../components/dashboard/StatCard";
import DamageAnalytics from "../components/dashboard/DamageAnalytics";
import DamageTrend from "../components/dashboard/DamageTrend";
import RoadHealthMap from "../components/dashboard/RoadHealthMap";
import RecentInspections from "../components/dashboard/RecentInspections";
import PriorityRoads from "../components/dashboard/PriorityRoads";

interface Detection {
  _id: string;
  damageType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  imageUrl: string;
  status: string;
  createdAt: string;
  location?: {
    road?: string;
    area?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

interface DetectionApiResponse {
  success: boolean;
  count?: number;
  detections: Detection[];
}

const API_URL = "http://localhost:5000/api/detections";

function Dashboard() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch detection records from the backend.
  useEffect(() => {
    const controller = new AbortController();

    const fetchDetections = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch detections (HTTP ${response.status}).`
          );
        }

        const data: DetectionApiResponse = await response.json();

        if (
          data.success !== true ||
          !Array.isArray(data.detections)
        ) {
          throw new Error(
            "The server returned an invalid detection response."
          );
        }

        setDetections(data.detections);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Dashboard detection error:", err);

        setDetections([]);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDetections();

    return () => controller.abort();
  }, []);

  // Calculate statistics from the records returned by MongoDB.
  const statistics = useMemo(() => {
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

    // Only valid confidence values contribute to the average.
    const validConfidences = detections
      .map((item) => item.confidence)
      .filter(
        (value) =>
          typeof value === "number" &&
          Number.isFinite(value) &&
          value >= 0 &&
          value <= 1
      );

    const averageConfidence =
      validConfidences.length > 0
        ? validConfidences.reduce(
            (sum, value) => sum + value,
            0
          ) / validConfidences.length
        : 0;

    // Heuristic estimate, not a verified engineering road-health score.
    const healthScore = Math.max(
      0,
      Math.min(
        100,
        100 - critical * 8 - high * 5 - medium * 2 - low
      )
    );

    // The backend currently saves each detection box as its own record.
    // Count unique uploaded image paths as a rough inspection estimate.
    // A dedicated inspection ID is needed for an authoritative count.
    const inspectionCount = new Set(
      detections
        .map((item) => item.imageUrl)
        .filter(
          (imageUrl) =>
            typeof imageUrl === "string" && imageUrl.trim() !== ""
        )
    ).size;

    return {
      total,
      critical,
      high,
      medium,
      low,
      averageConfidence,
      healthScore,
      inspectionCount,
    };
  }, [detections]);

  const totalChange =
    statistics.total > 0 ? "Live" : "None";

  const criticalChange =
    statistics.critical > 0 ? "Attention" : "None";

  return (
    <div className="space-y-6">
      {/* API ERROR */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          <p className="font-semibold">
            Unable to load dashboard data
          </p>
          <p className="mt-1">{error}</p>
          <p className="mt-1 text-red-200/70">
            Check that MongoDB and the backend server are running.
          </p>
        </div>
      )}

      {/* HERO */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <HeroInspection />
        <LiveDetectionFeed />
      </div>

      {/* STATISTICS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          type="health"
          title="Road Health Score"
          value={
            loading || error
              ? "..."
              : `${statistics.healthScore}/100`
          }
          change={loading ? "Loading" : error ? "Unavailable" : "Estimated"}
        />

        <StatCard
          type="issues"
          title="Total Detections"
          value={
            loading || error
              ? "..."
              : statistics.total.toString()
          }
          change={loading ? "Loading" : error ? "Unavailable" : totalChange}
        />

        <StatCard
          type="critical"
          title="Critical Issues"
          value={
            loading || error
              ? "..."
              : statistics.critical.toString()
          }
          change={
            loading ? "Loading" : error ? "Unavailable" : criticalChange
          }
          positive={!loading && !error && statistics.critical === 0}
        />

        <StatCard
          type="inspections"
          title="Images Inspected"
          value={
            loading || error
              ? "..."
              : statistics.inspectionCount.toString()
          }
          change={loading ? "Loading" : error ? "Unavailable" : "By image"}
        />
      </section>

      {/* DETECTION SUMMARY */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              AI Detection
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              Detection Summary
            </h2>
          </div>

          <div className="text-sm text-slate-400">
            Average confidence:
            <span className="ml-2 font-semibold text-emerald-400">
              {loading
                ? "..."
                : error
                  ? "Unavailable"
                  : `${(statistics.averageConfidence * 100).toFixed(1)}%`}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-red-500/10 p-4">
            <p className="text-xs text-slate-400">High</p>
            <p className="mt-1 text-2xl font-bold text-red-400">
              {loading || error ? "..." : statistics.high}
            </p>
          </div>

          <div className="rounded-xl bg-yellow-500/10 p-4">
            <p className="text-xs text-slate-400">Medium</p>
            <p className="mt-1 text-2xl font-bold text-yellow-400">
              {loading || error ? "..." : statistics.medium}
            </p>
          </div>

          <div className="rounded-xl bg-emerald-500/10 p-4">
            <p className="text-xs text-slate-400">Low</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {loading || error ? "..." : statistics.low}
            </p>
          </div>

          <div className="rounded-xl bg-purple-500/10 p-4">
            <p className="text-xs text-slate-400">Critical</p>
            <p className="mt-1 text-2xl font-bold text-purple-400">
              {loading || error ? "..." : statistics.critical}
            </p>
          </div>
        </div>
      </section>

      {/* ANALYTICS */}
      <div className="grid gap-5 xl:grid-cols-2">
        <DamageAnalytics />
        <DamageTrend />
      </div>

      {/* ROAD HEALTH MAP */}
      <RoadHealthMap />

      {/* RECENT INSPECTIONS AND PRIORITY ROADS */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <RecentInspections />
        <PriorityRoads />
      </div>
    </div>
  );
}

export default Dashboard;
