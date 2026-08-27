import { Bell, Search } from "lucide-react";

function Navbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950 px-8 text-white">

      {/* Search */}
      <div className="flex w-96 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5">
        <Search className="h-5 w-5 text-slate-500" />

        <input
          type="text"
          placeholder="Search roads, reports..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">

        <button className="relative text-slate-400 transition hover:text-white">
          <Bell className="h-5 w-5" />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-semibold text-slate-950">
            A
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium">
              Admin
            </p>

            <p className="text-xs text-slate-500">
              Road Analyst
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Navbar;