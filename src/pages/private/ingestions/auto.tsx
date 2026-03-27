import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { INGESTION_STEPS, LOGS } from "@/data/mock";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Circle, Loader2, AlertCircle, FileText, Database,
  Layers, Cpu, ChevronRight, ExternalLink, RefreshCw, Download
} from "lucide-react";

type StepStatus = "complete" | "active" | "pending" | "error";

const PIPELINE_STEPS = [
  "Load & Detect", "Extract", "Normalize", "Chunking",
  "Embed Text", "Metadata", "Embedding", "Index"
];

export default function AutoModePage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(3);
  const [completed, setCompleted] = useState(false);
  const [failed] = useState(false);

  useEffect(() => {
    if (activeStep < PIPELINE_STEPS.length && !completed) {
      const timer = setTimeout(() => {
        if (activeStep < PIPELINE_STEPS.length - 1) {
          setActiveStep((s) => s + 1);
        } else {
          setCompleted(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeStep, completed]);

  const getStepStatus = (i: number): StepStatus => {
    if (i < activeStep) return "complete";
    if (i === activeStep && !completed) return "active";
    if (completed) return "complete";
    return "pending";
  };

  if (failed) return <ErrorState />;
  if (completed) return <SuccessState onNavigate={navigate} />;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Auto Mode Ingestion" breadcrumbs={[{ label: "Ingestions" }]} />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto w-full px-8 py-7 space-y-5">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <FileText className="size-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">api-reference-v2.4.pdf</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                  <span>Product Documentation v2</span>
                  <ChevronRight className="size-3" />
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium">Auto Mode</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <Loader2 className="size-3.5 animate-spin" />
                Processing
              </span>
            </div>
          </div>
        </div>

        {/* Horizontal stepper */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
          <div className="flex items-center">
            {PIPELINE_STEPS.map((step, i) => {
              const status = getStepStatus(i);
              return (
                <div key={step} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      status === "complete" ? "bg-emerald-500" :
                      status === "active" ? "bg-indigo-600 ring-4 ring-indigo-100" :
                      status === "error" ? "bg-red-500" :
                      "bg-gray-100"
                    }`}>
                      {status === "complete" ? (
                        <CheckCircle2 className="size-4 text-white" />
                      ) : status === "active" ? (
                        <Loader2 className="size-4 text-white animate-spin" />
                      ) : status === "error" ? (
                        <AlertCircle className="size-4 text-white" />
                      ) : (
                        <Circle className="size-4 text-gray-300" />
                      )}
                    </div>
                    <span className={`text-xs mt-1.5 text-center whitespace-nowrap ${
                      status === "active" ? "text-indigo-700 font-semibold" :
                      status === "complete" ? "text-emerald-600 font-medium" :
                      "text-gray-400"
                    }`}>{step}</span>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 rounded-full mt-[-16px] transition-all ${
                      i < activeStep ? "bg-emerald-400" : "bg-gray-100"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Main area */}
          <div className="col-span-2 space-y-4">
            {/* Progress bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {PIPELINE_STEPS[activeStep]}…
                </span>
                <span className="text-sm text-gray-500">{Math.round((activeStep / PIPELINE_STEPS.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${(activeStep / PIPELINE_STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Status cards */}
            <div className="grid grid-cols-2 gap-3">
              {INGESTION_STEPS.slice(0, 4).map((step) => (
                <div key={step.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">{step.label}</span>
                    <StepStatusPill status={step.status} />
                  </div>
                  {step.count !== undefined && (
                    <p className="text-xl font-bold text-gray-900">{step.count.toLocaleString()}</p>
                  )}
                  {step.duration && (
                    <p className="text-xs text-gray-400 mt-0.5">{step.duration}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Logs stream */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Live Logs</h3>
                <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  <Download className="size-3" /> Download
                </button>
              </div>
              <div className="bg-gray-950 p-4 font-mono text-xs space-y-1.5 max-h-56 overflow-y-auto">
                {LOGS.map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-gray-500 flex-shrink-0">{log.timestamp}</span>
                    <span className={`flex-shrink-0 ${
                      log.level === "error" ? "text-red-400" :
                      log.level === "warn" ? "text-amber-400" :
                      "text-emerald-400"
                    }`}>[{log.level.toUpperCase()}]</span>
                    <span className="text-gray-300">{log.message}</span>
                  </div>
                ))}
                {!completed && (
                  <div className="flex gap-3 items-center">
                    <span className="text-gray-500">14:32:09</span>
                    <span className="text-emerald-400">[INFO]</span>
                    <span className="text-gray-300">
                      {PIPELINE_STEPS[activeStep]}
                      <span className="animate-pulse">…</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Ingestion Summary</h3>
              <div className="space-y-3">
                {[
                  { icon: FileText, label: "Source File", value: "api-reference-v2.4.pdf", color: "text-gray-400" },
                  { icon: Database, label: "Dataset", value: "Product Docs v2", color: "text-indigo-400" },
                  { icon: Layers, label: "Pages Extracted", value: "187", color: "text-blue-400" },
                  { icon: Layers, label: "Chunks Generated", value: activeStep >= 4 ? "231" : "—", color: "text-violet-400" },
                  { icon: Cpu, label: "Embedding Model", value: "text-embedding-3-large", color: "text-emerald-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className={`size-4 mt-0.5 flex-shrink-0 ${item.color}`} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content preview */}
            {activeStep >= 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Extracted Preview</h3>
                <div className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed line-clamp-6">
                  The API uses Bearer token authentication. All requests must include a valid JWT in the Authorization header with the format 'Bearer &lt;token&gt;'. Tokens expire after 3600 seconds and must be refreshed using the /auth/refresh endpoint…
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

function StepStatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    complete: "bg-emerald-50 text-emerald-700",
    active: "bg-indigo-50 text-indigo-700",
    pending: "bg-gray-100 text-gray-500",
    error: "bg-red-50 text-red-700",
  };
  const labels: Record<string, string> = {
    complete: "Done", active: "Active", pending: "Pending", error: "Failed",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[status] ?? status}
    </span>
  );
}

function SuccessState({ onNavigate }: { onNavigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Ingestion Complete" breadcrumbs={[{ label: "Ingestions" }]} />
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="size-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ingestion Complete</h2>
          <p className="text-sm text-gray-500 mb-6">Your document has been fully processed and indexed.</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: "Pages Extracted", value: "187" },
              { label: "Chunks Indexed", value: "231" },
              { label: "Embedding Model", value: "3-large" },
              { label: "Vector Store", value: "Pinecone" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <Button size="sm" onClick={() => onNavigate("/documents/doc-001")}>
              <ExternalLink className="size-4 mr-1.5" />Open Document
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigate("/retrieval")}>
              Test Retrieval
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigate("/chunks")}>
              View Chunks
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigate("/ingestions/new")}>
              Upload Another
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Ingestion Failed" breadcrumbs={[{ label: "Ingestions" }]} />
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="size-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ingestion Failed</h2>
          <p className="text-sm text-gray-500 mb-2">Failed at <strong>Chunking</strong> step after 1m 03s</p>
          <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-6 text-left">
            Error: Chunk split exceeded max token limit (4096). Consider reducing chunk size or splitting the source document.
          </p>
          <div className="flex gap-2 justify-center">
            <Button size="sm">
              <RefreshCw className="size-4 mr-1.5" />Retry
            </Button>
            <Button size="sm" variant="outline">
              <Download className="size-4 mr-1.5" />Download Logs
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
