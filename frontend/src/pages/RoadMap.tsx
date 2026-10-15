
import { useCallback, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  AlertTriangle,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";

interface Detection {
  _id: string;
  damageType: string;
  severity: string;
  confidence: number;
  imageUrl: string;
  status: string;
  createdAt: string;
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
}

const API_URL = "http://localhost:5000/api/detections";

// Dehradun is used only as the initial map center.
const DEFAULT_CENTER: [number, number] = [30.3165, 78.0322];

function severityColor(severity: string) {
  switch (severity) {
    case "Critical":
      return "#a855f7";
    case "High":
      return "#ef4444";
    case "Medium":
      return "#f59e0b";
    default:
      return "#10b981";
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown date"
    : date.toLocaleString();
}

function FitMarkers({ detections }: { detections: Detection[] }) {
  const map = useMap();

  useEffect(() => {
    const points = detections
      .filter(
        (item) =>
          typeof item.location?.latitude === "number" &&
          typeof item.location?.longitude === "number" &&
          Number.isFinite(item.location.latitude) &&
          Number.isFinite(item.location.longitude) &&
          item.location.latitude >= -90 &&
          item.location.latitude <= 90 &&
          item.location.longitude >= -180 &&
          item.location.longitude <= 180
      )
      .map(
        (item) =>
          [
            item.location!.latitude!,
            item.location!.longitude!,
          ] as [number, number]
      );

    if (points.length === 1) {
      map.setView(points[0], 15);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [35, 35] });
    }
  }, [detections, map]);

  return null;
}

export default function RoadMap() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  const loadDetections = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.success !== true || !Array.isArray(data.detections)) {
        throw new Error("Invalid detection response from server.");
      }

      setDetections(data.detections);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load map detections."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDetections();
  }, [loadDetections]);

  const mappedDetections = detections.filter((item) => {
    const lat = item.location?.latitude;
    const lng = item.location?.longitude;

    return (
      typeof lat === "number" &&
      Number.isFinite(lat) &&
      lat >= -90 &&
      lat <= 90 &&
      typeof lng === "number" &&
      Number.isFinite(lng) &&
      lng >= -180 &&
      lng <= 180
    );
  });

  const filteredDetections = mappedDetections.filter((item) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        item.damageType,
        item.location?.road,
        item.location?.area,
        item.severity,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesSeverity =
      severityFilter === "All" ||
      item.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const withoutGps = detections.length - mappedDetections.length;

  return (
    <main className="space-y-6 text-slate-100">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            RoadGuard AI / Mapping
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Road Damage Map
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            View saved road damage detections with valid GPS coordinates.
          </p>
        </div>

        <button
          onClick={() => void loadDetections()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh map data
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Saved detections</p>
          <p className="mt-2 text-3xl font-bold">
            {loading || error ? "—" : detections.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Mapped records</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {loading || error ? "—" : mappedDetections.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm text-slate-400">Missing GPS</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">
            {loading || error ? "—" : withoutGps}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1fr_220px]">
        <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4">
          <Search size={18} className="text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search damage type, road, or area..."
            className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-500"
          />
        </label>

        <select
          value={severityFilter}
          onChange={(event) => setSeverityFilter(event.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none"
          aria-label="Filter by severity"
        >
          <option value="All">All severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-4">
          <div>
            <h2 className="font-semibold">Interactive map</h2>
            <p className="mt-1 text-xs text-slate-400">
              {loading
                ? "Loading map data..."
                : `${filteredDetections.length} matching mapped records`}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            {["Critical", "High", "Medium", "Low"].map((level) => (
              <span key={level} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: severityColor(level) }}
                />
                {level}
              </span>
            ))}
          </div>
        </div>

        <div className="relative h-[480px] w-full bg-slate-950">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={11}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitMarkers detections={filteredDetections} />

            {filteredDetections.map((item) => (
              <CircleMarker
                key={item._id}
                center={[
                  item.location!.latitude!,
                  item.location!.longitude!,
                ]}
                radius={8}
                pathOptions={{
                  color: severityColor(item.severity),
                  fillColor: severityColor(item.severity),
                  fillOpacity: 0.8,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="min-w-[180px] space-y-1 text-slate-900">
                    <strong>{item.damageType}</strong>
                    <p>Severity: {item.severity}</p>
                    <p>
                      Confidence:{" "}
                      {Number.isFinite(item.confidence)
                        ? `${(item.confidence * 100).toFixed(1)}%`
                        : "N/A"}
                    </p>
                    <p>Road: {item.location?.road || "Unknown"}</p>
                    <p>Area: {item.location?.area || "Unknown"}</p>
                    <p>{formatDate(item.createdAt)}</p>
                    <a
                      href={`https://www.google.com/maps?q=${item.location!.latitude},${item.location!.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-700 underline"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {!loading && !error && filteredDetections.length === 0 && (
            <div className="absolute inset-x-4 top-4 z-[1000] flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-sm text-slate-300">
              <MapPin size={18} className="text-amber-400" />
              No mapped records match these filters. Check GPS data or clear
              your filters.
            </div>
          )}
        </div>
      </section>

      {!loading && !error && withoutGps > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
          <AlertTriangle size={19} className="mt-0.5 shrink-0" />
          <p>
            {withoutGps} record(s) have no valid GPS coordinates and cannot
            appear on the map. Add or capture coordinates when submitting an
            inspection to map these detections.
          </p>
        </div>
      )}
    </main>
  );
}
