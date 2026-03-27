import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { DATASETS } from "@/data/mock";
import {
  Upload, Zap, ClipboardList, FileText, X,
  CheckCircle2, ArrowRight, ChevronDown,
  FileImage, FileSpreadsheet, FileCode, Music, Video,
  FolderOpen, Search, Database, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── File-type helpers ─────────────────────────────────────────────────────────
type IconComponent = typeof FileText;
const EXT_ICON: Record<string, { icon: IconComponent; color: string }> = {
  pdf:   { icon: FileText,        color: "text-red-500 bg-red-50" },
  docx:  { icon: FileText,        color: "text-blue-500 bg-blue-50" },
  doc:   { icon: FileText,        color: "text-blue-500 bg-blue-50" },
  xlsx:  { icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50" },
  csv:   { icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50" },
  pptx:  { icon: FileImage,       color: "text-orange-500 bg-orange-50" },
  json:  { icon: FileCode,        color: "text-purple-500 bg-purple-50" },
  jsonl: { icon: FileCode,        color: "text-purple-500 bg-purple-50" },
  md:    { icon: FileCode,        color: "text-gray-600 bg-gray-100" },
  txt:   { icon: FileText,        color: "text-gray-600 bg-gray-100" },
  html:  { icon: FileCode,        color: "text-orange-600 bg-orange-50" },
  mp4:   { icon: Video,           color: "text-pink-600 bg-pink-50" },
  mp3:   { icon: Music,           color: "text-violet-600 bg-violet-50" },
};
function getFileExt(name: string) { return name.split(".").pop()?.toLowerCase() ?? ""; }
function getFileInfo(file: File) {
  return EXT_ICON[getFileExt(file.name)] ?? { icon: FileText, color: "text-gray-500 bg-gray-100" };
}
function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const FILE_TYPES = ["PDF", "DOCX", "TXT", "CSV", "JSON", "MD", "PPTX", "XLSX", "MP4", "MP3"];

export default function NewIngestionPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedDataset, setSelectedDataset] = useState(DATASETS[0].id);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"auto" | "guided" | null>(null);
  const [dragOver, setDragOver] = useState(false);

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
    if (!canStart) return;
    navigate(mode === "auto" ? "/ingestions/auto" : "/ingestions/guided");
  };

  const canStart = !!selectedDataset && !!file && !!mode;
  const filledCount = [!!selectedDataset, !!file, !!mode].filter(Boolean).length;

  const hint =
    !file ? "Upload a file to continue" :
    !mode ? "Choose an ingestion mode" :
    null;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-gray-50/60">
      <Topbar title="New Ingestion" breadcrumbs={[{ label: "Ingestions" }]} />

      <main className="flex-1 flex flex-col items-center px-6 py-12">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="size-3.5" />
            AI-powered ingestion
          </div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">New Ingestion</h1>
          <p className="text-sm text-gray-500 mt-2">Upload a document and choose how to process it</p>
        </div>

        <div className="w-full max-w-[520px] space-y-6">

          {/* ── DATASET ─────────────────────────────────────────────────── */}
          <Field label="Dataset" done={!!selectedDataset}>
            <DatasetPicker value={selectedDataset} onChange={setSelectedDataset} />
          </Field>

          {/* ── FILE ────────────────────────────────────────────────────── */}
          <Field label="File" done={!!file}>
            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-2xl cursor-pointer transition-all select-none overflow-hidden",
                  dragOver
                    ? "border-indigo-400 bg-indigo-50/60"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20 bg-white"
                )}
              >
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleSelect} />

                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all",
                    dragOver ? "bg-indigo-100 scale-110" : "bg-gray-100"
                  )}>
                    <Upload className={cn("size-6 transition-colors", dragOver ? "text-indigo-500" : "text-gray-400")} />
                  </div>

                  <p className={cn("text-sm font-semibold transition-colors", dragOver ? "text-indigo-700" : "text-gray-700")}>
                    {dragOver ? "Release to upload" : "Drop your file here"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    or <span className="text-indigo-600 font-medium underline underline-offset-2">browse files</span>
                  </p>

                  <div className="flex flex-wrap justify-center gap-1.5 mt-5">
                    {FILE_TYPES.map((t) => (
                      <span key={t} className="text-[10px] font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md tracking-wide">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Max 500 MB</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3.5 px-4 py-4 bg-white rounded-2xl border border-emerald-200 shadow-sm">
                {(() => {
                  const { icon: Icon, color } = getFileInfo(file);
                  const [textColor, bgColor] = color.split(" ");
                  return (
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bgColor)}>
                      <Icon className={cn("size-5", textColor)} />
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatSize(file.size)} · Ready to process</p>
                </div>
                <CheckCircle2 className="size-5 text-emerald-500 flex-shrink-0" />
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
          </Field>

          {/* ── INGESTION MODE ───────────────────────────────────────────── */}
          <Field label="Ingestion Mode" done={!!mode}>
            <div className="grid grid-cols-2 gap-3">
              <ModeCard
                selected={mode === "auto"}
                onSelect={() => setMode("auto")}
                accent="indigo"
                icon={Zap}
                badge="Recommended"
                title="Auto Mode"
                description="Fully automated pipeline. The system processes your file end-to-end with minimal interaction."
                time="~2 min"
              />
              <ModeCard
                selected={mode === "guided"}
                onSelect={() => setMode("guided")}
                accent="violet"
                icon={ClipboardList}
                badge="Advanced"
                title="Guided Mode"
                description="Step-by-step review workflow. Inspect, edit, and approve at every stage of the pipeline."
                time="Manual"
              />
            </div>
          </Field>

          {/* ── START BUTTON ─────────────────────────────────────────────── */}
          <div className="pt-1 space-y-3">
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2">
              {["Dataset", "File", "Mode"].map((label, i) => {
                const done = i < filledCount;
                return (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      done ? "bg-emerald-500" : "bg-gray-300"
                    )} />
                    <span className={cn("text-xs font-medium transition-colors", done ? "text-emerald-600" : "text-gray-400")}>{label}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleStart}
              disabled={!canStart}
              className={cn(
                "w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-200",
                canStart
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.99]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {canStart ? (
                <>
                  {mode === "auto" ? <Zap className="size-4" /> : <ClipboardList className="size-4" />}
                  {mode === "auto" ? "Start Auto Ingestion" : "Start Guided Review"}
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  {hint ?? "Complete all steps to continue"}
                </>
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

// ── Field wrapper with label + done state ─────────────────────────────────────
function Field({ label, done, children }: { label: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        {done && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
            <CheckCircle2 className="size-2.5" /> Done
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

// ── Mode card ─────────────────────────────────────────────────────────────────
function ModeCard({
  selected, onSelect, accent, icon: Icon, badge, title, description, time,
}: {
  selected: boolean; onSelect: () => void; accent: "indigo" | "violet";
  icon: IconComponent; badge: string; title: string; description: string; time: string;
}) {
  const c = {
    indigo: {
      border: selected ? "border-indigo-300" : "border-gray-200 hover:border-indigo-200",
      bg: selected ? "bg-indigo-50/70" : "bg-white hover:bg-indigo-50/30",
      ring: selected ? "ring-1 ring-indigo-200" : "",
      iconBg: selected ? "bg-indigo-100" : "bg-gray-100",
      iconColor: selected ? "text-indigo-600" : "text-gray-400",
      badge: selected ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-400",
      time: selected ? "text-indigo-500" : "text-gray-400",
    },
    violet: {
      border: selected ? "border-violet-300" : "border-gray-200 hover:border-violet-200",
      bg: selected ? "bg-violet-50/70" : "bg-white hover:bg-violet-50/30",
      ring: selected ? "ring-1 ring-violet-200" : "",
      iconBg: selected ? "bg-violet-100" : "bg-gray-100",
      iconColor: selected ? "text-violet-600" : "text-gray-400",
      badge: selected ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-400",
      time: selected ? "text-violet-500" : "text-gray-400",
    },
  }[accent];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all w-full",
        c.border, c.bg, c.ring
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between w-full">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-colors", c.iconBg)}>
          <Icon className={cn("size-4.5 transition-colors", c.iconColor)} />
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide transition-colors", c.badge)}>
          {badge}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1.5 mt-auto pt-1 w-full">
        <div className={cn("w-1 h-1 rounded-full flex-shrink-0 transition-colors", selected ? (accent === "indigo" ? "bg-indigo-400" : "bg-violet-400") : "bg-gray-300")} />
        <span className={cn("text-[11px] font-medium transition-colors", c.time)}>Avg. time: {time}</span>
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const handleSelect = (id: string) => { onChange(id); setOpen(false); setQuery(""); };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-white text-left transition-all",
          open
            ? "border-indigo-300 ring-2 ring-indigo-50 shadow-sm"
            : "border-gray-200 hover:border-indigo-200 hover:shadow-sm"
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <FolderOpen className="size-4 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          {selected ? (
            <>
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{selected.name}</p>
              <p className="text-xs text-gray-400 leading-tight mt-0.5">
                {selected.documents} docs · {selected.chunks.toLocaleString()} chunks
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Select a dataset…</p>
          )}
        </div>
        <ChevronDown className={cn("size-4 text-gray-400 transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
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
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-56 overflow-y-auto py-1.5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <Database className="size-6 text-gray-300" />
                <p className="text-xs text-gray-400">No datasets match "{query}"</p>
              </div>
            ) : filtered.map((d) => {
              const sel = d.id === value;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelect(d.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left",
                    sel ? "bg-indigo-50" : "hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    sel ? "bg-indigo-100" : "bg-gray-100"
                  )}>
                    <FolderOpen className={cn("size-3.5", sel ? "text-indigo-600" : "text-gray-400")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", sel ? "text-indigo-900" : "text-gray-800")}>{d.name}</p>
                    <p className="text-xs text-gray-400">{d.documents} docs · {d.chunks.toLocaleString()} chunks</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      d.status === "active" ? "bg-emerald-100 text-emerald-700" :
                      d.status === "indexing" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                    )}>
                      {d.status}
                    </span>
                    {sel && <CheckCircle2 className="size-4 text-indigo-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between bg-gray-50/50">
            <p className="text-xs text-gray-400">{DATASETS.length} datasets</p>
            <a href="/datasets" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              Manage datasets →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
