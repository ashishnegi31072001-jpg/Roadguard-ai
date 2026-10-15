import {
  Clock,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Detection {
  _id: string;
  damageType: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  imageUrl: string;
  location?: {
    road?: string;
    area?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  status?: string;
  createdAt: string;
}

const API_URL =
  "http://localhost:5000/api/detections";

const severityStyle = {
  High: "bg-red-500/90 text-white",
  Medium: "bg-orange-400/90 text-white",
  Low: "bg-yellow-400/90 text-black",
  Critical: "bg-purple-600/90 text-white",
};

function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const seconds = Math.floor(
    difference / 1000
  );

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  return `${days}d ago`;
}

function getImageUrl(imageUrl: string) {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `http://localhost:5000${imageUrl}`;
}

function RecentInspections() {
  const [detections, setDetections] =
    useState<Detection[]>([]);

  const [loading, setLoading] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | FETCH DETECTIONS
  |--------------------------------------------------------------------------
  */

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
          (data.detections || []).slice(
            0,
            5
          )
        );
      }
    } catch (error) {
      console.error(
        "Recent inspections error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchDetections();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <section
      className="
        rounded-2xl
        border border-[var(--border)]
        bg-[var(--surface)]
        p-5
      "
    >

      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}

      <div
        className="
          mb-5
          flex
          items-center
          justify-between
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
            Recent Inspections
          </h2>

          <p
            className="
              mt-1
              text-[11px]
              text-[var(--muted)]
            "
          >
            Latest AI road inspections
          </p>

        </div>

        <button
          type="button"
          onClick={fetchDetections}
          disabled={loading}
          title="Refresh inspections"
          className="
            rounded-lg
            border
            border-[var(--border)]
            p-2
            text-[var(--muted)]
            transition
            hover:text-emerald-400
            disabled:opacity-50
          "
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />
        </button>

      </div>

      {/* ================================================================ */}
      {/* LOADING */}
      {/* ================================================================ */}

      {loading && (
        <div
          className="
            flex
            items-center
            justify-center
            py-12
            text-xs
            text-[var(--muted)]
          "
        >
          <RefreshCw
            className="
              mr-2
              h-4
              w-4
              animate-spin
            "
          />

          Loading inspections...
        </div>
      )}

      {/* ================================================================ */}
      {/* EMPTY STATE */}
      {/* ================================================================ */}

      {!loading &&
        detections.length === 0 && (
          <div
            className="
              rounded-xl
              border
              border-dashed
              border-[var(--border)]
              py-12
              text-center
            "
          >
            <p
              className="
                text-sm
                font-medium
                text-[var(--text)]
              "
            >
              No inspections yet
            </p>

            <p
              className="
                mt-1
                text-xs
                text-[var(--muted)]
              "
            >
              Analyze a road image to
              create your first inspection.
            </p>
          </div>
        )}

      {/* ================================================================ */}
      {/* CARDS */}
      {/* ================================================================ */}

      {!loading &&
        detections.length > 0 && (
          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-5
            "
          >

            {detections.map(
              (inspection) => {
                const road =
                  inspection.location
                    ?.road ||
                  "Unknown Road";

                const area =
                  inspection.location
                    ?.area ||
                  "Unknown Area";

                const image =
                  getImageUrl(
                    inspection.imageUrl
                  );

                return (
                  <div
                    key={inspection._id}
                    className="
                      group
                      overflow-hidden
                      rounded-xl
                      border
                      border-[var(--border)]
                      bg-[var(--surface-2)]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-emerald-400/40
                      hover:shadow-lg
                      hover:shadow-emerald-500/5
                    "
                  >

                    {/* ================================================== */}
                    {/* IMAGE */}
                    {/* ================================================== */}

                    <div
                      className="
                        relative
                        h-28
                        overflow-hidden
                        bg-slate-800
                      "
                    >

                      {image ? (
                        <img
                          src={image}
                          alt={
                            inspection.damageType
                          }
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-110
                          "
                          onError={(
                            event
                          ) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-full
                            items-center
                            justify-center
                            text-[10px]
                            text-slate-500
                          "
                        >
                          No Image
                        </div>
                      )}

                      {/* DARK OVERLAY */}

                      <div
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-black/70
                          to-transparent
                        "
                      />

                      {/* SEVERITY */}

                      <span
                        className={`
                          absolute
                          left-2
                          top-2
                          rounded-md
                          px-2
                          py-1
                          text-[9px]
                          font-bold
                          uppercase
                          ${
                            severityStyle[
                              inspection
                                .severity
                            ]
                          }
                        `}
                      >
                        {inspection.severity}
                      </span>

                    </div>

                    {/* ================================================== */}
                    {/* CONTENT */}
                    {/* ================================================== */}

                    <div className="p-3">

                      <h3
                        className="
                          truncate
                          text-xs
                          font-semibold
                          text-[var(--text)]
                        "
                        title={road}
                      >
                        {road}
                      </h3>

                      <p
                        className="
                          mt-1
                          truncate
                          text-[10px]
                          text-[var(--muted)]
                        "
                        title={area}
                      >
                        {area}
                      </p>

                      <div
                        className="
                          mt-2
                          flex
                          items-center
                          justify-between
                        "
                      >

                        {/* DAMAGE TYPE */}

                        <div
                          className="
                            flex
                            items-center
                            gap-1
                            text-[10px]
                            text-[var(--muted)]
                          "
                        >
                          <MapPin
                            className="
                              h-3
                              w-3
                            "
                          />

                          <span className="capitalize">
                            {
                              inspection.damageType
                            }
                          </span>
                        </div>

                        {/* TIME */}

                        <div
                          className="
                            flex
                            items-center
                            gap-1
                            text-[10px]
                            text-[var(--muted)]
                          "
                        >
                          <Clock
                            className="
                              h-3
                              w-3
                            "
                          />

                          {getTimeAgo(
                            inspection.createdAt
                          )}
                        </div>

                      </div>

                      {/* CONFIDENCE */}

                      <div
                        className="
                          mt-3
                          flex
                          items-center
                          justify-between
                          border-t
                          border-[var(--border)]
                          pt-2
                        "
                      >

                        <span
                          className="
                            text-[9px]
                            uppercase
                            tracking-wider
                            text-[var(--muted)]
                          "
                        >
                          Confidence
                        </span>

                        <span
                          className="
                            text-[10px]
                            font-semibold
                            text-emerald-400
                          "
                        >
                          {(
                            inspection.confidence *
                            100
                          ).toFixed(1)}
                          %
                        </span>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

    </section>
  );
}

export default RecentInspections;