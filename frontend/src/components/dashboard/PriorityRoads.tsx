import {
  ArrowUpRight,
  ChevronRight,
  CircleAlert,
} from "lucide-react";

const roads = [
  {
    rank: "01",
    name: "NH-48, Sector 12",
    score: 94,
    severity: "Critical",
  },
  {
    rank: "02",
    name: "Ring Road, East",
    score: 88,
    severity: "Critical",
  },
  {
    rank: "03",
    name: "MG Road, Downtown",
    score: 76,
    severity: "High",
  },
  {
    rank: "04",
    name: "University Road",
    score: 61,
    severity: "Medium",
  },
  {
    rank: "05",
    name: "City Center Road",
    score: 49,
    severity: "Medium",
  },
];

function PriorityRoads() {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text)]">
            Top Priority Roads
          </h2>

          <p className="mt-1 text-[11px] text-[var(--muted)]">
            Roads requiring immediate attention
          </p>
        </div>

        <button className="flex items-center gap-1 text-xs text-[var(--muted)] transition hover:text-emerald-400">
          View All
          <ArrowUpRight className="h-3 w-3" />
        </button>

      </div>

      {/* ROADS */}

      <div className="mt-5">

        {roads.map((road, index) => (

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

            <span className="w-6 text-[10px] font-semibold text-[var(--muted)]">
              {road.rank}
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
                  road.severity === "Critical"
                    ? "bg-red-500/10 text-red-400"
                    : road.severity === "High"
                    ? "bg-orange-400/10 text-orange-400"
                    : "bg-yellow-400/10 text-yellow-400"
                }
              `}
            >
              <CircleAlert className="h-4 w-4" />
            </div>

            {/* ROAD */}

            <div className="min-w-0 flex-1">

              <p className="truncate text-xs font-semibold text-[var(--text)]">
                {road.name}
              </p>

              <p className="mt-1 text-[10px] text-[var(--muted)]">
                Road damage priority
              </p>

            </div>

            {/* SCORE */}

            <div className="text-right">

              <div
                className={`
                  text-sm
                  font-bold

                  ${
                    road.severity === "Critical"
                      ? "text-red-400"
                      : road.severity === "High"
                      ? "text-orange-400"
                      : "text-yellow-400"
                  }
                `}
              >
                {road.score}
              </div>

              <div className="text-[9px] text-[var(--muted)]">
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
                  road.severity === "Critical"
                    ? "bg-red-500/10 text-red-400"
                    : road.severity === "High"
                    ? "bg-orange-400/10 text-orange-400"
                    : "bg-yellow-400/10 text-yellow-400"
                }
              `}
            >
              {road.severity}
            </span>

            <ChevronRight className="h-4 w-4 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-emerald-400" />

          </div>

        ))}

      </div>

    </section>
  );
}

export default PriorityRoads;