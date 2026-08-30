import { Bell, Search } from "lucide-react";
import ThemeToggle from "../ThemeToggle";

function Topbar() {
  return (
    <header
      className="
        sticky top-0 z-30
        flex h-[88px] items-center justify-between
        border-b border-[var(--border)]
        bg-[var(--background)]/90
        px-5 backdrop-blur-xl
        lg:px-7
      "
    >
      <div
        className="
          flex h-12 w-full max-w-[470px]
          items-center gap-3
          rounded-xl
          border border-[var(--border)]
          bg-[var(--surface)]
          px-4
        "
      >
        <Search className="h-5 w-5 text-[var(--muted)]" />

        <input
          type="text"
          placeholder="Search roads, locations, inspections..."
          className="
            w-full bg-transparent
            text-sm text-[var(--text)]
            outline-none
            placeholder:text-[var(--muted)]
          "
        />
      </div>

      <div className="ml-4 flex items-center gap-3">
        <div
          className="
            hidden items-center gap-2
            rounded-xl border border-[var(--border)]
            bg-[var(--surface)]
            px-4 py-2.5
            lg:flex
          "
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

          <div>
            <p className="text-xs font-semibold text-[var(--text)]">
              LIVE
            </p>

            <p className="text-[9px] text-[var(--muted)]">
              System Active
            </p>
          </div>
        </div>

        <ThemeToggle />

        <button
          className="
            relative flex h-11 w-11
            items-center justify-center
            rounded-xl border border-[var(--border)]
            bg-[var(--surface)]
            text-[var(--muted)]
            transition
            hover:text-[var(--text)]
          "
        >
          <Bell className="h-5 w-5" />

          <span
            className="
              absolute right-1 top-1
              flex h-4 w-4 items-center justify-center
              rounded-full bg-red-500
              text-[9px] font-bold text-white
            "
          >
            8
          </span>
        </button>

        <button
          className="
            hidden h-11 items-center gap-2
            rounded-xl bg-emerald-400
            px-5 text-sm font-semibold
            text-slate-950
            transition hover:bg-emerald-300
            sm:flex
          "
        >
          <span className="text-lg">+</span>
          New Inspection
        </button>
      </div>
    </header>
  );
}

export default Topbar;