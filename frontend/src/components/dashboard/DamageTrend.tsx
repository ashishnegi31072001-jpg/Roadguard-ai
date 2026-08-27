import { ChevronDown, TrendingUp } from "lucide-react";

const points = [
  18, 25, 21, 29, 27, 35, 31, 38,
  34, 42, 39, 46, 41, 51, 47, 55,
  49, 57, 53, 62, 58, 68, 61, 72,
];

function DamageTrend() {
  const max = Math.max(...points);
  const min = Math.min(...points);

  const width = 700;
  const height = 220;

  const coordinates = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * width;

      const y =
        height -
        ((value - min) / (max - min)) * 160 -
        20;

      return `${x},${y}`;
    })
    .join(" ");

  const areaCoordinates = `0,${height} ${coordinates} ${width},${height}`;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">

      {/* HEADER */}

      <div className="flex items-start justify-between">

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text)]">
            Damage Trend
          </h2>

          <div className="mt-2 flex items-center gap-2">

            <span className="text-2xl font-bold text-[var(--text)]">
              72
            </span>

            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              12.4%
            </span>

          </div>
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-secondary)]">
          This Month
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

      </div>

      {/* CHART */}

      <div className="mt-6 overflow-hidden">

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[220px] w-full"
          preserveAspectRatio="none"
        >

          {/* GRID */}

          {[40, 80, 120, 160].map((y) => (
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
          ))}

          {/* AREA */}

          <polygon
            points={areaCoordinates}
            fill="currentColor"
            className="text-emerald-400"
            fillOpacity="0.08"
          />

          {/* LINE */}

          <polyline
            points={coordinates}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-400"
          />

          {/* CURRENT POINT */}

          <circle
            cx={width}
            cy={
              height -
              ((points[points.length - 1] - min) / (max - min)) *
                160 -
              20
            }
            r="5"
            fill="currentColor"
            className="text-emerald-400"
          />

        </svg>

        {/* MONTHS */}

        <div className="flex justify-between px-1 text-[9px] text-[var(--muted)]">
          <span>May 1</span>
          <span>May 8</span>
          <span>May 15</span>
          <span>May 22</span>
          <span>May 29</span>
        </div>

      </div>

    </section>
  );
}

export default DamageTrend;