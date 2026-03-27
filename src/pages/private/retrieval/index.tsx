import { useState, useRef, useEffect } from "react";
import Topbar from "@/components/app/topbar";
import { CHUNKS, DATASETS } from "@/data/mock";
import { ContentTypeBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search, FileText, Zap, Database, Cpu, Clock,
  ChevronRight, X, SlidersHorizontal, Sparkles,
  BookOpen, Code2, Tag, ArrowUpRight, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLE_QUERIES = [
  "How does Bearer token authentication work?",
  "What are the rate limits for the API?",
  "How to install the SDK?",
  "Architecture diagram explanation",
];

const SEARCH_MODES = [
  { id: "semantic", label: "Semantic", icon: Sparkles, desc: "Vector similarity search" },
  { id: "hybrid", label: "Hybrid", icon: Zap, desc: "Semantic + keyword combined" },
  { id: "keyword", label: "Keyword", icon: BookOpen, desc: "BM25 keyword matching" },
];

type Chunk = typeof CHUNKS[0];

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 90 ? "bg-emerald-500" :
    pct >= 75 ? "bg-indigo-500" :
    pct >= 60 ? "bg-amber-500" : "bg-red-400";
  const textColor =
    pct >= 90 ? "text-emerald-700" :
    pct >= 75 ? "text-indigo-700" :
    pct >= 60 ? "text-amber-700" : "text-red-600";

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums ${textColor}`}>{score.toFixed(3)}</span>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const styles =
    pct >= 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
    pct >= 75 ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
    pct >= 60 ? "bg-amber-50 text-amber-700 border-amber-200" :
    "bg-red-50 text-red-700 border-red-200";
  return (
    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border tabular-nums", styles)}>
      {score.toFixed(3)}
    </span>
  );
}

export default function RetrievalTestPage() {
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [results, setResults] = useState<Chunk[] | null>(null);
  const [selectedResult, setSelectedResult] = useState<Chunk | null>(null);
  const [topK, setTopK] = useState([5]);
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState("semantic");
  const [dataset, setDataset] = useState("all");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [latency, setLatency] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setCommittedQuery(query);
    setSelectedResult(null);
    const start = Date.now();
    setTimeout(() => {
      const filtered = CHUNKS
        .filter((c) => c.score !== undefined)
        .filter((c) => contentTypeFilter === "all" || c.contentType === contentTypeFilter)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, topK[0]);
      setResults(filtered);
      setLatency(Date.now() - start);
      setSearching(false);
    }, 700);
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setCommittedQuery("");
    setSelectedResult(null);
    setLatency(null);
    inputRef.current?.focus();
  };

  const hasFilters = dataset !== "all" || contentTypeFilter !== "all";

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Retrieval Test" />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Search panel */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 space-y-4">
          {/* Search input */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors",
                query ? "text-indigo-500" : "text-gray-300"
              )} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask anything about your indexed documents…"
                className="w-full h-12 pl-12 pr-10 text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-indigo-300 focus:ring-3 focus:ring-indigo-50 transition-all"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="h-12 px-6 text-sm font-semibold gap-2 min-w-28"
            >
              {searching ? (
                <>
                  <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Searching
                </>
              ) : (
                <>
                  <Search className="size-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Mode + filter bar */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search mode pills */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {SEARCH_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSearchMode(m.id)}
                  title={m.desc}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    searchMode === m.id
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <m.icon className="size-3" />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Dataset */}
            <Select value={dataset} onValueChange={setDataset}>
              <SelectTrigger className="h-8 w-52 text-xs border-gray-200">
                <Database className="size-3 mr-1.5 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Datasets</SelectItem>
                {DATASETS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced filters toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-all",
                showFilters || hasFilters
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
            >
              <SlidersHorizontal className="size-3" />
              Filters
              {hasFilters && (
                <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>

            {/* Top-K */}
            <div className="flex items-center gap-2.5 ml-auto">
              <span className="text-xs text-gray-500 whitespace-nowrap">Top-K</span>
              <div className="w-28">
                <Slider value={topK} onValueChange={setTopK} min={1} max={20} step={1} />
              </div>
              <span className="text-xs font-semibold text-indigo-700 w-4 tabular-nums">{topK[0]}</span>
            </div>
          </div>

          {/* Advanced filter row */}
          {showFilters && (
            <div className="flex items-center gap-3 pt-1 border-t border-gray-50 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">Content type:</span>
              {["all", "text", "table", "ocr", "image", "mixed"].map((t) => (
                <button
                  key={t}
                  onClick={() => setContentTypeFilter(t)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border font-medium transition-all",
                    contentTypeFilter === t
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  {t === "all" ? "All types" : t.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Suggested queries */}
          {!results && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Suggested:</span>
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => { setQuery(q); setTimeout(handleSearch, 50); }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1"
                >
                  <Sparkles className="size-2.5" />
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Search metrics bar */}
          {results && latency !== null && (
            <div className="flex items-center gap-5 text-xs text-gray-500 pt-1 border-t border-gray-50">
              <span className="font-medium text-gray-700">
                {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
                <span className="text-indigo-700">"{committedQuery}"</span>
              </span>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3 text-gray-400" />
                <span>{latency}ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="size-3 text-gray-400" />
                <span>Pinecone · prod-knowledge-base</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="size-3 text-gray-400" />
                <span>text-embedding-3-large</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="size-3 text-gray-400 capitalize" />
                <span className="capitalize">{searchMode}</span>
              </div>
              <button
                onClick={clearSearch}
                className="ml-auto flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="size-3" />
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Empty state */}
          {!results && !searching && (
            <div className="flex-1 flex flex-col items-center justify-center p-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center mb-5">
                <Search className="size-9 text-indigo-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">Ready to search</h3>
              <p className="text-sm text-gray-400 text-center max-w-sm mb-8">
                Enter a query above to test retrieval across your indexed content. Results show chunk scores, snippets, and metadata.
              </p>

              <div className="grid grid-cols-3 gap-3 max-w-xl w-full">
                {[
                  { icon: Sparkles, label: "Semantic search", desc: "Find relevant content by meaning" },
                  { icon: Filter, label: "Metadata filters", desc: "Narrow results by type or dataset" },
                  { icon: Code2, label: "Inspect embed text", desc: "Compare raw vs embed representation" },
                ].map((f) => (
                  <div key={f.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-2">
                      <f.icon className="size-4 text-indigo-500" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mb-0.5">{f.label}</p>
                    <p className="text-xs text-gray-400">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {searching && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="size-5 text-indigo-400" />
                </div>
              </div>
              <p className="text-sm text-gray-500">Querying vector store…</p>
            </div>
          )}

          {/* Results */}
          {results && !searching && (
            <div className="flex flex-1 overflow-hidden">
              {/* Result list */}
              <div className={cn(
                "flex flex-col overflow-y-auto transition-all",
                selectedResult ? "w-[54%]" : "flex-1"
              )}>
                <div className="p-5 space-y-3">
                  {results.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                      <Search className="size-8 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-600">No results found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your query, filters, or increasing Top-K</p>
                    </div>
                  ) : (
                    results.map((chunk, i) => (
                      <ResultCard
                        key={chunk.id}
                        chunk={chunk}
                        rank={i + 1}
                        query={committedQuery}
                        selected={selectedResult?.id === chunk.id}
                        onClick={() =>
                          setSelectedResult(selectedResult?.id === chunk.id ? null : chunk)
                        }
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Preview panel */}
              {selectedResult && (
                <div className="w-[46%] flex-shrink-0 border-l border-gray-100 bg-white flex flex-col overflow-hidden">
                  <PreviewPanel chunk={selectedResult} onClose={() => setSelectedResult(null)} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({
  chunk, rank, query, selected, onClick
}: {
  chunk: Chunk; rank: number; query: string; selected: boolean; onClick: () => void;
}) {
  const score = chunk.score ?? 0;
  const pct = Math.round(score * 100);

  const highlightText = (text: string, q: string) => {
    if (!q.trim()) return text;
    const words = q.toLowerCase().split(" ").filter(Boolean);
    let result = text;
    words.forEach((word) => {
      const regex = new RegExp(`(${word})`, "gi");
      result = result.replace(regex, "[[HIGHLIGHT]]$1[[/HIGHLIGHT]]");
    });
    return result;
  };

  const highlighted = highlightText(chunk.preview, query);
  const parts = highlighted.split(/\[\[HIGHLIGHT\]\]|\[\[\/HIGHLIGHT\]\]/);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border shadow-sm cursor-pointer transition-all group",
        selected
          ? "border-indigo-300 shadow-indigo-100 ring-1 ring-indigo-200"
          : "border-gray-100 hover:border-indigo-200 hover:shadow-md"
      )}
    >
      {/* Score bar top accent */}
      <div
        className={cn(
          "h-0.5 rounded-t-2xl transition-all",
          pct >= 90 ? "bg-emerald-400" :
          pct >= 75 ? "bg-indigo-400" :
          pct >= 60 ? "bg-amber-400" : "bg-red-300"
        )}
        style={{ width: `${pct}%` }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Rank */}
            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center mt-0.5">
              {rank}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <ContentTypeBadge type={chunk.contentType} />
                <span className="text-xs text-gray-500">
                  p.{chunk.sourcePage} · {chunk.tokenCount} tokens
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  · {chunk.embeddingMode} embed
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                {chunk.sectionTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <ScoreBadge score={score} />
            <ChevronRight className={cn(
              "size-4 transition-all",
              selected ? "text-indigo-400 rotate-90" : "text-gray-200 group-hover:text-gray-400"
            )} />
          </div>
        </div>

        {/* Score bar */}
        <div className="flex items-center gap-2 mb-3 pl-9">
          <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                pct >= 90 ? "bg-emerald-400" :
                pct >= 75 ? "bg-indigo-400" :
                pct >= 60 ? "bg-amber-400" : "bg-red-300"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{pct}% relevance</span>
        </div>

        {/* Excerpt with highlight */}
        <p className="text-xs text-gray-600 leading-relaxed pl-9 line-clamp-3">
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <mark key={i} className="bg-indigo-100 text-indigo-800 rounded px-0.5 font-medium not-italic">
                {part}
              </mark>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-3 pl-9 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <FileText className="size-3" />
            <span>api-reference-v2.4.pdf</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {chunk.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                <Tag className="size-2.5" />{tag}
              </span>
            ))}
          </div>
          <button
            className="ml-auto flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); }}
          >
            Open chunk <ArrowUpRight className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({ chunk, onClose }: { chunk: Chunk; onClose: () => void }) {
  const score = chunk.score ?? 0;
  const pct = Math.round(score * 100);

  return (
    <>
      {/* Panel header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ContentTypeBadge type={chunk.contentType} />
            <ScoreBadge score={score} />
          </div>
          <p className="text-sm font-semibold text-gray-900">{chunk.sectionTitle}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Chunk #{chunk.index} · Page {chunk.sourcePage} · {chunk.tokenCount} tokens
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Score visualization */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">Relevance Score</span>
          <span className={cn(
            "text-xs font-bold",
            pct >= 90 ? "text-emerald-700" : pct >= 75 ? "text-indigo-700" : "text-amber-700"
          )}>
            {pct}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              pct >= 90 ? "bg-emerald-500" : pct >= 75 ? "bg-indigo-500" : "bg-amber-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="chunk" className="flex flex-col flex-1 overflow-hidden">
        <TabsList className="flex-shrink-0 border-b border-gray-100 rounded-none h-auto bg-transparent p-0 justify-start">
          {[
            { value: "chunk", label: "Chunk", icon: FileText },
            { value: "embed", label: "Embed Text", icon: Code2 },
            { value: "metadata", label: "Metadata", icon: Tag },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 px-4 py-3 text-xs font-medium text-gray-500 bg-transparent hover:text-gray-700"
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="chunk" className="m-0 p-5">
            <div className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed border border-gray-100">
              {chunk.preview}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <FileText className="size-3" />
              <span>api-reference-v2.4.pdf · Page {chunk.sourcePage}</span>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="m-0 p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Embed Representation</span>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium capitalize">
                {chunk.embeddingMode}
              </span>
            </div>
            <div className="text-xs text-indigo-800 bg-indigo-50 rounded-xl p-4 leading-relaxed border border-indigo-100">
              {chunk.embedText}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              This is the text that was encoded into a vector. It may differ from the raw chunk content.
            </p>
          </TabsContent>

          <TabsContent value="metadata" className="m-0 p-5">
            <div className="rounded-xl border border-gray-100 overflow-hidden mb-3">
              {[
                { k: "chunk_id", v: chunk.id },
                { k: "document_id", v: chunk.documentId },
                { k: "chunk_index", v: String(chunk.index) },
                { k: "content_type", v: chunk.contentType },
                { k: "source_page", v: String(chunk.sourcePage) },
                { k: "section_title", v: chunk.sectionTitle },
                { k: "token_count", v: String(chunk.tokenCount) },
                { k: "embedding_mode", v: chunk.embeddingMode },
                { k: "language", v: chunk.language },
                { k: "score", v: (chunk.score ?? 0).toFixed(6) },
              ].map((f, i) => (
                <div key={f.k} className={cn(
                  "flex items-center gap-4 px-4 py-2.5 text-xs",
                  i % 2 === 0 ? "bg-gray-50/60" : "bg-white"
                )}>
                  <span className="font-mono text-indigo-600 w-32 flex-shrink-0">{f.k}</span>
                  <span className="text-gray-700 truncate">{f.v}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {chunk.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Tag className="size-2.5" />{tag}
                  </span>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
