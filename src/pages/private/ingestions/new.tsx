import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { DATASETS } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Upload, Zap, ClipboardList, FileText, X, ChevronDown, ChevronUp
} from "lucide-react";

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

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="New Ingestion" breadcrumbs={[{ label: "Ingestions" }]} />

      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Start a New Ingestion</h1>
            <p className="text-sm text-gray-500 mt-1">Upload a file, select a dataset, and choose how you want to process it.</p>
          </div>

          {/* Step 1: Dataset */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <StepCircle n={1} />
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Select Dataset</h2>
                <p className="text-xs text-gray-500">Choose which dataset this file belongs to</p>
              </div>
            </div>
            <div className="space-y-3">
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATASETS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ds && (
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="size-4 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-900">{ds.name}</p>
                    <p className="text-xs text-indigo-600">{ds.documents} documents · {ds.chunks.toLocaleString()} chunks</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Upload */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <StepCircle n={2} />
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Upload File</h2>
                <p className="text-xs text-gray-500">Drag & drop or click to select a file</p>
              </div>
            </div>

            {!uploadedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Upload className="size-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">Drop your file here, or click to browse</p>
                <p className="text-xs text-gray-400">Max file size: 500 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="size-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
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
                <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">{t}</span>
              ))}
            </div>
          </div>

          {/* Step 3: Mode */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <StepCircle n={3} />
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Ingestion Mode</h2>
                <p className="text-xs text-gray-500">Choose how the system should process your file</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ModeCard
                selected={mode === "auto"}
                onSelect={() => setMode("auto")}
                icon={<Zap className="size-5 text-indigo-600" />}
                title="Auto Mode"
                description="The system automatically processes the entire pipeline with minimal interaction. Best for bulk ingestion."
                tags={["Fast", "Hands-off", "Bulk"]}
              />
              <ModeCard
                selected={mode === "guided"}
                onSelect={() => setMode("guided")}
                icon={<ClipboardList className="size-5 text-violet-600" />}
                title="Guided Mode"
                description="Step-by-step review of each stage — extraction, chunking, metadata. Best for sensitive or high-value documents."
                tags={["Controlled", "Reviewable", "Precise"]}
              />
            </div>
          </div>

          {/* Advanced settings */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full px-6 py-4"
            >
              <span className="text-sm font-medium text-gray-700">Advanced Settings</span>
              {showAdvanced ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </button>
            {showAdvanced && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-50 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Chunk Size (tokens)</Label>
                    <Select defaultValue="512">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="256">256</SelectItem>
                        <SelectItem value="512">512</SelectItem>
                        <SelectItem value="1024">1024</SelectItem>
                        <SelectItem value="2048">2048</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Overlap (tokens)</Label>
                    <Select defaultValue="64">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="32">32</SelectItem>
                        <SelectItem value="64">64</SelectItem>
                        <SelectItem value="128">128</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Run OCR on scanned pages</p>
                    <p className="text-xs text-gray-400">Automatically apply OCR to image-heavy content</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Extract tables</p>
                    <p className="text-xs text-gray-400">Parse and normalize tabular content separately</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Include image captions</p>
                    <p className="text-xs text-gray-400">Use vision model to generate captions for embedded images</p>
                  </div>
                  <Switch />
                </div>
              </div>
            )}
          </div>

          {/* Action */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button
              disabled={!mode}
              className="min-w-36"
              onClick={handleStart}
            >
              {mode === "auto" ? "Start Auto Ingestion" : mode === "guided" ? "Start Guided Review" : "Start Ingestion"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepCircle({ n }: { n: number }) {
  return (
    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
      {n}
    </div>
  );
}

function ModeCard({
  selected, onSelect, icon, title, description, tags,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
}) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
        selected
          ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
          : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50/50"
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${selected ? "bg-indigo-100" : "bg-gray-100"}`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{description}</p>
      <div className="flex gap-1.5 flex-wrap">
        {tags.map((t) => (
          <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
