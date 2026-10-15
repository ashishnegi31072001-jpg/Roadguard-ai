import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CircleAlert,
  Construction,
  Layers,
  RefreshCw,
} from "lucide-react";

interface Detection {
  _id: string;
  damageType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  createdAt: string;
}

interface DamageItem {
  name: string;
  count: number;
  percentage: number;
  className: string;
  icon: typeof AlertTriangle;
}

const API_URL =
  "http://localhost:5000/api/detections";

function DamageAnalytics() {
  const [detections, setDetections] = useState<
    Detection[]
  >([]);

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | FETCH DETECTIONS
  |--------------------------------------------------------------------------
  */

  const fetchDetections = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          "Failed to fetch detections"
        );
      }

      const data = await response.json();

      if (data.success) {
        setDetections(
          data.detections || []
        );
      }
    } catch (error) {
      console.error(
        "Damage analytics error:",
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
  | CALCULATE DAMAGE TYPES
  |--------------------------------------------------------------------------
  */

  const damageTypes = useMemo(() => {
    const total = detections.length;

    if (total === 0) {
      return [];
    }

    /*
    |----------------------------------------------------------------------
    | Count each damage type
    |----------------------------------------------------------------------
    */

    const counts: Record<
      string,
      number
    > = {};

    detections.forEach((detection) => {
      const type =
        detection.damageType
          ?.toLowerCase()
          .trim() || "other";

      counts[type] =
        (counts[type] || 0) + 1;
    });

    /*
    |----------------------------------------------------------------------
    | Convert to UI format
    |----------------------------------------------------------------------
    */

    return Object.entries(counts)
      .sort(
        ([, countA], [, countB]) =>
          countB - countA
      )
      .slice(0, 4)
      .map(
        ([type, count], index) => {
          let name =
            type.charAt(0).toUpperCase() +
            type.slice(1);

          if (
            type === "pothole" ||
            type === "potholes"
          ) {
            name = "Potholes";
          } else if (
            type === "crack" ||
            type === "cracks"
          ) {
            name = "Cracks";
          } else if (
            type === "surface damage"
          ) {
            name = "Surface Damage";
          } else if (
            type === "other"
          ) {
            name = "Other Damage";
          }

          const percentage = Math.round(
            (count / total) * 100
          );

          const styles = [
            {
              className:
                "bg-red-400",
              icon: AlertTriangle,
            },
            {
              className:
                "bg-orange-400",
              icon: Construction,
            },
            {
              className:
                "bg-yellow-400",
              icon: CircleAlert,
            },
            {
              className:
                "bg-emerald-400",
              icon: Layers,
            },
          ];

          return {
            name,
            count,
            percentage,
            ...styles[index],
          };
        }
      );
  }, [detections]);

  /*
  |--------------------------------------------------------------------------
  | DONUT GRADIENT
  |--------------------------------------------------------------------------
  */

  const donutGradient = useMemo(() => {
    if (damageTypes.length === 0) {
      return "conic-gradient(#334155 0deg 360deg)";
    }

    const colors = [
      "#f87171",
      "#fb923c",
      "#facc15",
      "#34d399",
    ];

    let currentDegree = 0;

    const sections: string[] = [];

    damageTypes.forEach(
      (damage, index) => {
        const degree =
          (damage.percentage / 100) *
          360;

        const start =
          currentDegree;

        const end =
          currentDegree + degree;

        sections.push(
          `${colors[index]} ${start}deg ${end}deg`
        );

        currentDegree = end;
      }
    );

    return `conic-gradient(${sections.join(
      ", "
    )})`;
  }, [damageTypes]);

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

      <div className="flex items-center justify-between">

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
            Damage Analytics
          </h2>

          <p
            className="
              mt-1
              text-[11px]
              text-[var(--muted)]
            "
          >
            Detected road damage distribution
          </p>

        </div>

        <button
          type="button"
          onClick={fetchDetections}
          disabled={loading}
          title="Refresh analytics"
          className="
            rounded-lg
            border border-[var(--border)]
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
      {/* CONTENT */}
      {/* ================================================================ */}

      <div
        className="
          mt-7
          flex
          flex-col
          items-center
          gap-8
          sm:flex-row
        "
      >

        {/* ============================================================ */}
        {/* DONUT */}
        {/* ============================================================ */}

        <div
          className="
            relative
            flex
            h-48
            w-48
            shrink-0
            items-center
            justify-center
          "
        >

          <div
            className="
              absolute
              inset-0
              rounded-full
            "
            style={{
              background:
                donutGradient,
            }}
          />

          <div
            className="
              absolute
              inset-[15px]
              rounded-full
              bg-[var(--surface)]
            "
          />

          <div
            className="
              relative
              z-10
              text-center
            "
          >

            <p
              className="
                text-3xl
                font-bold
                text-[var(--text)]
              "
            >
              {loading
                ? "..."
                : detections.length}
            </p>

            <p
              className="
                text-[10px]
                uppercase
                tracking-wider
                text-[var(--muted)]
              "
            >
              Total Issues
            </p>

          </div>

        </div>

        {/* ============================================================ */}
        {/* LEGEND */}
        {/* ============================================================ */}

        <div className="w-full space-y-4">

          {loading && (
            <div
              className="
                flex
                items-center
                justify-center
                py-8
                text-xs
                text-[var(--muted)]
              "
            >
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />

              Loading analytics...
            </div>
          )}

          {!loading &&
            damageTypes.length === 0 && (
              <div
                className="
                  py-8
                  text-center
                  text-xs
                  text-[var(--muted)]
                "
              >
                No detection data available.
              </div>
            )}

          {!loading &&
            damageTypes.map(
              (damage) => {
                const Icon =
                  damage.icon;

                return (
                  <div
                    key={damage.name}
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <span
                          className={`
                            h-2.5
                            w-2.5
                            rounded-full
                            ${damage.className}
                          `}
                        />

                        <Icon
                          className="
                            h-3.5
                            w-3.5
                            text-[var(--muted)]
                          "
                        />

                        <span
                          className="
                            text-xs
                            text-[var(--text-secondary)]
                          "
                        >
                          {damage.name}
                        </span>

                      </div>

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <span
                          className="
                            text-xs
                            font-semibold
                            text-[var(--text)]
                          "
                        >
                          {damage.count}
                        </span>

                        <span
                          className="
                            text-[10px]
                            text-[var(--muted)]
                          "
                        >
                          ({damage.percentage}%)
                        </span>

                      </div>

                    </div>

                    {/* PROGRESS */}

                    <div
                      className="
                        mt-2
                        h-1
                        overflow-hidden
                        rounded-full
                        bg-[var(--surface-3)]
                      "
                    >

                      <div
                        className={`
                          h-full
                          rounded-full
                          ${damage.className}
                        `}
                        style={{
                          width: `${damage.percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

        </div>

      </div>

    </section>
  );
}

export default DamageAnalytics;