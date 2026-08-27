import { Clock, MapPin } from "lucide-react";

const inspections = [
  {
    road: "NH-48, Sector 12",
    type: "Pothole",
    severity: "High",
    time: "2 min ago",
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=700&q=80",
  },
  {
    road: "MG Road, Downtown",
    type: "Crack",
    severity: "Medium",
    time: "5 min ago",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80",
  },
  {
    road: "Ring Road, East",
    type: "Pothole",
    severity: "High",
    time: "8 min ago",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80",
  },
  {
    road: "University Road",
    type: "Surface Damage",
    severity: "Low",
    time: "12 min ago",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=700&q=80",
  },
  {
    road: "City Center Road",
    type: "Crack",
    severity: "Medium",
    time: "15 min ago",
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=700&q=80",
  },
];

const severityStyle = {
  High: "bg-red-500/90 text-white",
  Medium: "bg-orange-400/90 text-white",
  Low: "bg-yellow-400/90 text-black",
};

function RecentInspections() {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">

      {/* HEADER */}

      <div className="mb-5 flex items-center justify-between">

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text)]">
            Recent Inspections
          </h2>

          <p className="mt-1 text-[11px] text-[var(--muted)]">
            Latest AI road inspections
          </p>
        </div>

        <button className="text-xs text-[var(--muted)] transition hover:text-emerald-400">
          View All
        </button>

      </div>

      {/* CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

        {inspections.map((inspection) => (

          <div
            key={inspection.road}
            className="
              group
              cursor-pointer
              overflow-hidden
              rounded-xl
              border
              border-[var(--border)]
              bg-[var(--surface-2)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-emerald-400/40
              hover:shadow-lg
              hover:shadow-emerald-500/5
            "
          >

            {/* IMAGE */}

            <div className="relative h-28 overflow-hidden">

              <img
                src={inspection.image}
                alt={inspection.road}
                className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-110
                "
              />

              {/* DARK OVERLAY */}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              {/* SEVERITY */}

              <span
                className={`
                  absolute
                  left-2
                  top-2
                  rounded-md
                  px-2
                  py-1
                  text-[9px]
                  font-bold
                  uppercase
                  ${severityStyle[inspection.severity as keyof typeof severityStyle]}
                `}
              >
                {inspection.severity}
              </span>

            </div>

            {/* CONTENT */}

            <div className="p-3">

              <h3 className="truncate text-xs font-semibold text-[var(--text)]">
                {inspection.road}
              </h3>

              <div className="mt-2 flex items-center justify-between">

                <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                  <MapPin className="h-3 w-3" />
                  {inspection.type}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                  <Clock className="h-3 w-3" />
                  {inspection.time}
                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default RecentInspections;