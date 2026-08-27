import {
  Crosshair,
  Layers,
  MapPin,
  Plus,
  Minus,
} from "lucide-react";

const locations = [
  {
    name: "NH-48",
    x: "27%",
    y: "35%",
    type: "critical",
  },
  {
    name: "Ring Road",
    x: "62%",
    y: "27%",
    type: "high",
  },
  {
    name: "MG Road",
    x: "45%",
    y: "64%",
    type: "medium",
  },
  {
    name: "University Road",
    x: "77%",
    y: "70%",
    type: "low",
  },
];

const markerStyles = {
  critical: "bg-red-500 shadow-red-500/50",
  high: "bg-orange-400 shadow-orange-400/50",
  medium: "bg-yellow-400 shadow-yellow-400/50",
  low: "bg-emerald-400 shadow-emerald-400/50",
};

function RoadHealthMap() {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">

      {/* HEADER */}

      <div className="flex items-center justify-between p-5">

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text)]">
            Road Health Map
          </h2>

          <p className="mt-1 text-[11px] text-[var(--muted)]">
            Live infrastructure condition
          </p>
        </div>

        <button className="text-xs text-[var(--muted)] transition hover:text-emerald-400">
          View Full Map
        </button>

      </div>

      {/* MAP */}

      <div
        className="
          relative h-[320px]
          overflow-hidden
          border-y border-[var(--border)]
          bg-[#0b151b]
        "
      >

        {/* MAP GRID */}

        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(30deg, transparent 48%, rgba(255,255,255,.05) 49%, transparent 51%),
              linear-gradient(120deg, transparent 48%, rgba(255,255,255,.04) 49%, transparent 51%),
              linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)
            `,
            backgroundSize:
              "140px 140px, 180px 180px, 40px 40px, 40px 40px",
          }}
        />

        {/* FAKE ROADS */}

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 600 320"
          preserveAspectRatio="none"
        >
          <path
            d="M-20 220 C120 170 120 80 240 120 S400 260 620 80"
            fill="none"
            stroke="#33434c"
            strokeWidth="15"
          />

          <path
            d="M-20 220 C120 170 120 80 240 120 S400 260 620 80"
            fill="none"
            stroke="#60727c"
            strokeWidth="2"
          />

          <path
            d="M70 320 C140 250 250 260 320 170 S450 80 540 -20"
            fill="none"
            stroke="#293940"
            strokeWidth="11"
          />

          <path
            d="M70 320 C140 250 250 260 320 170 S450 80 540 -20"
            fill="none"
            stroke="#53636b"
            strokeWidth="2"
          />

          <path
            d="M0 65 C120 110 230 45 330 80 S480 160 620 135"
            fill="none"
            stroke="#28383f"
            strokeWidth="9"
          />

          <path
            d="M0 65 C120 110 230 45 330 80 S480 160 620 135"
            fill="none"
            stroke="#4d5c63"
            strokeWidth="2"
          />
        </svg>

        {/* LOCATION MARKERS */}

        {locations.map((location) => (
          <div
            key={location.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: location.x,
              top: location.y,
            }}
          >

            <div
              className={`
                h-5 w-5
                rounded-full
                border-2 border-white/70
                shadow-lg
                ${markerStyles[location.type as keyof typeof markerStyles]}
              `}
            />

            <div className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/70 px-2 py-1 text-[9px] text-white backdrop-blur-md">
              {location.name}
            </div>

          </div>
        ))}

        {/* MAP CONTROLS */}

        <div className="absolute right-4 top-4 flex flex-col overflow-hidden rounded-lg border border-white/10 bg-black/50 backdrop-blur-md">

          <button className="flex h-9 w-9 items-center justify-center text-white transition hover:bg-white/10">
            <Plus className="h-4 w-4" />
          </button>

          <div className="h-px bg-white/10" />

          <button className="flex h-9 w-9 items-center justify-center text-white transition hover:bg-white/10">
            <Minus className="h-4 w-4" />
          </button>

        </div>

        <button className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/50 text-white backdrop-blur-md transition hover:bg-white/10">
          <Crosshair className="h-4 w-4" />
        </button>

        <button className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-[10px] text-white backdrop-blur-md">
          <Layers className="h-3.5 w-3.5" />
          Road Health
        </button>

      </div>

      {/* LEGEND */}

      <div className="flex flex-wrap gap-5 p-4">

        <Legend color="bg-red-500" label="Critical" />
        <Legend color="bg-orange-400" label="High" />
        <Legend color="bg-yellow-400" label="Medium" />
        <Legend color="bg-emerald-400" label="Low" />

      </div>

    </section>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">

      <span className={`h-2 w-2 rounded-full ${color}`} />

      <span className="text-[10px] text-[var(--muted)]">
        {label}
      </span>

    </div>
  );
}

export default RoadHealthMap;