import HeroInspection from "../components/dashboard/HeroInspection";
import LiveDetectionFeed from "../components/dashboard/LiveDetectionFeed";
import StatCard from "../components/dashboard/StatCard";
import DamageAnalytics from "../components/dashboard/DamageAnalytics";
import DamageTrend from "../components/dashboard/DamageTrend";
import RoadHealthMap from "../components/dashboard/RoadHealthMap";
import RecentInspections from "../components/dashboard/RecentInspections";
import PriorityRoads from "../components/dashboard/PriorityRoads";
function Dashboard() {
  return (
    <div className="space-y-6">

      {/* HERO */}

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

      {/* ANALYTICS */}

      <div className="grid gap-5 xl:grid-cols-2">

        <DamageAnalytics />

        <DamageTrend />

      </div>

      {/* ROAD HEALTH MAP */}

      <RoadHealthMap />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">

  <RecentInspections />

  <PriorityRoads />

</div>

    </div>
  );
}

export default Dashboard;