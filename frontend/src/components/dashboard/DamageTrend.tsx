import {
  ChevronDown,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Detection {
  _id: string;
  damageType: string;
  severity: string;
  confidence: number;
  createdAt: string;
}

const API_URL =
  "http://localhost:5000/api/detections";

function DamageTrend() {
  const [detections, setDetections] = useState<
    Detection[]
  >([]);

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
        "Damage trend error:",
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
  | CREATE LAST 30 DAYS
  |--------------------------------------------------------------------------
  */

  const dailyData = useMemo(() => {
    const days: {
      date: Date;
      label: string;
      count: number;
    }[] = [];

    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);

      date.setDate(
        today.getDate() - i
      );

      date.setHours(
        0,
        0,
        0,
        0
      );

      const nextDay =
        new Date(date);

      nextDay.setDate(
        date.getDate() + 1
      );

      const count =
        detections.filter(
          (detection) => {
            const detectionDate =
              new Date(
                detection.createdAt
              );

            return (
              detectionDate >=
                date &&
              detectionDate <
                nextDay
            );
          }
        ).length;

      days.push({
        date,
        label: date.toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        ),
        count,
      });
    }

    return days;
  }, [detections]);

  /*
  |--------------------------------------------------------------------------
  | CHART VALUES
  |--------------------------------------------------------------------------
  */

  const points = useMemo(
    () =>
      dailyData.map(
        (day) => day.count
      ),
    [dailyData]
  );

  const total = detections.length;

  const max =
    Math.max(...points, 1);

  const min = 0;

  /*
  |--------------------------------------------------------------------------
  | CHART DIMENSIONS
  |--------------------------------------------------------------------------
  */

  const width = 700;
  const height = 220;

  const coordinates = points
    .map((value, index) => {
      const x =
        points.length === 1
          ? width / 2
          : (index /
              (points.length - 1)) *
            width;

      const y =
        height -
        ((value - min) /
          (max - min || 1)) *
          160 -
        20;

      return `${x},${y}`;
    })
    .join(" ");

  const areaCoordinates =
    `0,${height} ${coordinates} ${width},${height}`;

  /*
  |--------------------------------------------------------------------------
  | TREND
  |--------------------------------------------------------------------------
  */

  const firstHalf =
    points.slice(0, 15);

  const secondHalf =
    points.slice(15);

  const firstTotal =
    firstHalf.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const secondTotal =
    secondHalf.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  let trend = 0;

  if (firstTotal > 0) {
    trend =
      ((secondTotal -
        firstTotal) /
        firstTotal) *
      100;
  } else if (
    secondTotal > 0
  ) {
    trend = 100;
  }

  const trendText =
    trend >= 0
      ? `+${trend.toFixed(1)}%`
      : `${trend.toFixed(1)}%`;

  /*
  |--------------------------------------------------------------------------
  | CURRENT POINT
  |--------------------------------------------------------------------------
  */

  const lastValue =
    points[points.length - 1] || 0;

  const lastY =
    height -
    ((lastValue - min) /
      (max - min || 1)) *
      160 -
    20;

  /*
  |--------------------------------------------------------------------------
  | MONTH LABELS
  |--------------------------------------------------------------------------
  */

  const labels = [
    dailyData[0],
    dailyData[7],
    dailyData[14],
    dailyData[21],
    dailyData[29],
  ];

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

      <div className="flex items-start justify-between">

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
            Damage Trend
          </h2>

          <div className="mt-2 flex items-center gap-2">

            <span
              className="
                text-2xl
                font-bold
                text-[var(--text)]
              "
            >
              {loading
                ? "..."
                : total}
            </span>

            {!loading && (
              <span
                className={`
                  flex
                  items-center
                  gap-1
                  text-xs
                  ${
                    trend >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                `}
              >
                <TrendingUp
                  className="h-3 w-3"
                />

                {trendText}
              </span>
            )}

          </div>

          <p
            className="
              mt-1
              text-[10px]
              text-[var(--muted)]
            "
          >
            Total detections in the last
            30 days
          </p>

        </div>

        {/* REFRESH */}

        <button
          type="button"
          onClick={fetchDetections}
          disabled={loading}
          title="Refresh trend"
          className="
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-[var(--border)]
            bg-[var(--surface-2)]
            px-3
            py-2
            text-xs
            text-[var(--text-secondary)]
            transition
            hover:text-emerald-400
            disabled:opacity-50
          "
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />

          <span className="hidden sm:inline">
            This Month
          </span>

          <ChevronDown
            className="h-3.5 w-3.5"
          />
        </button>

      </div>

      {/* ================================================================ */}
      {/* CHART */}
      {/* ================================================================ */}

      <div className="mt-6 overflow-hidden">

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[220px] w-full"
          preserveAspectRatio="none"
        >

          {/* GRID */}

          {[40, 80, 120, 160].map(
            (y) => (
              <line
                key={y}
                x1="0"
                x2={width}
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="4 5"
              />
            )
          )}

          {/* AREA */}

          {!loading &&
            coordinates && (
              <polygon
                points={
                  areaCoordinates
                }
                fill="currentColor"
                className="text-emerald-400"
                fillOpacity="0.08"
              />
            )}

          {/* LINE */}

          {!loading &&
            coordinates && (
              <polyline
                points={
                  coordinates
                }
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-400"
              />
            )}

          {/* CURRENT POINT */}

          {!loading &&
            points.length > 0 && (
              <circle
                cx={width}
                cy={lastY}
                r="5"
                fill="currentColor"
                className="text-emerald-400"
              />
            )}

        </svg>

        {/* DATE LABELS */}

        <div
          className="
            flex
            justify-between
            px-1
            text-[9px]
            text-[var(--muted)]
          "
        >
          {labels.map(
            (item, index) => (
              <span key={index}>
                {item?.label || ""}
              </span>
            )
          )}
        </div>

      </div>

    </section>
  );
}

export default DamageTrend;