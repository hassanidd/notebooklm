import { useState } from "react";
import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { StatusBadge, VisibilityBadge } from "@/components/app/status-badge";
import { DATASETS, type Dataset } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, LayoutGrid, List, FileText, Layers, Tag, Calendar, Filter
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DatasetsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = DATASETS.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Datasets" />

      <main className="flex-1 p-6">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search datasets..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="size-4" />
            Filter
          </Button>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-2 ${view === "grid" ? "bg-indigo-50 text-indigo-600" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 ${view === "list" ? "bg-indigo-50 text-indigo-600" : "bg-white text-gray-500 hover:bg-gray-50"}`}
            >
              <List className="size-4" />
            </button>
          </div>
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New Dataset
          </Button>
        </div>

        {/* Grid view */}
        {view === "grid" && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((ds) => (
              <DatasetCard key={ds.id} dataset={ds} onClick={() => navigate(`/datasets/${ds.id}`)} />
            ))}
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Visibility</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Documents</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Chunks</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((ds) => (
                  <tr
                    key={ds.id}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/datasets/${ds.id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{ds.name}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{ds.description}</p>
                    </td>
                    <td className="px-5 py-3.5"><VisibilityBadge visibility={ds.visibility} /></td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{ds.documents.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{ds.chunks.toLocaleString()}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={ds.status} /></td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{ds.createdAt}</td>
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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <FileText className="size-5 text-indigo-500" />
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={ds.status} />
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
        {ds.name}
      </h3>
      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{ds.description}</p>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FileText className="size-3.5" />
          <span>{ds.documents.toLocaleString()} docs</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Layers className="size-3.5" />
          <span>{ds.chunks.toLocaleString()} chunks</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {ds.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              <Tag className="size-2.5" />
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="size-3" />
          {ds.createdAt}
        </div>
      </div>
    </div>
  );
}
