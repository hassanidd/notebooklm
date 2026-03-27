import { useState } from "react";
import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { DATASETS, type Dataset } from "@/data/mock";
import {
  Search, Plus, LayoutGrid, List, FileText, Layers, Tag,
  Database, MoreHorizontal, ArrowUpRight, TrendingUp, CheckCircle2, Loader2,
  AlertCircle, Clock, X, ChevronDown, Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  active:   { dot: "bg-emerald-500",               badge: "bg-emerald-50 text-emerald-700 border-emerald-200",   icon: CheckCircle2, label: "Active"   },
  indexing: { dot: "bg-blue-500 animate-pulse",    badge: "bg-blue-50 text-blue-700 border-blue-200",             icon: Loader2,       label: "Indexing" },
  draft:    { dot: "bg-gray-400",                  badge: "bg-gray-100 text-gray-600 border-gray-200",            icon: Clock,         label: "Draft"    },
  error:    { dot: "bg-red-500",                   badge: "bg-red-50 text-red-700 border-red-200",                icon: AlertCircle,   label: "Error"    },
} as const;


export default function DatasetsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = DATASETS.filter(
    (d) =>
      (statusFilter === "all" || d.status === statusFilter) &&
      (d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase()) ||
        d.tags.some((t) => t.includes(search.toLowerCase())))
  );

  // Summary stats
  const totalDocs   = DATASETS.reduce((s, d) => s + d.documents, 0);
  const totalChunks = DATASETS.reduce((s, d) => s + d.chunks, 0);
  const activeCount = DATASETS.filter((d) => d.status === "active").length;
  const statusCounts = Object.fromEntries(
    ["all", "active", "indexing", "draft", "error"].map((s) => [
      s,
      s === "all" ? DATASETS.length : DATASETS.filter((d) => d.status === s).length,
    ])
  );

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-gray-50/60">
      <Topbar title="Datasets" />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto w-full px-8 py-7 space-y-6">

        {/* ── Summary strip ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Datasets", value: DATASETS.length,           icon: Database,    color: "text-indigo-600 bg-indigo-50",   border: "border-indigo-100" },
            { label: "Total Documents", value: totalDocs.toLocaleString(), icon: FileText,   color: "text-blue-600 bg-blue-50",       border: "border-blue-100"   },
            { label: "Total Chunks",    value: totalChunks.toLocaleString(), icon: Layers,   color: "text-violet-600 bg-violet-50",   border: "border-violet-100" },
            { label: "Active",          value: activeCount,               icon: TrendingUp,  color: "text-emerald-600 bg-emerald-50", border: "border-emerald-100" },
          ].map(({ label, value, icon: Icon, color, border }) => (
            <div key={label} className={cn("bg-white rounded-2xl border p-4 flex items-center gap-3.5 shadow-sm", border)}>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-52 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              placeholder="Search datasets, tags…"
              className="w-full h-10 pl-9 pr-9 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {["all", "active", "indexing", "draft"].map((s) => {
              const count = statusCounts[s] ?? 0;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-all",
                    statusFilter === s
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {s === "all" ? "All" : s}
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none",
                    statusFilter === s ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setView("grid")}
              className={cn("px-3 py-2 transition-colors", view === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50")}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("px-3 py-2 transition-colors", view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50")}
            >
              <List className="size-4" />
            </button>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="ml-auto flex items-center gap-2 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-200 transition-all"
          >
            <Plus className="size-4" />
            New Dataset
          </button>
        </div>

        {/* Count line */}
        <p className="text-xs text-gray-400 -mt-2">
          {filtered.length} dataset{filtered.length !== 1 ? "s" : ""}
          {search && <span> matching <span className="font-medium text-gray-600">"{search}"</span></span>}
        </p>

        {/* ── Grid view ─────────────────────────────────────────────────── */}
        {view === "grid" && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((ds) => (
              <DatasetCard key={ds.id} dataset={ds} onClick={() => navigate(`/datasets/${ds.id}`)} />
            ))}
            {filtered.length === 0 && <EmptyState search={search} onClear={() => { setSearch(""); setStatusFilter("all"); }} />}
          </div>
        )}

        {/* ── List view ─────────────────────────────────────────────────── */}
        {view === "list" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <EmptyState search={search} onClear={() => { setSearch(""); setStatusFilter("all"); }} />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Dataset</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Docs</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Chunks</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Tags</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((ds) => {
                    const sc = STATUS_CONFIG[ds.status] ?? STATUS_CONFIG.draft;
                    return (
                      <tr
                        key={ds.id}
                        onClick={() => navigate(`/datasets/${ds.id}`)}
                        className="hover:bg-indigo-50/20 cursor-pointer transition-colors group"
                      >
                        {/* Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                              <Database className="size-4 text-indigo-500" />
                              <span className={cn("absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white", sc.dot)} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{ds.name}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[220px]">{ds.description}</p>
                            </div>
                          </div>
                        </td>

                        {/* Docs */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-gray-800">{ds.documents.toLocaleString()}</span>
                        </td>

                        {/* Chunks */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-gray-800">{ds.chunks.toLocaleString()}</span>
                        </td>

                        {/* Tags */}
                        <td className="px-4 py-4">
                          <div className="flex gap-1.5 flex-wrap">
                            {ds.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="flex items-center gap-1 text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                <Tag className="size-2.5" />{tag}
                              </span>
                            ))}
                            {ds.tags.length > 2 && (
                              <span className="text-[11px] text-gray-400">+{ds.tags.length - 2}</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border", sc.badge)}>
                            {sc.label}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-4">
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
                          >
                            <MoreHorizontal className="size-4 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
              </div>
      </main>

      {/* ── Create dataset modal ─────────────────────────────────────── */}
      <CreateDatasetModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

// ── Dataset grid card ─────────────────────────────────────────────────────────
function DatasetCard({ dataset: ds, onClick }: { dataset: Dataset; onClick: () => void }) {
  const sc = STATUS_CONFIG[ds.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = sc.icon;
  const avgChunks = ds.documents > 0 ? Math.round(ds.chunks / ds.documents) : 0;

  const accentColor =
    ds.status === "active"   ? "bg-emerald-400" :
    ds.status === "indexing" ? "bg-blue-400" :
    ds.status === "error"    ? "bg-red-400" :
    "bg-gray-300";

  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.10)] hover:border-indigo-100 transition-all duration-200 cursor-pointer group overflow-hidden flex flex-col"
    >
      {/* Left accent strip */}
      <div className={cn("absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full", accentColor)} />

      <div className="p-5 pl-6 flex flex-col flex-1 gap-4">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* Gradient icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
              <Database className="size-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors leading-tight">
                {ds.name}
              </h3>
              <p className="text-[11px] text-gray-400 truncate mt-0.5 leading-snug">{ds.description}</p>
            </div>
          </div>

          {/* Status + menu */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border", sc.badge)}>
              <StatusIcon className="size-2.5" />{sc.label}
            </span>
            <button
              className="w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gray-100 -mx-1" />

        {/* ── Stats ── */}
        <div className="flex items-center">
          <div className="flex-1 text-center">
            <p className="text-[15px] font-bold text-gray-900 tabular-nums">{ds.documents.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">Docs</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="flex-1 text-center">
            <p className="text-[15px] font-bold text-gray-900 tabular-nums">{ds.chunks.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">Chunks</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="flex-1 text-center">
            <p className="text-[15px] font-bold text-gray-900 tabular-nums">{avgChunks}</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">Avg/Doc</p>
          </div>
        </div>

        {/* ── Footer: tags + arrow ── */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-1.5 flex-wrap">
            {ds.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[11px] font-medium text-gray-500 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 px-2 py-0.5 rounded-full transition-colors">
                #{tag}
              </span>
            ))}
            {ds.tags.length > 2 && (
              <span className="text-[11px] font-medium text-gray-400">+{ds.tags.length - 2}</span>
            )}
          </div>
          <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
            <ArrowUpRight className="size-3.5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
          </div>
        </div>

      </div>
    </div>
  );
}


// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="col-span-3 flex flex-col items-center py-20 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-1">
        <Database className="size-7 text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-600">No datasets found</p>
      <p className="text-xs text-gray-400 text-center max-w-xs">
        {search ? `Nothing matched "${search}". Try a different search or clear your filters.` : "Create your first dataset to get started."}
      </p>
      {search && (
        <button
          onClick={onClear}
          className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ── Create dataset modal ──────────────────────────────────────────────────────
function CreateDatasetModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [metaFields, setMetaFields] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" },
  ]);

  const addField = () => setMetaFields((f) => [...f, { key: "", value: "" }]);
  const removeField = (i: number) => setMetaFields((f) => f.filter((_, idx) => idx !== i));
  const updateField = (i: number, col: "key" | "value", val: string) =>
    setMetaFields((f) => f.map((row, idx) => idx === i ? { ...row, [col]: val } : row));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Database className="size-4 text-indigo-600" />
            </div>
            <div>
              <DialogTitle className="text-base">Create New Dataset</DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">Set up a new vector store for your documents</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dataset Name</Label>
            <Input placeholder="e.g. Product Documentation v3" className="rounded-xl h-10" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</Label>
            <Textarea
              placeholder="Describe the contents and purpose of this dataset…"
              rows={3}
              className="rounded-xl resize-none text-sm"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags</Label>
              <span className="text-[11px] text-gray-400">Comma separated</span>
            </div>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
              <Input placeholder="docs, api, sdk, public" className="rounded-xl h-10 pl-8" />
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Metadata</Label>
              <span className="text-[11px] text-gray-400">Optional key-value pairs</span>
            </div>

            <div className="space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_1fr_20px] gap-2 px-0.5">
                <span className="text-[11px] font-medium text-gray-400 pl-1">Key</span>
                <span className="text-[11px] font-medium text-gray-400 pl-1">Value</span>
              </div>

              {metaFields.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_28px] gap-2 items-center">
                  <Input
                    value={row.key}
                    onChange={(e) => updateField(i, "key", e.target.value)}
                    placeholder="e.g. owner"
                    className="rounded-lg h-9 text-sm"
                  />
                  <Input
                    value={row.value}
                    onChange={(e) => updateField(i, "value", e.target.value)}
                    placeholder="e.g. research-team"
                    className="rounded-lg h-9 text-sm"
                  />
                  <button
                    onClick={() => removeField(i)}
                    disabled={metaFields.length === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}

              <button
                onClick={addField}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors mt-1"
              >
                <Plus className="size-3.5" />
                Add field
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition-all"
          >
            Create Dataset
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
