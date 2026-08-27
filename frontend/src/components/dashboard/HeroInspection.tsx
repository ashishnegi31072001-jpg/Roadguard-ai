import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Map,
  ScanLine,
  ShieldCheck,
} from "lucide-react";

function HeroInspection() {
  return (
    <section
      className="
        relative min-h-[470px]
        overflow-hidden rounded-3xl
        border border-[var(--border)]
        bg-[var(--surface)]
      "
    >
      {/* ROAD IMAGE */}

      <img
        src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2200&q=90"
        alt="Road infrastructure"
        className="
          absolute inset-0
          h-full w-full
          object-cover
          object-center
        "
      />

      {/* Dark overlay */}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      {/* Grid */}

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "45px 45px",
        }}
      />

      {/* SCANNING LINE */}

      <motion.div
        animate={{
          top: ["15%", "85%", "15%"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute left-0 right-0 z-10
          h-px
          bg-emerald-400
          shadow-[0_0_30px_4px_rgba(16,185,129,.7)]
        "
      />

      {/* CONTENT */}

      <div className="relative z-20 flex min-h-[470px] flex-col justify-between p-7 md:p-10">

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
            <ScanLine className="h-3.5 w-3.5" />

            AI Powered Road Intelligence
          </div>

          <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
            Smarter Roads,
            <br />

            <span className="text-emerald-400">
              Safer Tomorrow.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
            RoadGuard AI uses computer vision to detect road
            damage, assess severity and help infrastructure teams
            prioritize maintenance.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">

            <button
              className="
                group flex items-center gap-2
                rounded-xl bg-emerald-400
                px-5 py-3
                text-sm font-semibold
                text-slate-950
                transition
                hover:bg-emerald-300
              "
            >
              <ScanLine className="h-4 w-4" />

              Analyze Road Now

              <ArrowUpRight
                className="
                  h-4 w-4
                  transition-transform
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </button>

            <button
              className="
                flex items-center gap-2
                rounded-xl
                border border-white/20
                bg-black/20
                px-5 py-3
                text-sm font-semibold
                text-white
                backdrop-blur-md
                transition
                hover:bg-white/10
              "
            >
              <Map className="h-4 w-4" />

              Explore Live Map
            </button>

          </div>
        </div>

        {/* DETECTION BOX */}

        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            right-[10%]
            top-[48%]
            hidden
            w-48
            rounded-xl
            border border-red-400/50
            bg-black/60
            p-4
            backdrop-blur-md
            md:block
          "
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              POTHOLE
            </span>

            <span className="rounded-md bg-red-500/20 px-2 py-1 text-[9px] font-bold text-red-400">
              HIGH
            </span>
          </div>

          <div className="mt-3 text-2xl font-bold text-white">
            94.7%
          </div>

          <div className="mt-1 text-[10px] text-slate-400">
            Detection confidence
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full w-[95%] rounded-full bg-red-400" />
          </div>
        </motion.div>

        {/* BOTTOM INFO */}

        <div className="flex flex-wrap items-end justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Current Road Health
              </p>

              <p className="mt-1 text-lg font-bold text-white">
                82
                <span className="text-xs font-normal text-slate-400">
                  {" "}
                  / 100
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

              <span className="text-xs font-medium text-white">
                Live AI Monitoring
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroInspection;