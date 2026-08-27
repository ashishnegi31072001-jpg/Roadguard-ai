import {
  Activity,
  AlertTriangle,
  MapPinned,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type StatType = "health" | "issues" | "critical" | "inspections";

interface StatCardProps {
  type: StatType;
  title: string;
  value: string;
  change: string;
  positive?: boolean;
}

const config = {
  health: {
    icon: ShieldCheck,
    iconClass: "text-emerald-400 bg-emerald-400/10",
  },
  issues: {
    icon: Activity,
    iconClass: "text-orange-400 bg-orange-400/10",
  },
  critical: {
    icon: AlertTriangle,
    iconClass: "text-red-400 bg-red-400/10",
  },
  inspections: {
    icon: MapPinned,
    iconClass: "text-sky-400 bg-sky-400/10",
  },
};

function StatCard({
  type,
  title,
  value,
  change,
  positive = true,
}: StatCardProps) {
  const Icon = config[type].icon;

  return (
    <div
      className="
        group rounded-2xl border border-[var(--border)]
        bg-[var(--surface)]
        p-5
        transition-all duration-300
        hover:-translate-y-1
        hover:border-emerald-400/20
        hover:shadow-xl
        hover:shadow-black/10
      "
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${config[type].iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div
          className={`
            flex items-center gap-1 text-xs font-medium
            ${positive ? "text-emerald-400" : "text-red-400"}
          `}
        >
          {positive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}

          {change}
        </div>
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {title}
      </p>

      <div className="mt-1 text-3xl font-bold tracking-tight text-[var(--text)]">
        {value}
      </div>

      <p className="mt-1 text-[11px] text-[var(--muted)]">
        From last month
      </p>
    </div>
  );
}

export default StatCard;