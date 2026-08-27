import {
  Activity,
  AlertTriangle,
  BarChart3,
  FileText,
  Gauge,
  Map,
  ScanLine,
  Settings,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Dashboard",
    icon: Gauge,
    path: "/",
  },
  {
    label: "Analyze Road",
    icon: ScanLine,
    path: "/analyze",
  },
  {
    label: "Live Road Map",
    icon: Map,
    path: "/map",
  },
  {
    label: "Detections",
    icon: Activity,
    path: "/detections",
    badge: "128",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    label: "Reports",
    icon: FileText,
    path: "/reports",
  },
  {
    label: "Maintenance",
    icon: Wrench,
    path: "/maintenance",
  },
  {
    label: "Alerts",
    icon: AlertTriangle,
    path: "/alerts",
  },
];

function Sidebar() {
  return (
    <aside
      className="
        fixed
        left-0
        top-0
        z-50
        hidden
        h-screen
        w-[250px]
        border-r
        border-[var(--border)]
        bg-[var(--surface)]
        lg:block
      "
    >
      <div className="flex h-full flex-col">

        {/* =====================================================
            BRAND
        ====================================================== */}

        <div className="flex h-[88px] items-center gap-3 px-6">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-emerald-500/10
              ring-1
              ring-emerald-400/30
            "
          >
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>

          <div>
            <h1
              className="
                text-[17px]
                font-bold
                tracking-tight
                text-[var(--text)]
              "
            >
              RoadGuard AI
            </h1>

            <p
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-[var(--muted)]
              "
            >
              Road Intelligence
            </p>
          </div>

        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          <p
            className="
              mb-3
              px-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.15em]
              text-[var(--muted)]
            "
          >
            Workspace
          </p>

          <div className="space-y-1">

            {navigation.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className={({ isActive }) => `
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition-all
                    duration-200

                    ${
                      isActive
                        ? `
                          bg-emerald-500/15
                          text-emerald-400
                          ring-1
                          ring-emerald-400/10
                        `
                        : `
                          text-[var(--muted)]
                          hover:bg-[var(--surface-2)]
                          hover:text-[var(--text)]
                        `
                    }
                  `}
                >

                  {/* Icon */}

                  <Icon
                    className="
                      h-[18px]
                      w-[18px]
                      transition-colors
                      group-hover:text-emerald-400
                    "
                  />

                  {/* Label */}

                  <span>
                    {item.label}
                  </span>

                  {/* Badge */}

                  {item.badge && (
                    <span
                      className="
                        ml-auto
                        rounded-full
                        bg-[var(--surface-3)]
                        px-2
                        py-0.5
                        text-[10px]
                        text-[var(--muted)]
                      "
                    >
                      {item.badge}
                    </span>
                  )}

                </NavLink>
              );
            })}

          </div>

          {/* =================================================
              SETTINGS
          ================================================== */}

          <div className="mt-8">

            <p
              className="
                mb-3
                px-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.15em]
                text-[var(--muted)]
              "
            >
              System
            </p>

            <NavLink
              to="/settings"
              className={({ isActive }) => `
                group
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                font-medium
                transition

                ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : `
                      text-[var(--muted)]
                      hover:bg-[var(--surface-2)]
                      hover:text-[var(--text)]
                    `
                }
              `}
            >

              <Settings
                className="
                  h-[18px]
                  w-[18px]
                  transition-colors
                  group-hover:text-emerald-400
                "
              />

              <span>
                Settings
              </span>

            </NavLink>

          </div>

        </nav>

        {/* =====================================================
            SYSTEM STATUS
        ====================================================== */}

        <div
          className="
            mx-4
            mb-5
            rounded-2xl
            border
            border-[var(--border)]
            bg-[var(--surface-2)]
            p-4
          "
        >

          <div className="flex items-center gap-2">

            <span
              className="
                h-2
                w-2
                animate-pulse
                rounded-full
                bg-emerald-400
              "
            />

            <span
              className="
                text-xs
                font-medium
                text-emerald-400
              "
            >
              All Systems Operational
            </span>

          </div>

          <div className="my-3 h-px bg-[var(--border)]" />

          <p
            className="
              text-[10px]
              uppercase
              tracking-wider
              text-[var(--muted)]
            "
          >
            AI Model
          </p>

          <p
            className="
              mt-1
              text-xs
              font-medium
              text-[var(--text)]
            "
          >
            YOLOv8 RoadGuard
          </p>

          <div className="mt-4 flex items-center justify-between">

            <span className="text-[10px] text-[var(--muted)]">
              Accuracy
            </span>

            <span className="text-xs font-semibold text-emerald-400">
              96.7%
            </span>

          </div>

        </div>

        {/* =====================================================
            USER
        ====================================================== */}

        <div className="border-t border-[var(--border)] p-4">

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-emerald-500/10
                text-sm
                font-semibold
                text-emerald-400
                ring-1
                ring-emerald-400/20
              "
            >
              A
            </div>

            <div className="min-w-0 flex-1">

              <p
                className="
                  truncate
                  text-sm
                  font-medium
                  text-[var(--text)]
                "
              >
                Admin User
              </p>

              <p className="text-[11px] text-[var(--muted)]">
                Administrator
              </p>

            </div>

            <span className="text-[var(--muted)]">
              ›
            </span>

          </div>

        </div>

      </div>
    </aside>
  );
}

export default Sidebar;