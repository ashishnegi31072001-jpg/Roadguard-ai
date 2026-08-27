import { motion } from "framer-motion";
import {
  ArrowRight,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { roadData } from "../data/roadData";

function RoadHero() {
  return (
    <section className="relative min-h-[520px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">

      {/* Background image */}
      <img
        src={roadData.heroImage}
        alt="Road inspection"
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />

      {/* Dark cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/30" />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* AI scanning line */}
      <motion.div
        animate={{
          y: ["0%", "100%", "0%"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-0 right-0 top-0 h-px bg-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.9)]"
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[520px] flex-col justify-between p-8 md:p-12">

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium text-emerald-300 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            SYSTEM ONLINE
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-slate-300 backdrop-blur-md md:flex">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            AI ROAD INTELLIGENCE
          </div>
        </div>

        <div className="max-w-3xl">

          <div className="mb-5 flex items-center gap-2 text-sm text-emerald-300">
            <ScanLine className="h-4 w-4" />
            COMPUTER VISION INFRASTRUCTURE
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl lg:text-7xl">
            See the road.
            <br />

            <span className="bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent">
              Understand the damage.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            RoadGuard transforms road imagery into actionable
            infrastructure intelligence — detecting damage, estimating
            severity and helping teams prioritize maintenance.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button className="group inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-400 px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-300">
              Start Road Scan

              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white backdrop-blur-md transition hover:bg-white/10">
              Explore Intelligence Map
            </button>

          </div>
        </div>

        {/* Bottom indicators */}
        <div className="grid max-w-2xl gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              ROAD HEALTH
            </div>

            <div className="mt-2 text-2xl font-bold text-white">
              {roadData.healthScore}
              <span className="text-sm text-slate-500"> / 100</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
            <div className="text-xs text-slate-400">
              ACTIVE ISSUES
            </div>

            <div className="mt-2 text-2xl font-bold text-white">
              {roadData.activeIssues}
            </div>
          </div>

          <div className="rounded-2xl border border-red-400/10 bg-red-500/5 p-4 backdrop-blur-md">
            <div className="text-xs text-slate-400">
              CRITICAL
            </div>

            <div className="mt-2 text-2xl font-bold text-red-400">
              {roadData.criticalIssues}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default RoadHero;