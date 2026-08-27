import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  FileImage,
  FileVideo,
  Loader2,
  ScanLine,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";

function AnalyzeRoad() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);

  /* ============================================================
     FILE HANDLING
  ============================================================ */

  const handleFile = (file: File) => {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload JPG, PNG, WEBP, MP4 or WEBM files.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert("File size must be less than 100 MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(url);
    setAnalysisStarted(false);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  /* ============================================================
     DRAG & DROP
  ============================================================ */

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  /* ============================================================
     REMOVE FILE
  ============================================================ */

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisStarted(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ============================================================
     ANALYZE
  ============================================================ */

  const startAnalysis = () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    /*
      Temporary frontend simulation.

      Later this button will send the file to:

      Python FastAPI
            ↓
      YOLOv8
            ↓
      Severity Model
            ↓
      Detection Results
    */

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisStarted(true);
    }, 2500);
  };

  /* ============================================================
     HELPERS
  ============================================================ */

  const isVideo = selectedFile?.type.startsWith("video/");

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

        <div>

          <div className="mb-3 flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-400/20">
              <ScanLine className="h-4 w-4 text-emerald-400" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              AI Inspection Center
            </span>

          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)] lg:text-4xl">
            Analyze Road
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Upload a road image or dashcam video and let RoadGuard AI
            detect potholes, cracks and other road damage.
          </p>

        </div>

        {/* AI STATUS */}

        <div className="flex w-fit items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              AI Engine
            </p>

            <p className="text-xs font-semibold text-[var(--text)]">
              YOLOv8 RoadGuard
            </p>
          </div>

          <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

        </div>

      </div>

      {/* ======================================================
          MAIN GRID
      ======================================================= */}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

        {/* ====================================================
            LEFT - UPLOAD / PREVIEW
        ===================================================== */}

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:p-6">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-sm font-bold text-[var(--text)]">
                Upload Inspection Data
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Supported images and dashcam videos
              </p>
            </div>

            <div className="hidden items-center gap-2 text-[10px] text-[var(--muted)] sm:flex">
              <span className="rounded-md border border-[var(--border)] px-2 py-1">
                JPG
              </span>

              <span className="rounded-md border border-[var(--border)] px-2 py-1">
                PNG
              </span>

              <span className="rounded-md border border-[var(--border)] px-2 py-1">
                MP4
              </span>
            </div>

          </div>

          {/* ==================================================
              EMPTY UPLOAD STATE
          =================================================== */}

          {!selectedFile && (

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                group
                relative
                flex
                min-h-[430px]
                cursor-pointer
                flex-col
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                border
                border-dashed
                p-8
                text-center
                transition-all
                duration-300

                ${
                  isDragging
                    ? `
                      border-emerald-400
                      bg-emerald-400/10
                      shadow-[0_0_50px_rgba(16,185,129,0.08)]
                    `
                    : `
                      border-[var(--border)]
                      bg-[var(--surface-2)]
                      hover:border-emerald-400/40
                      hover:bg-emerald-400/[0.03]
                    `
                }
              `}
            >

              {/* Background glow */}

              <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/5 blur-3xl" />

              {/* Upload Icon */}

              <div
                className="
                  relative
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-2xl
                  bg-emerald-500/10
                  ring-1
                  ring-emerald-400/20
                  transition
                  duration-300
                  group-hover:scale-105
                  group-hover:bg-emerald-500/15
                "
              >
                <CloudUpload className="h-9 w-9 text-emerald-400" />
              </div>

              <h3 className="relative mt-6 text-lg font-semibold text-[var(--text)]">
                Drop your road footage here
              </h3>

              <p className="relative mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                Drag and drop an image or video, or click below
                to browse files from your computer.
              </p>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="
                  relative
                  mt-6
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-emerald-400
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-black
                  shadow-lg
                  shadow-emerald-500/10
                  transition
                  hover:bg-emerald-300
                  hover:shadow-emerald-500/20
                "
              >
                <Upload className="h-4 w-4" />
                Choose File
              </button>

              <p className="relative mt-4 text-[10px] text-[var(--muted)]">
                Maximum file size: 100 MB
              </p>

              {/* Hidden input */}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleInputChange}
                className="hidden"
              />

            </div>

          )}

          {/* ==================================================
              FILE PREVIEW
          =================================================== */}

          {selectedFile && previewUrl && (

            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-black">

              {/* Preview */}

              <div className="relative flex min-h-[430px] items-center justify-center bg-black">

                {isVideo ? (
                  <video
                    src={previewUrl}
                    controls
                    className="max-h-[520px] w-full object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Road inspection preview"
                    className="max-h-[520px] w-full object-contain"
                  />
                )}

                {/* Remove button */}

                <button
                  type="button"
                  onClick={removeFile}
                  className="
                    absolute
                    right-4
                    top-4
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-white/10
                    bg-black/70
                    text-white
                    backdrop-blur
                    transition
                    hover:bg-red-500
                  "
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>

              {/* File details */}

              <div className="flex flex-col gap-4 border-t border-[var(--border)] bg-[var(--surface-2)] p-4 sm:flex-row sm:items-center">

                <div className="flex min-w-0 flex-1 items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">

                    {isVideo ? (
                      <FileVideo className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <FileImage className="h-5 w-5 text-emerald-400" />
                    )}

                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-medium text-[var(--text)]">
                      {selectedFile.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                      {formatFileSize(selectedFile.size)}
                      {" • "}
                      {isVideo ? "Video" : "Image"}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    px-3
                    py-2
                    text-xs
                    text-[var(--muted)]
                    transition
                    hover:bg-red-500/10
                    hover:text-red-400
                  "
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>

              </div>

            </div>

          )}

        </div>

        {/* ====================================================
            RIGHT - ANALYSIS PANEL
        ===================================================== */}

        <div className="space-y-6">

          {/* Detection Engine */}

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <ScanLine className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[var(--text)]">
                  Detection Engine
                </h3>

                <p className="text-[10px] text-[var(--muted)]">
                  Computer vision pipeline
                </p>
              </div>

            </div>

            <div className="mt-5 space-y-3">

              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] p-3">
                <span className="text-xs text-[var(--muted)]">
                  Object Detection
                </span>

                <span className="text-xs font-medium text-emerald-400">
                  YOLOv8
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] p-3">
                <span className="text-xs text-[var(--muted)]">
                  Severity
                </span>

                <span className="text-xs font-medium text-emerald-400">
                  AI Classification
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-[var(--surface-2)] p-3">
                <span className="text-xs text-[var(--muted)]">
                  Processing
                </span>

                <span className="text-xs font-medium text-emerald-400">
                  GPU Ready
                </span>
              </div>

            </div>

          </div>

          {/* Analyze button */}

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.03] p-5">

            <div className="flex items-start gap-3">

              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />

              <div>

                <h3 className="text-sm font-semibold text-[var(--text)]">
                  Ready for inspection
                </h3>

                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  Upload road footage first. The AI pipeline
                  will detect and classify road damage.
                </p>

              </div>

            </div>

            <button
              type="button"
              disabled={!selectedFile || isAnalyzing}
              onClick={startAnalysis}
              className="
                mt-5
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-400
                px-4
                py-3.5
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-emerald-300
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >

              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Road...
                </>
              ) : (
                <>
                  <ScanLine className="h-4 w-4" />
                  Analyze Road
                </>
              )}

            </button>

            {analysisStarted && (

              <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-400/10 p-3 text-xs text-emerald-400">

                <CheckCircle2 className="h-4 w-4" />

                Analysis completed successfully.

              </div>

            )}

          </div>

          {/* What AI detects */}

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">

            <h3 className="text-sm font-semibold text-[var(--text)]">
              AI will detect
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-2">

              {[
                "Potholes",
                "Cracks",
                "Surface Damage",
                "Road Wear",
              ].map((item) => (

                <div
                  key={item}
                  className="
                    rounded-lg
                    border
                    border-[var(--border)]
                    bg-[var(--surface-2)]
                    px-3
                    py-2.5
                    text-xs
                    text-[var(--muted)]
                  "
                >
                  {item}
                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AnalyzeRoad;