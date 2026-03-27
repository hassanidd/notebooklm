import { useState } from "react";
import Topbar from "@/components/app/topbar";
import { CHUNKS } from "@/data/mock";
import { ContentTypeBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, ChevronRight, FileText, Layers } from "lucide-react";

const EXAMPLE_QUERIES = [
  "How does Bearer token authentication work?",
  "What are the rate limits for the API?",
  "How to install the SDK?",
];

export default function RetrievalTestPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof CHUNKS | null>(null);
  const [selectedResult, setSelectedResult] = useState<typeof CHUNKS[0] | null>(null);
  const [topK, setTopK] = useState([5]);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setResults(CHUNKS.filter((c) => c.score !== undefined).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)));
      setSelectedResult(null);
      setSearching(false);
    }, 600);
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Retrieval Test" />

      <main className="flex-1 p-6 space-y-5">
        {/* Search bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Test Retrieval</h2>
          <p className="text-xs text-gray-500 mb-4">Query your indexed content to inspect retrieval quality and chunk relevance.</p>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Enter your query…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={searching || !query.trim()}>
              {searching ? "Searching…" : "Search"}
            </Button>
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-4 flex-wrap">
            <Select defaultValue="all">
              <SelectTrigger className="h-8 w-48 text-xs">
                <SelectValue placeholder="Dataset filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All datasets</SelectItem>
                <SelectItem value="ds-001">Product Documentation v2</SelectItem>
                <SelectItem value="ds-002">Legal Contracts 2024</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="semantic">
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semantic">Semantic</SelectItem>
                <SelectItem value="keyword">Keyword</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-xs text-gray-500">Top-K</span>
              <div className="w-32">
                <Slider value={topK} onValueChange={setTopK} min={1} max={20} step={1} />
              </div>
              <span className="text-xs font-medium text-gray-700 w-4">{topK[0]}</span>
            </div>
          </div>

          {/* Example queries */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Try:</span>
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => { setQuery(q); }}
                className="text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {!results && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Search className="size-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">Enter a query to search your indexed content</p>
            <p className="text-xs text-gray-400 mt-1">Results will show chunk scores, snippets, and metadata</p>
          </div>
        )}

        {results && (
          <div className="flex gap-5" style={{ minHeight: 400 }}>
            {/* Results list */}
            <div className="flex-1 space-y-3">
              <p className="text-xs text-gray-500">{results.length} results for <strong>"{query}"</strong></p>
              {results.map((chunk, i) => (
                <div
                  key={chunk.id}
                  onClick={() => setSelectedResult(chunk)}
                  className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all ${
                    selectedResult?.id === chunk.id
                      ? "border-indigo-300 shadow-indigo-100"
                      : "border-gray-100 hover:border-indigo-100 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-gray-400 mt-0.5 w-4">{i + 1}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ContentTypeBadge type={chunk.contentType} />
                          <span className="text-xs text-gray-500">p.{chunk.sourcePage} · {chunk.tokenCount} tokens</span>
                        </div>
                        <p className="text-xs font-medium text-gray-700">{chunk.sectionTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-600">{chunk.score?.toFixed(4)}</p>
                        <p className="text-xs text-gray-400">score</p>
                      </div>
                      <ChevronRight className="size-4 text-gray-300" />
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed ml-7 line-clamp-2">{chunk.preview}</p>

                  <div className="flex items-center gap-2 mt-2 ml-7 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <FileText className="size-3" />
                      <span>api-reference-v2.4.pdf</span>
                    </div>
                    {chunk.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Preview panel */}
            {selectedResult && (
              <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                <div className="px-5 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <ContentTypeBadge type={selectedResult.contentType} />
                    <span className="text-xs text-gray-500">#{selectedResult.index}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedResult.sectionTitle}</p>
                </div>
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Full Chunk</p>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">{selectedResult.preview}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Embed Text</p>
                    <p className="text-xs text-indigo-700 leading-relaxed bg-indigo-50 rounded-xl p-3">{selectedResult.embedText}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Metadata</p>
                    <div className="space-y-1">
                      {[
                        { k: "page", v: String(selectedResult.sourcePage) },
                        { k: "tokens", v: String(selectedResult.tokenCount) },
                        { k: "language", v: selectedResult.language },
                        { k: "embed_mode", v: selectedResult.embeddingMode },
                      ].map((f) => (
                        <div key={f.k} className="flex justify-between text-xs">
                          <span className="text-gray-400 font-mono">{f.k}</span>
                          <span className="text-gray-700">{f.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
