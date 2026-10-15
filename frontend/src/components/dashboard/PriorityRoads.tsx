import {
  ArrowUpRight,
  ChevronRight,
  CircleAlert,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Detection {
  _id: string;
  damageType: string;
  severity:
    | "Low"
    | "Medium"
    | "High"
    | "Critical";
  confidence: number;
  location?: {
    road?: string;
    area?: string;
  };
  createdAt: string;
}

interface PriorityRoad {
  name: string;
  score: number;
  severity:
    | "Low"
    | "Medium"
    | "High"
    | "Critical";
  count: number;
}

const API_URL =
  "http://localhost:5000/api/detections";

function PriorityRoads() {
  const [detections, setDetections] =
    useState<Detection[]>([]);

  const [loading, setLoading] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | FETCH DETECTIONS
  |--------------------------------------------------------------------------
  */

  const fetchDetections = async () => {
    try {
      setLoading(true);

      const response =
        await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          "Failed to fetch detections"
        );
      }

      const data =
        await response.json();

      if (data.success) {
        setDetections(
          data.detections || []
        );
      }
    } catch (error) {
      console.error(
        "Priority roads error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchDetections();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CALCULATE PRIORITY ROADS
  |--------------------------------------------------------------------------
  */

  const roads = useMemo(() => {
    const grouped: Record<
      string,
      Detection[]
    > = {};

    detections.forEach(
      (detection) => {
        const road =
          detection.location?.road ||
          "Unknown Road";

        if (!grouped[road]) {
          grouped[road] = [];
        }

        grouped[road].push(
          detection
        );
      }
    );

    const severityValue = {
      Low: 1,
      Medium: 2,
      High: 3,
      Critical: 4,
    };

    const result: PriorityRoad[] =
      Object.entries(grouped).map(
        ([name, items]) => {
          const highestSeverity =
            items.reduce(
              (highest, item) =>
                severityValue[
                  item.severity
                ] >
                severityValue[
                  highest
                ]
                  ? item.severity
                  : highest,
              "Low" as Detection["severity"]
            );

          const averageConfidence =
            items.reduce(
              (sum, item) =>
                sum +
                item.confidence,
              0
            ) / items.length;

          /*
          |----------------------------------------------------------------
          | Priority score
          |----------------------------------------------------------------
          |
          | Severity contributes the most.
          | More detections increase priority.
          | Confidence slightly increases the score.
          |
          */

          const severityScore =
            severityValue[
              highestSeverity
            ] * 20;

          const detectionScore =
            Math.min(
              items.length * 10,
              30
            );

          const confidenceScore =
            averageConfidence * 20;

          const score = Math.min(
            100,
            Math.round(
              severityScore +
                detectionScore +
                confidenceScore
            )
          );

          return {
            name,
            score,
            severity:
              highestSeverity,
            count: items.length,
          };
        }
      );

    /*
    |--------------------------------------------------------------------------
    | SORT HIGHEST PRIORITY FIRST
    |--------------------------------------------------------------------------
    */

    return result
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 5);
  }, [detections]);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <section
      className="
        rounded-2xl
        border border-[var(--border)]
        bg-[var(--surface)]
        p-5
      "
    >

      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <div>

          <h2
            className="
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-[var(--text)]
            "
          >
            Top Priority Roads
          </h2>

          <p
            className="
              mt-1
              text-[11px]
              text-[var(--muted)]
            "
          >
            Roads requiring immediate attention
          </p>

        </div>

        <button
          type="button"
          onClick={fetchDetections}
          disabled={loading}
          title="Refresh priority roads"
          className="
            rounded-lg
            border
            border-[var(--border)]
            p-2
            text-[var(--muted)]
            transition
            hover:text-emerald-400
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
        </button>

      </div>

      {/* ================================================================ */}
      {/* LOADING */}
      {/* ================================================================ */}

      {loading && (
        <div
          className="
            flex
            items-center
            justify-center
            py-12
            text-xs
            text-[var(--muted)]
          "
        >
          <RefreshCw
            className="
              mr-2
              h-4
              w-4
              animate-spin
            "
          />

          Loading priority roads...
        </div>
      )}

      {/* ================================================================ */}
      {/* EMPTY */}
      {/* ================================================================ */}

      {!loading &&
        roads.length === 0 && (
          <div
            className="
              py-12
              text-center
            "
          >
            <CircleAlert
              className="
                mx-auto
                h-8
                w-8
                text-[var(--muted)]
              "
            />

            <p
              className="
                mt-3
                text-sm
                font-medium
                text-[var(--text)]
              "
            >
              No priority roads
            </p>

            <p
              className="
                mt-1
                text-xs
                text-[var(--muted)]
              "
            >
              Priority roads will appear
              after road damage is detected.
            </p>
          </div>
        )}

      {/* ================================================================ */}
      {/* ROADS */}
      {/* ================================================================ */}

      {!loading &&
        roads.length > 0 && (
          <div className="mt-5">

            {roads.map(
              (road, index) => (
                <div
                  key={road.name}
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    border-b
                    border-[var(--border)]
                    py-4
                    last:border-b-0
                  "
                >

                  {/* RANK */}

                  <span
                    className="
                      w-6
                      text-[10px]
                      font-semibold
                      text-[var(--muted)]
                    "
                  >
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  {/* ICON */}

                  <div
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg

                      ${
                        road.severity ===
                        "Critical"
                          ? "bg-red-500/10 text-red-400"
                          : road.severity ===
                            "High"
                          ? "bg-orange-400/10 text-orange-400"
                          : road.severity ===
                            "Medium"
                          ? "bg-yellow-400/10 text-yellow-400"
                          : "bg-emerald-400/10 text-emerald-400"
                      }
                    `}
                  >
                    <CircleAlert
                      className="h-4 w-4"
                    />
                  </div>

                  {/* ROAD */}

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >

                    <p
                      className="
                        truncate
                        text-xs
                        font-semibold
                        text-[var(--text)]
                      "
                      title={road.name}
                    >
                      {road.name}
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        text-[var(--muted)]
                      "
                    >
                      {road.count}{" "}
                      {road.count === 1
                        ? "detection"
                        : "detections"}
                    </p>

                  </div>

                  {/* SCORE */}

                  <div className="text-right">

                    <div
                      className={`
                        text-sm
                        font-bold

                        ${
                          road.severity ===
                          "Critical"
                            ? "text-red-400"
                            : road.severity ===
                              "High"
                            ? "text-orange-400"
                            : road.severity ===
                              "Medium"
                            ? "text-yellow-400"
                            : "text-emerald-400"
                        }
                      `}
                    >
                      {road.score}
                    </div>

                    <div
                      className="
                        text-[9px]
                        text-[var(--muted)]
                      "
                    >
                      Priority
                    </div>

                  </div>

                  {/* SEVERITY */}

                  <span
                    className={`
                      hidden
                      rounded-md
                      px-2
                      py-1
                      text-[9px]
                      font-semibold
                      sm:block

                      ${
                        road.severity ===
                        "Critical"
                          ? "bg-red-500/10 text-red-400"
                          : road.severity ===
                            "High"
                          ? "bg-orange-400/10 text-orange-400"
                          : road.severity ===
                            "Medium"
                          ? "bg-yellow-400/10 text-yellow-400"
                          : "bg-emerald-400/10 text-emerald-400"
                      }
                    `}
                  >
                    {road.severity}
                  </span>

                  <ChevronRight
                    className="
                      h-4
                      w-4
                      text-[var(--muted)]
                      transition
                      group-hover:translate-x-1
                      group-hover:text-emerald-400
                    "
                  />

                </div>
              )
            )}

          </div>
        )}

    </section>
  );
}

export default PriorityRoads;