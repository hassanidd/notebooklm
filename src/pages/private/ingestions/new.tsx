import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { DATASETS } from "@/data/mock";
import {
  Upload, Zap, ClipboardList, FileText, X,
  CheckCircle2, ArrowRight, ChevronDown,
  FileImage, FileSpreadsheet, FileCode, Music, Video,
  FolderOpen, Search, Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── File-type helpers ─────────────────────────────────────────────────────────
type IconComponent = typeof FileText;
const EXT_ICON: Record<string, { icon: IconComponent; color: string }> = {
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
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

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
    if (!mode) return;
    navigate(mode === "auto" ? "/ingestions/auto" : "/ingestions/guided");
  };

  const canStart = !!selectedDataset && !!file && !!mode;

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-white">
      <Topbar title="New Ingestion" breadcrumbs={[{ label: "Ingestions" }]} />

      <main className="flex-1 flex flex-col items-center px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900">New Ingestion</h1>
          <p className="text-sm text-gray-400 mt-1.5">Upload a document and choose how to process it</p>
        </div>

        <div className="w-full max-w-[480px] space-y-7">

          {/* ── DATASET ─────────────────────────────────────────────── */}
          <section className="space-y-2">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Dataset</label>
            <DatasetPicker value={selectedDataset} onChange={setSelectedDataset} />
          </section>

          {/* ── FILE ────────────────────────────────────────────────── */}
          <section className="space-y-2">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">File</label>
            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border border-dashed rounded-xl cursor-pointer transition-all",
                  dragOver ? "border-indigo-400 bg-indigo-50/40" : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                )}
              >
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleSelect} />
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors",
                    dragOver ? "bg-indigo-100" : "bg-gray-100"
                  )}>
                    <Upload className={cn("size-5", dragOver ? "text-indigo-500" : "text-gray-400")} />
                  </div>
                  <p className="text-sm text-gray-700">
                    Drop your file here, or{" "}
                    <span className="text-indigo-600 font-medium">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    PDF, DOCX, TXT, CSV, JSON, MD, PPTX, XLSX
                  </p>
                </div>
              </div>
            ) : (
              <div className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all",
                "border-emerald-200 bg-emerald-50/40"
              )}>
                {(() => {
                  const { icon: Icon, color } = getFileInfo(file);
                  const [textColor, bgColor] = color.split(" ");
                  return (
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", bgColor)}>
                      <Icon className={cn("size-4", textColor)} />
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatSize(file.size)}</p>
                </div>
                <CheckCircle2 className="size-4 text-emerald-500 flex-shrink-0" />
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-1.5 rounded-lg hover:bg-emerald-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
          </section>

          {/* ── INGESTION MODE ───────────────────────────────────────── */}
          <section className="space-y-2">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Ingestion Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <ModeCard
                selected={mode === "auto"}
                onSelect={() => setMode("auto")}
                icon={<Zap className={cn("size-5", mode === "auto" ? "text-indigo-600" : "text-gray-400")} />}
                title="Auto Mode"
                description="Fully automated pipeline. The system processes your file end-to-end with minimal interaction."
              />
              <ModeCard
                selected={mode === "guided"}
                onSelect={() => setMode("guided")}
                icon={<ClipboardList className={cn("size-5", mode === "guided" ? "text-indigo-600" : "text-gray-400")} />}
                title="Guided Mode"
                description="Step-by-step review workflow. Inspect, edit, and approve at every stage of the pipeline."
              />
            </div>
          </section>

          {/* ── START BUTTON ─────────────────────────────────────────── */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={cn(
              "w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
              canStart
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md shadow-indigo-100"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            Start Ingestion
            <ArrowRight className="size-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Mode card ─────────────────────────────────────────────────────────────────
function ModeCard({
  selected, onSelect, icon, title, description,
}: {
  selected: boolean; onSelect: () => void;
  icon: React.ReactNode; title: string; description: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all w-full",
        selected
          ? "border-indigo-300 bg-indigo-50/60 ring-1 ring-indigo-200"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
      )}
    >
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
        selected ? "bg-indigo-100" : "bg-gray-100"
      )}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{description}</p>
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
          "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border bg-white text-left transition-all",
          open ? "border-indigo-300 ring-2 ring-indigo-100" : "border-gray-200 hover:border-gray-300"
        )}
      >
        <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <FolderOpen className="size-3.5 text-indigo-600" />
        </div>
        <span className="flex-1 text-sm font-medium text-gray-900 truncate">
          {selected?.name ?? "Select a dataset…"}
        </span>
        <ChevronDown className={cn("size-4 text-gray-400 transition-transform flex-shrink-0", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-100/60 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
            <Search className="size-3.5 text-gray-400 flex-shrink-0" />
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

          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Database className="size-5 text-gray-300 mb-1.5" />
                <p className="text-xs text-gray-400">No results for "{query}"</p>
              </div>
            ) : filtered.map((d) => {
              const sel = d.id === value;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelect(d.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 transition-all text-left",
                    sel ? "bg-indigo-50" : "hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0",
                    sel ? "bg-indigo-100" : "bg-gray-100"
                  )}>
                    <FolderOpen className={cn("size-3.5", sel ? "text-indigo-600" : "text-gray-400")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", sel ? "text-indigo-900" : "text-gray-800")}>{d.name}</p>
                    <p className="text-xs text-gray-400">{d.documents} docs · {d.chunks.toLocaleString()} chunks</p>
                  </div>
                  {sel && <CheckCircle2 className="size-4 text-indigo-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
