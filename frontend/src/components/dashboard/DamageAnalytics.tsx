import {
  AlertTriangle,
  CircleAlert,
  Construction,
  Layers,
} from "lucide-react";

const damageTypes = [
  {
    name: "Potholes",
    count: 54,
    percentage: 42,
    className: "bg-red-400",
    icon: AlertTriangle,
  },
  {
    name: "Cracks",
    count: 46,
    percentage: 36,
    className: "bg-orange-400",
    icon: Construction,
  },
  {
    name: "Surface Damage",
    count: 18,
    percentage: 14,
    className: "bg-yellow-400",
    icon: CircleAlert,
  },
  {
    name: "Other Damage",
    count: 10,
    percentage: 8,
    className: "bg-emerald-400",
    icon: Layers,
  },
];

function DamageAnalytics() {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text)]">
            Damage Analytics
          </h2>

          <p className="mt-1 text-[11px] text-[var(--muted)]">
            Detected road damage distribution
          </p>
        </div>

        <button className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[10px] text-[var(--muted)] transition hover:text-emerald-400">
          This Month
        </button>
      </div>

      {/* CONTENT */}

      <div className="mt-7 flex flex-col items-center gap-8 sm:flex-row">

        {/* DONUT */}

        <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">

          <div
            className="
              absolute inset-0 rounded-full
              bg-[conic-gradient(#f87171_0deg_151deg,#fb923c_151deg_281deg,#facc15_281deg_331deg,#34d399_331deg_360deg)]
            "
          />

          <div className="absolute inset-[15px] rounded-full bg-[var(--surface)]" />

          <div className="relative z-10 text-center">
            <p className="text-3xl font-bold text-[var(--text)]">
              128
            </p>

            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              Total Issues
            </p>
          </div>

        </div>

        {/* LEGEND */}

        <div className="w-full space-y-4">

          {damageTypes.map((damage) => {
            const Icon = damage.icon;

            return (
              <div key={damage.name}>

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${damage.className}`}
                    />

                    <Icon className="h-3.5 w-3.5 text-[var(--muted)]" />

                    <span className="text-xs text-[var(--text-secondary)]">
                      {damage.name}
                    </span>

                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--text)]">
                      {damage.count}
                    </span>

                    <span className="text-[10px] text-[var(--muted)]">
                      ({damage.percentage}%)
                    </span>
                  </div>

                </div>

                <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
                  <div
                    className={`h-full rounded-full ${damage.className}`}
                    style={{
                      width: `${damage.percentage}%`,
                    }}
                  />
                </div>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}

export default DamageAnalytics;