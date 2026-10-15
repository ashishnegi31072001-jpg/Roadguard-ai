import {
  Crosshair,
  Layers,
  Plus,
  Minus,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useEffect, useState } from "react";

/* ==========================================================================
   TYPES
   ========================================================================== */

interface Detection {
  _id: string;
  damageType: string;
  severity:
    | "Low"
    | "Medium"
    | "High"
    | "Critical";
  confidence: number;

  location?: {
    road?: string;
    area?: string;
    latitude?: number | null;
    longitude?: number | null;
  };

  imageUrl?: string;
  createdAt?: string;
}

/* ==========================================================================
   API
   ========================================================================== */

const API_URL =
  "http://localhost:5000/api/detections";

/* ==========================================================================
   MARKER ICON
   ========================================================================== */

const createMarkerIcon = (
  severity: Detection["severity"]
) => {
  const colors = {
    Critical: "#ef4444",
    High: "#fb923c",
    Medium: "#facc15",
    Low: "#34d399",
  };

  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width: 18px;
          height: 18px;
          background: ${colors[severity]};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 12px ${colors[severity]};
        "
      ></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

/* ==========================================================================
   MAP CONTROLS
   ========================================================================== */

function MapControls({
  onLocate,
}: {
  onLocate: () => void;
}) {
  const map = useMap();

  return (
    <>
      {/* ZOOM CONTROLS */}

      <div
        className="
          absolute
          right-4
          top-4
          z-[1000]
          flex
          flex-col
          overflow-hidden
          rounded-lg
          border
          border-white/10
          bg-black/60
          backdrop-blur-md
        "
      >
        <button
          type="button"
          onClick={() => map.zoomIn()}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            text-white
            transition
            hover:bg-white/10
          "
        >
          <Plus className="h-4 w-4" />
        </button>

        <div className="h-px bg-white/10" />

        <button
          type="button"
          onClick={() => map.zoomOut()}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            text-white
            transition
            hover:bg-white/10
          "
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* CURRENT LOCATION */}

      <button
        type="button"
        onClick={onLocate}
        className="
          absolute
          bottom-4
          right-4
          z-[1000]
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          border
          border-white/10
          bg-black/60
          text-white
          backdrop-blur-md
          transition
          hover:bg-white/10
        "
        title="Center map"
      >
        <Crosshair className="h-4 w-4" />
      </button>

      {/* MAP TYPE */}

      <div
        className="
          absolute
          left-4
          top-4
          z-[1000]
          flex
          items-center
          gap-2
          rounded-lg
          border
          border-white/10
          bg-black/60
          px-3
          py-2
          text-[10px]
          text-white
          backdrop-blur-md
        "
      >
        <Layers className="h-3.5 w-3.5" />

        Road Health
      </div>
    </>
  );
}

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

function RoadHealthMap() {
  const [detections, setDetections] =
    useState<Detection[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* ------------------------------------------------------------------------
     DEFAULT MAP LOCATION
     ------------------------------------------------------------------------ */

  const defaultPosition: [
    number,
    number
  ] = [30.306697, 77.949907];

  /* ------------------------------------------------------------------------
     FETCH DETECTIONS
     ------------------------------------------------------------------------ */

  const fetchDetections = async () => {
    try {
      setLoading(true);

      const response =
        await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          "Failed to fetch detections"
        );
      }

      const data =
        await response.json();

      if (data.success) {
        setDetections(
          data.detections || []
        );
      }
    } catch (error) {
      console.error(
        "Road health map error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------------
     LOAD DATA
     ------------------------------------------------------------------------ */

  useEffect(() => {
    fetchDetections();
  }, []);

  /* ------------------------------------------------------------------------
     DETECTIONS WITH VALID GPS
     ------------------------------------------------------------------------ */

  const mappedDetections =
    detections.filter(
      (detection) =>
        typeof detection.location
          ?.latitude === "number" &&
        typeof detection.location
          ?.longitude === "number"
    );

  /* ------------------------------------------------------------------------
     MAP CENTER
     ------------------------------------------------------------------------ */

  const mapCenter: [
    number,
    number
  ] =
    mappedDetections.length > 0
      ? [
          mappedDetections[0].location!
            .latitude as number,
          mappedDetections[0].location!
            .longitude as number,
        ]
      : defaultPosition;

  /* ------------------------------------------------------------------------
     CENTER MAP
     ------------------------------------------------------------------------ */

  const centerMap = () => {
    window.dispatchEvent(
      new CustomEvent(
        "roadguard-center-map"
      )
    );
  };

  /* ==========================================================================
     UI
     ========================================================================== */

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-[var(--border)]
        bg-[var(--surface)]
      "
    >
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          p-5
        "
      >
        <div>
          <h2
            className="
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-[var(--text)]
            "
          >
            Road Health Map
          </h2>

          <p
            className="
              mt-1
              text-[11px]
              text-[var(--muted)]
            "
          >
            Real-time AI detection locations
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            text-[10px]
            text-[var(--muted)]
          "
        >
          <span
            className="
              h-2
              w-2
              animate-pulse
              rounded-full
              bg-emerald-400
            "
          />

          {mappedDetections.length}{" "}
          locations
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAP */}
      {/* ================================================================== */}

      <div
        className="
          relative
          h-[320px]
          overflow-hidden
          border-y
          border-[var(--border)]
        "
      >
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          {/* OPEN STREET MAP */}

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ============================================================ */}
          {/* DETECTION MARKERS */}
          {/* ============================================================ */}

          {mappedDetections.map(
            (detection) => {
              const latitude =
                detection.location!
                  .latitude as number;

              const longitude =
                detection.location!
                  .longitude as number;

              return (
                <Marker
                  key={detection._id}
                  position={[
                    latitude,
                    longitude,
                  ]}
                  icon={createMarkerIcon(
                    detection.severity
                  )}
                >
                  <Popup>
                    <div
                      className="
                        min-w-[180px]
                        text-sm
                      "
                    >
                      <p
                        className="
                          font-bold
                          capitalize
                        "
                      >
                        {detection.damageType}
                      </p>

                      <div className="mt-2 space-y-1">
                        <p>
                          <strong>
                            Severity:
                          </strong>{" "}
                          {detection.severity}
                        </p>

                        <p>
                          <strong>
                            Confidence:
                          </strong>{" "}
                          {(
                            detection.confidence *
                            100
                          ).toFixed(1)}
                          %
                        </p>

                        <p>
                          <strong>
                            Road:
                          </strong>{" "}
                          {detection.location
                            ?.road ||
                            "Unknown Road"}
                        </p>

                        <p>
                          <strong>
                            Area:
                          </strong>{" "}
                          {detection.location
                            ?.area ||
                            "Unknown Area"}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
          )}

          <MapControls
            onLocate={centerMap}
          />
        </MapContainer>

        {/* ================================================================ */}
        {/* NO GPS DATA */}
        {/* ================================================================ */}

        {!loading &&
          mappedDetections.length ===
            0 && (
            <div
              className="
                absolute
                bottom-4
                left-1/2
                z-[1000]
                -translate-x-1/2
                rounded-lg
                border
                border-white/10
                bg-black/70
                px-4
                py-2
                text-[10px]
                text-white
                backdrop-blur-md
              "
            >
              No detection locations
              available
            </div>
          )}

        {/* ================================================================ */}
        {/* LOADING */}
        {/* ================================================================ */}

        {loading && (
          <div
            className="
              absolute
              inset-0
              z-[1100]
              flex
              items-center
              justify-center
              bg-black/40
              backdrop-blur-sm
            "
          >
            <div
              className="
                rounded-lg
                bg-black/70
                px-4
                py-2
                text-xs
                text-white
              "
            >
              Loading road data...
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* LEGEND */}
      {/* ================================================================== */}

      <div
        className="
          flex
          flex-wrap
          gap-5
          p-4
        "
      >
        <Legend
          color="bg-red-500"
          label="Critical"
        />

        <Legend
          color="bg-orange-400"
          label="High"
        />

        <Legend
          color="bg-yellow-400"
          label="Medium"
        />

        <Legend
          color="bg-emerald-400"
          label="Low"
        />
      </div>
    </section>
  );
}

/* ==========================================================================
   LEGEND
   ========================================================================== */

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <span
        className={`
          h-2
          w-2
          rounded-full
          ${color}
        `}
      />

      <span
        className="
          text-[10px]
          text-[var(--muted)]
        "
      >
        {label}
      </span>
    </div>
  );
}

export default RoadHealthMap;