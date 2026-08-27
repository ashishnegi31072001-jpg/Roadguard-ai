import {
  Activity,
  BarChart3,
  FileText,
  LayoutDashboard,
  Map,
  Settings,
  Upload,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Analyze Road",
    icon: Upload,
  },
  {
    name: "Road Map",
    icon: Map,
  },
  {
    name: "Analytics",
    icon: BarChart3,
  },
  {
    name: "Reports",
    icon: FileText,
  },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950 text-white">
      <div className="flex h-full flex-col">

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
            <Activity className="h-6 w-6 text-slate-950" />
          </div>

          <div>
            <h1 className="font-bold tracking-wide">
              RoadGuard
            </h1>

            <p className="text-xs text-slate-400">
              AI Road Intelligence
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <Icon className="h-5 w-5" />

                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-800 p-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </div>

      </div>
    </aside>
  );
}

export default Sidebar;