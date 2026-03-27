import { useState } from "react";
import Topbar from "@/components/app/topbar";
import { ACTIVITY_LOGS } from "@/data/mock";
import { StatusBadge, ModeBadge } from "@/components/app/status-badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Clock, ChevronRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const STATUS_ICON: Record<string, React.ReactNode> = {
  complete: <CheckCircle2 className="size-4 text-emerald-500" />,
  failed: <AlertCircle className="size-4 text-red-500" />,
  embedding: <Loader2 className="size-4 text-blue-500 animate-spin" />,
  queued: <Clock className="size-4 text-gray-400" />,
};

export default function ActivityPage() {
  const [selectedLog, setSelectedLog] = useState<typeof ACTIVITY_LOGS[0] | null>(null);
  const [search, setSearch] = useState("");

  const filtered = ACTIVITY_LOGS.filter((l) =>
    l.document.toLowerCase().includes(search.toLowerCase()) ||
    l.dataset.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Activity" />

      <main className="flex-1 p-6 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search logs…"
              className="pl-9 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select defaultValue="all-datasets">
            <SelectTrigger className="w-48 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-datasets">All Datasets</SelectItem>
              <SelectItem value="ds-001">Product Documentation v2</SelectItem>
              <SelectItem value="ds-002">Legal Contracts 2024</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-status">
            <SelectTrigger className="w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="embedding">Running</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-mode">
            <SelectTrigger className="w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-mode">All Modes</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="guided">Guided</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2 ml-auto">
            <Filter className="size-4" />
            Date Range
          </Button>
        </div>

        <div className="flex gap-5">
          {/* Log table */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Document</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Dataset</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Mode</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Started</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Duration</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`cursor-pointer transition-colors ${
                      selectedLog?.id === log.id ? "bg-indigo-50/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {STATUS_ICON[log.status] ?? <Clock className="size-4 text-gray-400" />}
                        <span className="text-sm font-medium text-gray-800">{log.document}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs truncate">{log.dataset}</td>
                    <td className="px-5 py-3.5"><ModeBadge mode={log.mode} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={log.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{log.startedAt}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{log.duration}</td>
                    <td className="px-5 py-3.5">
                      <ChevronRight className="size-4 text-gray-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Log detail drawer */}
          {selectedLog && (
            <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-900 mb-1">{selectedLog.document}</p>
                <div className="flex items-center gap-2">
                  <ModeBadge mode={selectedLog.mode} />
                  <StatusBadge status={selectedLog.status} />
                </div>
              </div>
              <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                <div className="space-y-2">
                  {[
                    { label: "Dataset", value: selectedLog.dataset },
                    { label: "Started At", value: selectedLog.startedAt },
                    { label: "Duration", value: selectedLog.duration },
                    { label: "Mode", value: selectedLog.mode === "auto" ? "Auto Mode" : "Guided Mode" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{row.label}</span>
                      <span className="font-medium text-gray-800">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Event Log</p>
                  <div className="bg-gray-950 rounded-xl p-3 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
                    {[
                      { t: "info", m: "Ingestion started" },
                      { t: "info", m: "File type: PDF (187 pages)" },
                      { t: "info", m: "Extraction complete" },
                      { t: "info", m: "Normalization applied" },
                      { t: selectedLog.status === "failed" ? "error" : "info", m: selectedLog.status === "failed" ? "Error: Embedding API timeout" : "Chunking complete" },
                      { t: "info", m: selectedLog.status === "complete" ? "Indexed successfully" : "—" },
                    ].map((l, i) => (
                      <div key={i} className="flex gap-2">
                        <span className={l.t === "error" ? "text-red-400" : "text-emerald-400"}>[{l.t.toUpperCase()}]</span>
                        <span className="text-gray-300">{l.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedLog.status === "failed" && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs text-red-700 font-medium mb-1">Error Details</p>
                    <p className="text-xs text-red-600">Embedding API timeout after 30s. Retry or switch to Guided Mode for manual review.</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs">View Document</Button>
                  {selectedLog.status === "failed" && (
                    <Button size="sm" className="flex-1 text-xs">Retry</Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
