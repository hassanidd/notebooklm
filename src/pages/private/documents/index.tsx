import { useState } from "react";
import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { DOCUMENTS, DATASETS } from "@/data/mock";
import { StatusBadge, ModeBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import {
  Search, FileText, Upload, MoreHorizontal, Filter, Download,
  ArrowUpRight, FileIcon, Layers,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const FILE_TYPE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  PDF: { bg: "bg-red-50", text: "text-red-600", icon: "PDF" },
  DOCX: { bg: "bg-blue-50", text: "text-blue-600", icon: "DOC" },
  XLSX: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "XLS" },
  CSV: { bg: "bg-teal-50", text: "text-teal-600", icon: "CSV" },
  MD: { bg: "bg-gray-100", text: "text-gray-600", icon: "MD" },
  TXT: { bg: "bg-gray-100", text: "text-gray-500", icon: "TXT" },
};

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [datasetFilter, setDatasetFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  const filtered = DOCUMENTS.filter((d) => {
    const matchSearch = d.filename.toLowerCase().includes(search.toLowerCase());
    const matchDataset = datasetFilter === "all" || d.datasetId === datasetFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchMode = modeFilter === "all" || d.mode === modeFilter;
    return matchSearch && matchDataset && matchStatus && matchMode;
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-gray-50/40">
      <Topbar title="Documents" />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto w-full px-8 py-7 space-y-5">
        {/* Header row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              placeholder="Search documents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-gray-400"
            />
          </div>

          <Select value={datasetFilter} onValueChange={setDatasetFilter}>
            <SelectTrigger className="h-9 w-52 text-xs border-gray-200 rounded-xl">
              <SelectValue placeholder="All Datasets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Datasets</SelectItem>
              {DATASETS.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-36 text-xs border-gray-200 rounded-xl">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="embedding">Embedding</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
            </SelectContent>
          </Select>

          <Select value={modeFilter} onValueChange={setModeFilter}>
            <SelectTrigger className="h-9 w-32 text-xs border-gray-200 rounded-xl">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="guided">Guided</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="sm"
            className="gap-2 ml-auto h-9"
            onClick={() => navigate("/ingestions/new")}
          >
            <Upload className="size-4" />
            Upload File
          </Button>
        </div>

        {/* Count bar */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </p>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
            <Download className="size-3.5" />
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">File</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Dataset</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Mode</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Chunks</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Uploaded</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((doc) => {
                const ft = doc.fileType?.toUpperCase().replace(".", "") || "PDF";
                const typeStyle = FILE_TYPE_STYLES[ft] || { bg: "bg-gray-100", text: "text-gray-500", icon: ft };
                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[9px] font-bold tracking-tight",
                          typeStyle.bg, typeStyle.text
                        )}>
                          {typeStyle.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{doc.filename}</p>
                          <p className="text-xs text-gray-400">
                            {doc.fileSize} · {doc.pages} pages
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-medium text-gray-600 truncate max-w-32">{doc.datasetId}</p>
                    </td>
                    <td className="px-5 py-3.5"><ModeBadge mode={doc.mode} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Layers className="size-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{doc.chunks}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={doc.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{doc.uploadedAt}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="size-3.5 text-indigo-500" />
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal className="size-4 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <FileText className="size-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500">No documents found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or upload a new file</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
              </div>
      </main>
    </div>
  );
}
