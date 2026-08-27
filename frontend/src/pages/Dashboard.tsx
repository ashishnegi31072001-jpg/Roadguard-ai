import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const stats = [
  {
    title: "Road Health",
    value: "82",
    unit: "/100",
    description: "Overall network condition",
    icon: ShieldCheck,
  },
  {
    title: "Detected Damages",
    value: "128",
    unit: "",
    description: "Across monitored roads",
    icon: MapPin,
  },
  {
    title: "Critical Issues",
    value: "17",
    unit: "",
    description: "Require urgent attention",
    icon: AlertTriangle,
  },
  {
    title: "Inspected Roads",
    value: "1,245",
    unit: "",
    description: "Total analyzed segments",
    icon: CheckCircle2,
  },
];

function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Hero */}
      <section>
        <p className="mb-2 text-sm font-medium text-emerald-400">
          ROAD INTELLIGENCE
        </p>

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Good morning, Admin
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Monitor road conditions, analyze damage and prioritize
              maintenance using AI-powered road intelligence.
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
            Analyze Road
            <ArrowUpRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-400">
                {stat.title}
              </p>

              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">
                  {stat.value}
                </span>

                <span className="text-sm text-slate-500">
                  {stat.unit}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {stat.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Main panels */}
      <section className="grid gap-6 xl:grid-cols-3">

        {/* Map */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Road Condition Map
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recent detected road damage
              </p>
            </div>

            <button className="text-sm text-emerald-400 hover:text-emerald-300">
              View map
            </button>
          </div>

          <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950">
            <div className="text-center">
              <MapPin className="mx-auto h-10 w-10 text-slate-600" />

              <p className="mt-3 font-medium text-slate-400">
                Interactive map coming soon
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Leaflet + OpenStreetMap
              </p>
            </div>
          </div>
        </div>

        {/* Severity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="font-semibold text-white">
            Severity Distribution
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current detected damage
          </p>

          <div className="mt-8 space-y-6">

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-300">
                  High
                </span>

                <span className="text-red-400">
                  17
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 w-[35%] rounded-full bg-red-500" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-300">
                  Medium
                </span>

                <span className="text-orange-400">
                  46
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 w-[65%] rounded-full bg-orange-500" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-300">
                  Low
                </span>

                <span className="text-yellow-400">
                  65
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-2 w-[80%] rounded-full bg-yellow-500" />
              </div>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
}

export default Dashboard;