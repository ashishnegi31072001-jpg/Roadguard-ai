
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";

interface Detection {
  _id: string;
  damageType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  imageUrl: string;
  status: string;
  createdAt: string;
  aiModel?: string;
  modelVersion?: string;
  description?: string;
  location?: {
    road?: string;
    area?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
}

interface ApiResponse {
  success: boolean;
  detections: Detection[];
  message?: string;
}

const API_URL = "http://localhost:5000/api/detections";

const severityStyles: Record<string, string> = {
  Critical: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  High: "bg-red-500/15 text-red-300 border-red-500/30",
  Medium: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  Low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString();
}

function escapeCsv(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function Reports() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success !== true || !Array.isArray(data.detections)) {
        throw new Error("Invalid response received from the server.");
      }

      setDetections(data.detections);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return detections.filter((item) => {
      const searchableText = [
        item.damageType,
        item.severity,
        item.status,
        item.location?.road,
        item.location?.area,
        item._id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (query && !searchableText.includes(query)) {
        return false;
      }

      if (severity !== "All" && item.severity !== severity) {
        return false;
      }

      const timestamp = new Date(item.createdAt).getTime();

      if (!Number.isFinite(timestamp)) {
        if (startDate || endDate) return false;
      } else {
        if (startDate) {
          const start = new Date(`${startDate}T00:00:00`).getTime();
          if (timestamp < start) return false;
        }

        if (endDate) {
          const end = new Date(`${endDate}T23:59:59.999`).getTime();
          if (timestamp > end) return false;
        }
      }

      return true;
    });
  }, [detections, search, severity, startDate, endDate]);

  const stats = useMemo(() => {
    const total = filteredReports.length;
    const critical = filteredReports.filter(
      (item) => item.severity === "Critical"
    ).length;
    const high = filteredReports.filter(
      (item) => item.severity === "High"
    ).length;
    const medium = filteredReports.filter(
      (item) => item.severity === "Medium"
    ).length;
    const low = filteredReports.filter(
      (item) => item.severity === "Low"
    ).length;

    return { total, critical, high, medium, low };
  }, [filteredReports]);

  const exportCsv = () => {
    const headers = [
      "Detection ID",
      "Damage Type",
      "Severity",
      "Confidence (%)",
      "Status",
      "Road",
      "Area",
      "Latitude",
      "Longitude",
      "AI Model",
      "Model Version",
      "Created At",
    ];

    const rows = filteredReports.map((item) => [
      item._id,
      item.damageType,
      item.severity,
      Number.isFinite(item.confidence)
        ? (item.confidence * 100).toFixed(2)
        : "",
      item.status,
      item.location?.road ?? "",
      item.location?.area ?? "",
      item.location?.latitude ?? "",
      item.location?.longitude ?? "",
      item.aiModel ?? "",
      item.modelVersion ?? "",
      item.createdAt,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `roadguard-reports-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setSeverity("All");
    setStartDate("");
    setEndDate("");
  };

  return (
    <main className="space-y-6 text-slate-100">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            RoadGuard AI / Reporting
          </p>
          <h1 className="mt-2 text-3xl font-bold">Detection Reports</h1>
          <p className="mt-2 text-sm text-slate-400">
            Search, filter, review and export road damage records.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => void fetchReports()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={exportCsv}
            disabled={filteredReports.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          <p className="font-semibold">Could not load reports</p>
          <p className="mt-1">{error}</p>
          <p className="mt-1 text-red-200/70">
            Check MongoDB and the backend server.
          </p>
        </div>
      )}

      {/* Statistics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          {
            label: "Filtered Records",
            value: stats.total,
            icon: FileText,
            color: "text-emerald-400",
          },
          {
            label: "Critical",
            value: stats.critical,
            icon: ShieldAlert,
            color: "text-purple-400",
          },
          {
            label: "High",
            value: stats.high,
            icon: AlertTriangle,
            color: "text-red-400",
          },
          {
            label: "Medium",
            value: stats.medium,
            icon: CalendarDays,
            color: "text-yellow-400",
          },
          {
            label: "Low",
            value: stats.low,
            icon: CheckCircle2,
            color: "text-emerald-400",
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{card.label}</p>
                <Icon size={19} className={card.color} />
              </div>
              <p className="mt-3 text-3xl font-bold">
                {loading || error ? "—" : card.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="mb-4 text-lg font-semibold">Filter Reports</h2>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-400">
              Search
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3">
              <Search size={17} className="text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Damage, road, area, ID..."
                className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-600"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-400">
              Severity
            </span>
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none"
            >
              <option value="All">All severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-400">
              From date
            </span>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-400">
              To date
            </span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm outline-none"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            Showing{" "}
            <span className="font-semibold text-white">
              {loading ? "..." : filteredReports.length}
            </span>{" "}
            of {loading ? "..." : detections.length} records
          </p>

          <button
            onClick={clearFilters}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Clear filters
          </button>
        </div>
      </section>

      {/* Reports table */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-lg font-semibold">Report Records</h2>
          <p className="mt-1 text-sm text-slate-400">
            Data retrieved from your RoadGuard AI backend.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400">
            <RefreshCw size={24} className="mx-auto mb-3 animate-spin" />
            Loading reports...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-slate-400">
            Reports are unavailable until the server connection is restored.
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-10 text-center">
            <FileText size={30} className="mx-auto mb-3 text-slate-600" />
            <p className="font-medium">No reports found</p>
            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Damage</th>
                  <th className="px-5 py-4">Severity</th>
                  <th className="px-5 py-4">Confidence</th>
                  <th className="px-5 py-4">Road / Area</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Location</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {filteredReports.map((item) => {
                  const latitude = item.location?.latitude;
                  const longitude = item.location?.longitude;

                  const hasCoordinates =
                    typeof latitude === "number" &&
                    Number.isFinite(latitude) &&
                    latitude >= -90 &&
                    latitude <= 90 &&
                    typeof longitude === "number" &&
                    Number.isFinite(longitude) &&
                    longitude >= -180 &&
                    longitude <= 180;

                  return (
                    <tr key={item._id} className="hover:bg-slate-800/40">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">
                          {item.damageType || "Unknown"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          ID: {item._id.slice(-8)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                            severityStyles[item.severity] ??
                            "border-slate-700 bg-slate-800 text-slate-300"
                          }`}
                        >
                          {item.severity || "Unknown"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {typeof item.confidence === "number" &&
                        Number.isFinite(item.confidence)
                          ? `${(item.confidence * 100).toFixed(1)}%`
                          : "N/A"}
                      </td>

                      <td className="px-5 py-4">
                        <p>{item.location?.road || "Unknown road"}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.location?.area || "Unknown area"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        {item.status || "Unknown"}
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        {hasCoordinates ? (
                          <a
                            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-emerald-400 hover:text-emerald-300"
                          >
                            View map
                          </a>
                        ) : (
                          <span className="text-slate-500">
                            No GPS data
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-slate-500">
        Report counts represent saved detection records. One uploaded image
        may produce multiple records. CSV export includes the currently
        filtered records.
      </p>
    </main>
  );
}

export default Reports;
