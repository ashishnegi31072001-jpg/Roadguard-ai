import HeroInspection from "../components/dashboard/HeroInspection";
import LiveDetectionFeed from "../components/dashboard/LiveDetectionFeed";
import StatCard from "../components/dashboard/StatCard";

function Dashboard() {
  return (
    <div className="space-y-6">

      {/* HERO + LIVE FEED */}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">

        <HeroInspection />

        <LiveDetectionFeed />

      </div>

      {/* STATISTICS */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          type="health"
          title="Road Health Score"
          value="82"
          change="8%"
        />

        <StatCard
          type="issues"
          title="Active Issues"
          value="128"
          change="15%"
        />

        <StatCard
          type="critical"
          title="Critical Issues"
          value="17"
          change="5%"
          positive={false}
        />

        <StatCard
          type="inspections"
          title="Inspections"
          value="1,245"
          change="22%"
        />

      </section>

      {/* NEXT MODULES */}

      <div className="grid gap-5 xl:grid-cols-2">

        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text)]">
              Damage Analytics
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Coming in the next step
            </p>
          </div>
        </div>

        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text)]">
              Road Health Map
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Coming in the next step
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;