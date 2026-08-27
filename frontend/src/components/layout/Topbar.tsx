import {
  Bell,
  Command,
  Plus,
  Search,
} from "lucide-react";

import ThemeToggle from "../ThemeToggle";

function Topbar() {
  return (
    <header
      className="
        sticky top-0 z-40
        flex h-[76px] items-center
        justify-between gap-5
        border-b border-[var(--border)]
        bg-[var(--background)]/90
        px-5 backdrop-blur-xl
        lg:px-7
      "
    >
      {/* SEARCH */}
      <div
        className="
          flex h-11 w-full max-w-[470px]
          items-center gap-3
          rounded-xl border
          border-[var(--border)]
          bg-[var(--surface)]
          px-3
          transition
          focus-within:border-emerald-400/40
        "
      >
        <Search className="h-[18px] w-[18px] text-[var(--muted)]" />

        <input
          type="text"
          placeholder="Search roads, locations, inspections..."
          className="
            min-w-0 flex-1
            bg-transparent
            text-sm text-[var(--text)]
            outline-none
            placeholder:text-[var(--muted)]
          "
        />

        <div className="hidden items-center gap-1 rounded-md border border-[var(--border)] px-2 py-1 text-[10px] text-[var(--muted)] sm:flex">
          <Command className="h-3 w-3" />
          K
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* LIVE STATUS */}
        <div
          className="
            hidden items-center gap-2
            rounded-xl border
            border-[var(--border)]
            bg-[var(--surface)]
            px-3 py-2
            sm:flex
          "
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

          <div>
            <p className="text-[11px] font-semibold text-[var(--text)]">
              LIVE
            </p>

            <p className="text-[9px] text-[var(--muted)]">
              System Active
            </p>
          </div>
        </div>

        {/* THEME */}
        <ThemeToggle />

        {/* NOTIFICATIONS */}
        <button
          className="
            relative flex h-10 w-10
            items-center justify-center
            rounded-xl border
            border-[var(--border)]
            bg-[var(--surface)]
            text-[var(--muted)]
            transition
            hover:border-emerald-400/30
            hover:text-[var(--text)]
          "
        >
          <Bell className="h-[18px] w-[18px]" />

          <span
            className="
              absolute right-1 top-1
              flex h-4 w-4
              items-center justify-center
              rounded-full bg-red-500
              text-[8px] font-bold text-white
            "
          >
            8
          </span>
        </button>

        {/* NEW INSPECTION */}
        <button
          className="
            hidden items-center gap-2
            rounded-xl
            bg-emerald-400
            px-4 py-2.5
            text-sm font-semibold
            text-slate-950
            shadow-lg shadow-emerald-500/10
            transition
            hover:bg-emerald-300
            sm:flex
          "
        >
          <Plus className="h-4 w-4" />

          New Inspection
        </button>

      </div>
    </header>
  );
}

export default Topbar;
