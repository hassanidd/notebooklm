import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { DATASETS } from "@/data/mock";
import { Switch } from "@/components/ui/switch";
import {
  Upload, Zap, ClipboardList, FileText, X,
  CheckCircle2, ArrowRight, Sparkles, Scan, Table2,
  ChevronDown, ChevronUp, Database, FolderOpen, Cpu,
  FileImage, FileSpreadsheet, FileCode, Music, Video, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── File-type icon helpers ────────────────────────────────────────────────────
const EXT_ICON: Record<string, { icon: typeof FileText; color: string }> = {
  pdf:  { icon: FileText,        color: "text-red-500 bg-red-50" },
  docx: { icon: FileText,        color: "text-blue-500 bg-blue-50" },
  doc:  { icon: FileText,        color: "text-blue-500 bg-blue-50" },
  xlsx: { icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50" },
  csv:  { icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50" },
  pptx: { icon: FileImage,       color: "text-orange-500 bg-orange-50" },
  json: { icon: FileCode,        color: "text-purple-500 bg-purple-50" },
  jsonl:{ icon: FileCode,        color: "text-purple-500 bg-purple-50" },
  md:   { icon: FileCode,        color: "text-gray-600 bg-gray-100" },
  txt:  { icon: FileText,        color: "text-gray-600 bg-gray-100" },
  html: { icon: FileCode,        color: "text-orange-600 bg-orange-50" },
  mp4:  { icon: Video,           color: "text-pink-600 bg-pink-50" },
  mp3:  { icon: Music,           color: "text-violet-600 bg-violet-50" },
};

function getFileExt(name: string) { return name.split(".").pop()?.toLowerCase() ?? ""; }
function getFileInfo(file: File) {
  const ext = getFileExt(file.name);
  return EXT_ICON[ext] ?? { icon: FileText, color: "text-gray-500 bg-gray-100" };
}
function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const SUPPORTED_EXTS = ["PDF","DOCX","XLSX","CSV","TXT","MD","HTML","PPTX","JSON","JSONL","MP4","MP3"];

export default function NewIngestionPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedDataset, setSelectedDataset] = useState(DATASETS[0].id);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"auto" | "guided" | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced opts
  const [chunkSize, setChunkSize] = useState("512");
  const [overlap, setOverlap] = useState("64");
  const [ocr, setOcr] = useState(true);
  const [tables, setTables] = useState(true);
  const [captions, setCaptions] = useState(false);

  const ds = DATASETS.find((d) => d.id === selectedDataset);
  const allReady = !!selectedDataset && !!file && !!mode;

  const handleDrop = (e: DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleStart = () => {
    if (!mode) return;
    navigate(mode === "auto" ? "/ingestions/auto" : "/ingestions/guided");
  };

  const completedSteps = [!!selectedDataset, !!file, !!mode].filter(Boolean).length;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-gray-50/50">
      <Topbar title="New Ingestion" breadcrumbs={[{ label: "Ingestions" }]} />

      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">

          {/* ── Page header ──────────────────────────────────────────── */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">New Ingestion</h1>
            <p className="text-sm text-gray-500 mt-1">Upload a file and let VectorFlow handle the rest — chunking, embedding, and indexing.</p>

            {/* Progress bar */}
            <div className="mt-5 flex items-center gap-3">
              {["Choose dataset", "Upload file", "Pick mode"].map((label, i) => {
                const done = i < completedSteps;
                const active = i === completedSteps;
                return (
                  <div key={label} className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap",
                      done ? "bg-emerald-100 text-emerald-700" : active ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      {done
                        ? <CheckCircle2 className="size-3.5" />
                        : <span className="w-4 h-4 rounded-full border-[1.5px] border-current flex items-center justify-center text-[10px]">{i + 1}</span>
                      }
                      {label}
                    </div>
                    {i < 2 && <div className={cn("flex-1 h-px", done ? "bg-emerald-200" : "bg-gray-200")} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Steps ───────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Step 1: Dataset */}
            <Section
              step={1}
              icon={<Database className="size-4" />}
              title="Choose a dataset"
              subtitle="Your file will be stored and indexed inside this dataset."
              done={!!selectedDataset}
            >
              <DatasetPicker
                value={selectedDataset}
                onChange={setSelectedDataset}
              />
            </Section>

            {/* Step 2: Upload */}
            <Section
              step={2}
              icon={<Upload className="size-4" />}
              title="Upload your file"
              subtitle="Drag & drop it anywhere in the box, or click to browse."
              done={!!file}
            >
              {!file ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative border-2 border-dashed rounded-2xl cursor-pointer transition-all select-none",
                    dragOver
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
                  )}
                >
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleSelect} />
                  <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all",
                      dragOver ? "bg-indigo-100 scale-110" : "bg-gray-100"
                    )}>
                      <Upload className={cn("size-7 transition-colors", dragOver ? "text-indigo-500" : "text-gray-400")} />
                    </div>
                    <p className={cn("text-base font-semibold mb-1 transition-colors", dragOver ? "text-indigo-700" : "text-gray-700")}>
                      {dragOver ? "Release to upload" : "Drop your file here"}
                    </p>
                    <p className="text-sm text-gray-400 mb-5">
                      or{" "}
                      <span className="text-indigo-600 font-semibold underline underline-offset-2">click to browse</span>
                      {" "}— up to 500 MB
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {SUPPORTED_EXTS.map((ext) => (
                        <span key={ext} className="text-[10px] font-mono font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {ext}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
                  {(() => {
                    const { icon: Icon, color } = getFileInfo(file);
                    return (
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", color.split(" ")[1])}>
                        <Icon className={cn("size-6", color.split(" ")[0])} />
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatSize(file.size)} · Ready to ingest</p>
                  </div>
                  <CheckCircle2 className="size-5 text-emerald-600 flex-shrink-0" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="p-2 rounded-xl hover:bg-emerald-100 text-emerald-500 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
            </Section>

            {/* Step 3: Mode */}
            <Section
              step={3}
              icon={<Cpu className="size-4" />}
              title="Choose ingestion mode"
              subtitle="How much control do you want over the pipeline?"
              done={!!mode}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Auto Mode */}
                <ModeCard
                  selected={mode === "auto"}
                  onSelect={() => setMode("auto")}
                  accent="indigo"
                  icon={<Zap className="size-5" />}
                  badge="Recommended"
                  title="Auto Mode"
                  description="VectorFlow handles everything — extraction, chunking, and embedding — in one click. Perfect for most files."
                  steps={["Extract text & tables", "Auto-chunk by semantics", "Generate & store embeddings"]}
                  tags={["Fast", "Hands-off"]}
                />
                {/* Guided Mode */}
                <ModeCard
                  selected={mode === "guided"}
                  onSelect={() => setMode("guided")}
                  accent="violet"
                  icon={<ClipboardList className="size-5" />}
                  badge="Advanced"
                  title="Guided Mode"
                  description="Review and approve each pipeline stage manually. Best for sensitive documents that need human verification."
                  steps={["Review extraction output", "Adjust chunk boundaries", "Validate before indexing"]}
                  tags={["Controlled", "Precise"]}
                />
              </div>
            </Section>

            {/* Advanced options (collapsible) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="size-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Advanced processing options</span>
                  <span className="text-[10px] font-semibold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wide">Optional</span>
                </div>
                {showAdvanced ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
              </button>

              {showAdvanced && (
                <div className="px-5 pb-5 pt-4 border-t border-gray-50 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Chunk size (tokens)</label>
                      <div className="flex gap-2">
                        {["256", "512", "1024", "2048"].map((v) => (
                          <button key={v} onClick={() => setChunkSize(v)}
                            className={cn("flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                              chunkSize === v ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"
                            )}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Overlap (tokens)</label>
                      <div className="flex gap-2">
                        {["0", "32", "64", "128"].map((v) => (
                          <button key={v} onClick={() => setOverlap(v)}
                            className={cn("flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                              overlap === v ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:border-indigo-300"
                            )}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {([
                      { icon: Scan,     label: "OCR on scanned pages",     desc: "Extract text from image-heavy documents", val: ocr,      set: setOcr      },
                      { icon: Table2,   label: "Extract tables",            desc: "Parse and normalize tabular content",     val: tables,   set: setTables   },
                      { icon: Sparkles, label: "Image captions",            desc: "Vision model captions for embedded images", val: captions, set: setCaptions },
                    ] as const).map((opt) => (
                      <div key={opt.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <opt.icon className="size-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                            <p className="text-xs text-gray-400">{opt.desc}</p>
                          </div>
                        </div>
                        <Switch checked={opt.val} onCheckedChange={opt.set} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── CTA bar ─────────────────────────────────────────── */}
            <div className={cn(
              "rounded-2xl border p-5 transition-all",
              allReady ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-100" : "bg-white border-gray-100 shadow-sm"
            )}>
              {allReady ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Ready to ingest</p>
                    <p className="text-indigo-200 text-xs mt-0.5">
                      {file?.name} → {ds?.name} · {mode === "auto" ? "Auto Mode" : "Guided Mode"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(-1)}
                      className="px-4 py-2 text-sm font-medium text-indigo-200 hover:text-white rounded-xl hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStart}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition-all shadow-sm"
                    >
                      {mode === "auto" ? <Zap className="size-4" /> : <ClipboardList className="size-4" />}
                      {mode === "auto" ? "Start Auto Ingestion" : "Start Guided Review"}
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {[!!selectedDataset, !!file, !!mode].map((done, i) => (
                        <div key={i} className={cn("w-2 h-2 rounded-full", done ? "bg-emerald-500" : "bg-gray-200")} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      {completedSteps === 0 && "Complete the steps above to start ingestion"}
                      {completedSteps === 1 && "Upload a file to continue"}
                      {completedSteps === 2 && "Choose an ingestion mode to continue"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(-1)}
                      className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      disabled
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-400 font-semibold text-sm rounded-xl cursor-not-allowed"
                    >
                      Start Ingestion
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  step, icon, title, subtitle, done, children
}: {
  step: number; icon: React.ReactNode; title: string; subtitle: string; done: boolean; children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200",
      done ? "border-emerald-200" : "border-gray-100"
    )}>
      <div className={cn(
        "flex items-center gap-3 px-5 py-4 border-b",
        done ? "bg-emerald-50/40 border-emerald-100" : "bg-gray-50/40 border-gray-50"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
          done ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white"
        )}>
          {done ? <CheckCircle2 className="size-4" /> : icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
            {done && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wide">Done</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <span className="text-xs font-bold text-gray-300">Step {step}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Mode card ─────────────────────────────────────────────────────────────────
function ModeCard({
  selected, onSelect, accent, icon, badge, title, description, steps, tags,
}: {
  selected: boolean; onSelect: () => void; accent: "indigo" | "violet";
  icon: React.ReactNode; badge: string; title: string; description: string;
  steps: string[]; tags: string[];
}) {
  const colors = {
    indigo: {
      border: selected ? "border-indigo-400" : "border-gray-200",
      bg: selected ? "bg-indigo-50/60" : "bg-white hover:bg-indigo-50/30 hover:border-indigo-200",
      iconBg: selected ? "bg-indigo-100" : "bg-gray-100 group-hover:bg-indigo-100",
      iconColor: selected ? "text-indigo-600" : "text-gray-500 group-hover:text-indigo-600",
      badge: selected ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500",
      tag: selected ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500",
      step: selected ? "text-indigo-600" : "text-gray-400",
      dot: selected ? "bg-indigo-500" : "bg-gray-300",
    },
    violet: {
      border: selected ? "border-violet-400" : "border-gray-200",
      bg: selected ? "bg-violet-50/60" : "bg-white hover:bg-violet-50/30 hover:border-violet-200",
      iconBg: selected ? "bg-violet-100" : "bg-gray-100 group-hover:bg-violet-100",
      iconColor: selected ? "text-violet-600" : "text-gray-500 group-hover:text-violet-600",
      badge: selected ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500",
      tag: selected ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500",
      step: selected ? "text-violet-600" : "text-gray-400",
      dot: selected ? "bg-violet-500" : "bg-gray-300",
    },
  }[accent];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-0 rounded-2xl border-2 p-5 cursor-pointer transition-all group text-left w-full",
        colors.border, colors.bg
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", colors.iconBg)}>
          <span className={cn("transition-colors", colors.iconColor)}>{icon}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide transition-colors", colors.badge)}>
            {badge}
          </span>
          {selected && <CheckCircle2 className={cn("size-4", accent === "indigo" ? "text-indigo-600" : "text-violet-600")} />}
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed mb-4">{description}</p>

      {/* Pipeline steps */}
      <div className="space-y-1.5 mb-4">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-colors",
              selected ? (accent === "indigo" ? "bg-indigo-100 text-indigo-700" : "bg-violet-100 text-violet-700") : "bg-gray-100 text-gray-500"
            )}>
              {i + 1}
            </div>
            <span className={cn("text-xs font-medium transition-colors", colors.step)}>{s}</span>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 mt-auto">
        {tags.map((t) => (
          <span key={t} className={cn("text-xs px-2.5 py-1 rounded-full font-semibold transition-colors", colors.tag)}>{t}</span>
        ))}
      </div>
    </button>
  );
}

// ── Dataset Picker ────────────────────────────────────────────────────────────
function DatasetPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = DATASETS.find((d) => d.id === value) ?? null;
  const filtered = query.trim()
    ? DATASETS.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))
    : DATASETS;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-white text-left transition-all",
          open ? "border-indigo-400 ring-4 ring-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50/50"
        )}
      >
        {selected ? (
          <>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <FolderOpen className="size-4 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{selected.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {selected.documents} documents · {selected.chunks.toLocaleString()} chunks · {selected.embeddingModel}
              </p>
            </div>
            <CheckCircle2 className="size-4 text-indigo-500 flex-shrink-0 mr-1" />
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Database className="size-4 text-gray-400" />
            </div>
            <span className="flex-1 text-sm text-gray-400">Select a dataset…</span>
          </>
        )}
        <ChevronDown className={cn("size-4 text-gray-400 transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-100/80 overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
            <Search className="size-4 text-gray-400 flex-shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search datasets…"
              className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Database className="size-6 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">No datasets match "{query}"</p>
              </div>
            ) : (
              filtered.map((d) => {
                const sel = d.id === value;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelect(d.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 mx-1.5 rounded-xl transition-all text-left",
                      "w-[calc(100%-12px)]",
                      sel ? "bg-indigo-50" : "hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      sel ? "bg-indigo-100" : "bg-gray-100"
                    )}>
                      <FolderOpen className={cn("size-4", sel ? "text-indigo-600" : "text-gray-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-semibold truncate", sel ? "text-indigo-900" : "text-gray-800")}>{d.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{d.documents} docs · {d.chunks.toLocaleString()} chunks</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase",
                        d.status === "active" ? "bg-emerald-100 text-emerald-700"
                          : d.status === "indexing" ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      )}>
                        {d.status}
                      </span>
                      {sel && <CheckCircle2 className="size-4 text-indigo-500" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs text-gray-400">{DATASETS.length} datasets available</p>
            <a href="/datasets" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              Manage datasets →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
