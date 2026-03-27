import { useState } from "react";
import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { StatusBadge, VisibilityBadge } from "@/components/app/status-badge";
import { DATASETS, type Dataset } from "@/data/mock";
import { Button } from "@/components/ui/button";
import {
  Search, Plus, LayoutGrid, List, FileText, Layers, Tag, Calendar,
  Database, TrendingUp, ArrowUpRight, MoreHorizontal,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500",
  indexing: "bg-blue-500 animate-pulse",
  draft: "bg-gray-400",
  error: "bg-red-500",
};

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

  return (
    <div className="flex flex-col flex-1 overflow-auto bg-gray-50/40">
      <Topbar title="Datasets" />

      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              placeholder="Search datasets…"
              className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
            {["all", "active", "indexing", "draft"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-lg capitalize transition-all",
                  statusFilter === s
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "p-2 transition-colors",
                view === "grid" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50"
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-2 transition-colors",
                view === "list" ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:bg-gray-50"
              )}
            >
              <List className="size-4" />
            </button>
          </div>

          <Button className="gap-2 ml-auto" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New Dataset
          </Button>
        </div>

        {/* Count */}
        <p className="text-xs text-gray-400 mb-4">
          {filtered.length} dataset{filtered.length !== 1 ? "s" : ""}{search && ` matching "${search}"`}
        </p>

        {/* Grid view */}
        {view === "grid" && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((ds) => (
              <DatasetCard key={ds.id} dataset={ds} onClick={() => navigate(`/datasets/${ds.id}`)} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 py-20 text-center">
                <Database className="size-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No datasets found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search or filter</p>
              </div>
            )}
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Visibility</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Documents</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Chunks</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Created</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((ds) => (
                  <tr
                    key={ds.id}
                    className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/datasets/${ds.id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <Database className="size-4 text-indigo-500" />
                          <span className={cn(
                            "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white",
                            STATUS_COLORS[ds.status] || "bg-gray-400"
                          )} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{ds.name}</p>
                          <p className="text-xs text-gray-400 truncate max-w-xs">{ds.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><VisibilityBadge visibility={ds.visibility} /></td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-gray-700">{ds.documents.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-gray-700">{ds.chunks.toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={ds.status} /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{ds.createdAt}</td>
                    <td className="px-5 py-3.5">
                      <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all">
                        <MoreHorizontal className="size-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create dataset modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Dataset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Dataset Name</Label>
              <Input placeholder="e.g. Product Documentation v3" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Describe the contents and purpose of this dataset..." rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select defaultValue="team">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma separated)</Label>
              <Input placeholder="docs, api, public" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={() => setCreateOpen(false)}>Create Dataset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DatasetCard({ dataset: ds, onClick }: { dataset: Dataset; onClick: () => void }) {
  const fillPct = Math.round((ds.documents / 200) * 100);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group overflow-hidden"
    >
      {/* Top gradient accent */}
      <div className={cn(
        "h-1",
        ds.status === "active" ? "bg-gradient-to-r from-emerald-400 to-teal-400" :
        ds.status === "indexing" ? "bg-gradient-to-r from-blue-400 to-indigo-400" :
        ds.status === "error" ? "bg-gradient-to-r from-red-400 to-rose-400" :
        "bg-gray-200"
      )} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors flex items-center justify-center">
              <Database className="size-5 text-indigo-500" />
            </div>
            <span className={cn(
              "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white",
              STATUS_COLORS[ds.status] || "bg-gray-400"
            )} />
          </div>
          <div className="flex items-center gap-1.5">
            <VisibilityBadge visibility={ds.visibility} />
            <button
              className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {ds.name}
        </h3>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">{ds.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FileText className="size-3.5 text-gray-400" />
            <span className="font-medium text-gray-700">{ds.documents.toLocaleString()}</span>
            <span>docs</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Layers className="size-3.5 text-gray-400" />
            <span className="font-medium text-gray-700">{ds.chunks.toLocaleString()}</span>
            <span>chunks</span>
          </div>
        </div>

        {/* Fill progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Capacity</span>
            <span className="text-xs font-medium text-gray-600">{fillPct}%</span>
          </div>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                fillPct > 80 ? "bg-amber-400" : "bg-indigo-400"
              )}
              style={{ width: `${Math.min(fillPct, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {ds.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                <Tag className="size-2.5" />{tag}
              </span>
            ))}
          </div>
          <ArrowUpRight className="size-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}
