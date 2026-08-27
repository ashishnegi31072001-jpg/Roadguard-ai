function Dashboard() {
  return (
    <div className="space-y-6">

      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">
          AI Powered Road Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-bold text-[var(--text)]">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Monitor road conditions and infrastructure health.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10">
        <p className="text-center text-[var(--muted)]">
          Dashboard modules coming next...
        </p>
      </div>

    </div>
  );
}

export default Dashboard;