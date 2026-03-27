import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { DATASETS } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Upload, Zap, ClipboardList, FileText, X, ChevronDown, ChevronUp,
  CheckCircle2, ArrowRight, Sparkles, Scan, Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUPPORTED_TYPES = ["PDF", "DOCX", "XLSX", "CSV", "TXT", "MD", "HTML", "PPTX", "JSON", "JSONL", "MP4", "MP3"];

export default function NewIngestionPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDataset, setSelectedDataset] = useState(DATASETS[0].id);
  const [mode, setMode] = useState<"auto" | "guided" | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleStart = () => {
    if (!mode) return;
    if (mode === "auto") navigate("/ingestions/auto");
    else navigate("/ingestions/guided");
  };

  const ds = DATASETS.find((d) => d.id === selectedDataset);

  const steps = [
    { n: 1, label: "Dataset", done: !!selectedDataset },
    { n: 2, label: "File", done: !!uploadedFile },
    { n: 3, label: "Mode", done: !!mode },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-gray-50/40">
      <Topbar title="New Ingestion" breadcrumbs={[{ label: "Ingestions" }]} />

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Header with step progress */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">New Ingestion</h1>
              <p className="text-sm text-gray-500 mt-0.5">Upload a file and choose how to process it</p>
            </div>
            {/* Steps indicator */}
            <div className="flex items-center gap-1">
              {steps.map((step, i) => (
                <div key={step.n} className="flex items-center gap-1">
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                    step.done
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-400"
                  )}>
                    {step.done ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex-shrink-0" />
                    )}
                    {step.label}
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="size-3 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Dataset */}
          <StepCard n={1} label="Select Dataset" desc="Choose which dataset this file belongs to" done={!!selectedDataset}>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATASETS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {ds && (
              <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100 mt-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="size-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-indigo-900">{ds.name}</p>
                  <p className="text-xs text-indigo-500">{ds.documents} documents · {ds.chunks.toLocaleString()} chunks</p>
                </div>
                <CheckCircle2 className="size-4 text-indigo-500 flex-shrink-0" />
              </div>
            )}
          </StepCard>

          {/* Step 2: Upload */}
          <StepCard n={2} label="Upload File" desc="Drag & drop or click to select a file" done={!!uploadedFile}>
            {!uploadedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all",
                  dragOver
                    ? "border-indigo-400 bg-indigo-50 scale-[1.01]"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors",
                  dragOver ? "bg-indigo-100" : "bg-gray-100"
                )}>
                  <Upload className={cn("size-6", dragOver ? "text-indigo-500" : "text-gray-400")} />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {dragOver ? "Release to upload" : "Drop your file here, or click to browse"}
                </p>
                <p className="text-xs text-gray-400">Max file size: 500 MB</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="size-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to ingest</p>
                </div>
                <CheckCircle2 className="size-5 text-emerald-600 flex-shrink-0" />
                <button
                  onClick={() => setUploadedFile(null)}
                  className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {SUPPORTED_TYPES.map((t) => (
                <span key={t} className="text-[10px] font-mono font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </StepCard>

          {/* Step 3: Mode */}
          <StepCard n={3} label="Ingestion Mode" desc="Choose how the system should process your file" done={!!mode}>
            <div className="grid grid-cols-2 gap-3">
              <ModeCard
                selected={mode === "auto"}
                onSelect={() => setMode("auto")}
                icon={<Zap className={cn("size-5", mode === "auto" ? "text-indigo-600" : "text-gray-500")} />}
                title="Auto Mode"
                description="The system automatically processes the entire pipeline. Best for bulk ingestion with minimal interaction."
                tags={["Fast", "Hands-off", "Bulk"]}
                accent="indigo"
              />
              <ModeCard
                selected={mode === "guided"}
                onSelect={() => setMode("guided")}
                icon={<ClipboardList className={cn("size-5", mode === "guided" ? "text-violet-600" : "text-gray-500")} />}
                title="Guided Mode"
                description="Step-by-step review of each stage — extraction, chunking, metadata. Best for sensitive documents."
                tags={["Controlled", "Reviewable", "Precise"]}
                accent="violet"
              />
            </div>
          </StepCard>

          {/* Advanced settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Advanced Processing Options</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
              </div>
              {showAdvanced
                ? <ChevronUp className="size-4 text-gray-400" />
                : <ChevronDown className="size-4 text-gray-400" />
              }
            </button>
            {showAdvanced && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-50 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Chunk Size (tokens)</Label>
                    <Select defaultValue="512">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="256">256 — Small</SelectItem>
                        <SelectItem value="512">512 — Default</SelectItem>
                        <SelectItem value="1024">1024 — Large</SelectItem>
                        <SelectItem value="2048">2048 — Extra large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Overlap (tokens)</Label>
                    <Select defaultValue="64">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 — None</SelectItem>
                        <SelectItem value="32">32</SelectItem>
                        <SelectItem value="64">64 — Default</SelectItem>
                        <SelectItem value="128">128</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {[
                  { label: "Run OCR on scanned pages", desc: "Apply OCR to image-heavy content", icon: Scan, defaultOn: true },
                  { label: "Extract tables", desc: "Parse and normalize tabular content separately", icon: Table2, defaultOn: true },
                  { label: "Include image captions", desc: "Use vision model to generate captions for embedded images", icon: Sparkles, defaultOn: false },
                ].map((opt) => (
                  <div key={opt.label} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <opt.icon className="size-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-700 font-medium">{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.desc}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={opt.defaultOn} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-1">
            <Button variant="outline" onClick={() => navigate(-1)} className="text-gray-500">
              Cancel
            </Button>
            <Button
              disabled={!mode}
              className={cn(
                "min-w-44 gap-2 transition-all",
                !mode && "opacity-40"
              )}
              onClick={handleStart}
            >
              {mode === "auto" ? (
                <>
                  <Zap className="size-4" />
                  Start Auto Ingestion
                </>
              ) : mode === "guided" ? (
                <>
                  <ClipboardList className="size-4" />
                  Start Guided Review
                </>
              ) : (
                "Select a Mode"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepCard({
  n, label, desc, done, children
}: {
  n: number; label: string; desc: string; done: boolean; children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all",
      done ? "border-emerald-200" : "border-gray-100"
    )}>
      <div className={cn(
        "flex items-center gap-3 px-5 py-4 border-b",
        done ? "border-emerald-100 bg-emerald-50/30" : "border-gray-50 bg-gray-50/30"
      )}>
        <div className={cn(
          "w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm",
          done ? "bg-emerald-500" : "bg-indigo-600"
        )}>
          {done ? <CheckCircle2 className="size-4" /> : n}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{label}</h2>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ModeCard({
  selected, onSelect, icon, title, description, tags, accent,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
  accent: "indigo" | "violet";
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "rounded-2xl border-2 p-4 cursor-pointer transition-all group",
        selected
          ? accent === "indigo"
            ? "border-indigo-400 bg-indigo-50/50 shadow-sm"
            : "border-violet-400 bg-violet-50/50 shadow-sm"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors",
        selected
          ? accent === "indigo" ? "bg-indigo-100" : "bg-violet-100"
          : "bg-gray-100 group-hover:bg-gray-200"
      )}>
        {icon}
      </div>
      <div className="flex items-start justify-between mb-1.5">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {selected && <CheckCircle2 className={cn("size-4 flex-shrink-0", accent === "indigo" ? "text-indigo-600" : "text-violet-600")} />}
      </div>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{description}</p>
      <div className="flex gap-1.5 flex-wrap">
        {tags.map((t) => (
          <span key={t} className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            selected
              ? accent === "indigo"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-violet-100 text-violet-700"
              : "bg-gray-100 text-gray-500"
          )}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
