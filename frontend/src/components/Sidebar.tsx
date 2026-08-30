import {
  Activity,
  BarChart3,
  FileText,
  LayoutDashboard,
  Map,
  Settings,
  Upload,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    name: "Analyze Road",
    icon: Upload,
    path: "/analyze",
  },
  {
    name: "Detections",
    icon: Activity,
    path: "/detections",
  },
  {
    name: "Road Map",
    icon: Map,
    path: "/map",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    name: "Reports",
    icon: FileText,
    path: "/reports",
  },
];

function Sidebar() {
  return (
    <aside
      className="
        fixed left-0 top-0 z-40
        h-screen w-64
        border-r border-slate-800
        bg-slate-950
        text-white
      "
    >
      <div className="flex h-full flex-col">

        {/* ================= LOGO ================= */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
          <div
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              bg-emerald-500
              shadow-lg shadow-emerald-500/20
            "
          >
            <Activity className="h-6 w-6 text-slate-950" />
          </div>

          <div>
            <h1 className="font-bold tracking-wide">
              RoadGuard AI
            </h1>

            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Road Intelligence
            </p>
          </div>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="flex-1 space-y-2 px-4 py-6">

          <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `
                  group flex w-full items-center gap-3
                  rounded-xl px-4 py-3
                  text-left text-sm font-medium
                  transition-all duration-200

                  ${
                    isActive
                      ? `
                        bg-emerald-500/15
                        text-emerald-400
                        ring-1 ring-emerald-500/20
                        shadow-lg shadow-emerald-500/5
                      `
                      : `
                        text-slate-400
                        hover:bg-slate-800
                        hover:text-white
                      `
                  }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`
                        h-5 w-5 transition-colors
                        ${
                          isActive
                            ? "text-emerald-400"
                            : "text-slate-500 group-hover:text-emerald-400"
                        }
                      `}
                    />

                    <span>{item.name}</span>

                    {/* Detection-style indicator */}
                    {item.name === "Analytics" && (
                      <span
                        className="
                          ml-auto rounded-full
                          bg-slate-800
                          px-2 py-0.5
                          text-[10px]
                          text-slate-400
                        "
                      >
                        Live
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ================= SYSTEM STATUS ================= */}
        <div className="mx-4 mb-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4">

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

            <span className="text-xs font-medium text-emerald-400">
              System Operational
            </span>
          </div>

          <div className="my-3 h-px bg-slate-800" />

          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            AI Model
          </p>

          <p className="mt-1 text-xs font-medium text-white">
            YOLOv8 RoadGuard
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              Accuracy
            </span>

            <span className="text-xs font-semibold text-emerald-400">
              96.7%
            </span>
          </div>
        </div>

        {/* ================= SETTINGS ================= */}
        <div className="border-t border-slate-800 p-4">

          <button
            type="button"
            className="
              group flex w-full items-center gap-3
              rounded-xl px-4 py-3
              text-sm text-slate-400
              transition
              hover:bg-slate-800
              hover:text-white
            "
          >
            <Settings
              className="
                h-5 w-5
                transition-colors
                group-hover:text-emerald-400
              "
            />

            <span>Settings</span>
          </button>

        </div>

      </div>
    </aside>
  );
}

export default Sidebar;