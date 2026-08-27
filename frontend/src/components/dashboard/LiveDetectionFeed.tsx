import { ArrowUpRight } from "lucide-react";

const detections = [
  {
    image:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=400&q=80",
    title: "Pothole Detected",
    location: "NH-48, Sector 12",
    time: "2 min ago",
    severity: "High",
  },
  {
    image:
      "https://images.unsplash.com/photo-150053085772?auto=format&fit=crop&w=400&q=80",
    title: "Crack Detected",
    location: "MG Road, Downtown",
    time: "5 min ago",
    severity: "Medium",
  },
  {
    image:
      "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=400&q=80",
    title: "Pothole Detected",
    location: "Ring Road, East",
    time: "8 min ago",
    severity: "High",
  },
  {
    image:
      "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=400&q=80",
    title: "Surface Damage",
    location: "University Road",
    time: "12 min ago",
    severity: "Low",
  },
];

function LiveDetectionFeed() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--text)]">
          Live Detection Feed
        </h2>

        <button className="text-xs text-[var(--muted)] transition hover:text-emerald-400">
          View All
        </button>
      </div>

      <div className="mt-4 space-y-3">

        {detections.map((detection) => (
          <div
            key={`${detection.title}-${detection.time}`}
            className="
              flex items-center gap-3
              rounded-xl
              border border-transparent
              p-2
              transition
              hover:border-[var(--border)]
              hover:bg-[var(--surface-2)]
            "
          >
            <img
              src={detection.image}
              alt={detection.title}
              className="h-12 w-14 rounded-lg object-cover"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[var(--text)]">
                {detection.title}
              </p>

              <p className="truncate text-[10px] text-[var(--muted)]">
                {detection.location}
              </p>

              <p className="mt-0.5 text-[9px] text-[var(--muted)]">
                {detection.time}
              </p>
            </div>

            <span
              className={`
                rounded-md border px-2 py-1
                text-[9px] font-semibold

                ${
                  detection.severity === "High"
                    ? "border-red-400/30 bg-red-400/10 text-red-400"
                    : detection.severity === "Medium"
                      ? "border-orange-400/30 bg-orange-400/10 text-orange-400"
                      : "border-yellow-400/30 bg-yellow-400/10 text-yellow-400"
                }
              `}
            >
              {detection.severity}
            </span>
          </div>
        ))}

      </div>

      <button
        className="
          mt-3 flex w-full
          items-center justify-center gap-2
          rounded-xl border border-[var(--border)]
          py-2.5
          text-xs font-medium
          text-[var(--muted)]
          transition
          hover:border-emerald-400/30
          hover:text-emerald-400
        "
      >
        Open Detection Center
        <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default LiveDetectionFeed;