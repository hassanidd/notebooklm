import { useState } from "react";
import Topbar from "@/components/app/topbar";
import { CHUNKS } from "@/data/mock";
import { ContentTypeBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit3, RefreshCw, Trash2, Network, Filter } from "lucide-react";

export default function ChunkExplorerPage() {
  const [selectedChunk, setSelectedChunk] = useState(CHUNKS[0]);
  const [activeTab, setActiveTab] = useState<"raw" | "embed" | "metadata">("raw");

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Chunk Explorer" />

      <main className="flex-1 p-6 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input placeholder="Search chunks…" className="pl-9 w-56" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-36 text-xs">
              <SelectValue placeholder="Content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="table">Table</SelectItem>
              <SelectItem value="ocr">OCR</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-36 text-xs">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-36 text-xs">
              <SelectValue placeholder="Embed mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="raw">Raw</SelectItem>
              <SelectItem value="normalized">Normalized</SelectItem>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2 ml-auto">
            <Filter className="size-4" />
            More Filters
          </Button>
        </div>

        <div className="flex gap-5" style={{ minHeight: 560 }}>
          {/* Chunk list */}
          <div className="w-96 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">{CHUNKS.length} Chunks</span>
              <span className="text-xs text-gray-400">api-reference-v2.4.pdf</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {CHUNKS.map((chunk) => (
                <div
                  key={chunk.id}
                  onClick={() => setSelectedChunk(chunk)}
                  className={`px-4 py-3.5 cursor-pointer transition-colors ${
                    selectedChunk.id === chunk.id ? "bg-indigo-50/60 border-l-2 border-indigo-500" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <ContentTypeBadge type={chunk.contentType} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-700">#{chunk.index}</span>
                        <span className="text-xs text-gray-400">p.{chunk.sourcePage}</span>
                        <span className="text-xs text-gray-400 ml-auto">{chunk.tokenCount} tok</span>
                      </div>
                      <p className="text-xs font-medium text-gray-600 mb-0.5">{chunk.sectionTitle}</p>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{chunk.preview}</p>
                    </div>
                  </div>
                  {chunk.score !== undefined && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${chunk.score * 100}%` }} />
                      </div>
                      <span className="text-xs font-mono text-indigo-600">{chunk.score.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            {selectedChunk && (
              <>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <ContentTypeBadge type={selectedChunk.contentType} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedChunk.sectionTitle}</p>
                      <p className="text-xs text-gray-500">Chunk #{selectedChunk.index} · Page {selectedChunk.sourcePage} · {selectedChunk.tokenCount} tokens</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {[
                      { icon: Edit3, label: "Edit chunk" },
                      { icon: RefreshCw, label: "Re-embed" },
                      { icon: Network, label: "Inspect neighbors" },
                      { icon: Trash2, label: "Delete chunk" },
                    ].map((action) => (
                      <button
                        key={action.label}
                        title={action.label}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <action.icon className="size-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-50">
                  {(["raw", "embed", "metadata"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? "text-indigo-600 border-b-2 border-indigo-500"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab === "raw" ? "Raw Text" : tab === "embed" ? "Embed Text" : "Metadata"}
                    </button>
                  ))}
                  <div className="ml-auto px-5 py-3 text-xs text-gray-400 flex items-center gap-2">
                    Embedding mode:
                    <span className="text-indigo-600 font-medium capitalize">{selectedChunk.embeddingMode}</span>
                  </div>
                </div>

                <div className="flex-1 p-5 overflow-auto">
                  {activeTab === "raw" && (
                    <div className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed h-full overflow-y-auto">
                      {selectedChunk.preview}
                    </div>
                  )}
                  {activeTab === "embed" && (
                    <div className="text-sm text-indigo-700 bg-indigo-50 rounded-xl p-4 leading-relaxed h-full overflow-y-auto">
                      {selectedChunk.embedText}
                    </div>
                  )}
                  {activeTab === "metadata" && (
                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                      {[
                        { key: "chunk_id", value: selectedChunk.id },
                        { key: "document_id", value: selectedChunk.documentId },
                        { key: "chunk_index", value: String(selectedChunk.index) },
                        { key: "content_type", value: selectedChunk.contentType },
                        { key: "source_page", value: String(selectedChunk.sourcePage) },
                        { key: "section_title", value: selectedChunk.sectionTitle },
                        { key: "token_count", value: String(selectedChunk.tokenCount) },
                        { key: "embedding_mode", value: selectedChunk.embeddingMode },
                        { key: "language", value: selectedChunk.language },
                        { key: "tags", value: selectedChunk.tags.join(", ") },
                      ].map((f, i) => (
                        <div key={f.key} className={`flex items-center gap-4 px-4 py-2.5 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}>
                          <span className="text-xs font-mono text-indigo-600 w-40 flex-shrink-0">{f.key}</span>
                          <span className="text-sm text-gray-700">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="px-5 py-3 border-t border-gray-50 flex items-center gap-2 flex-wrap">
                  {selectedChunk.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
