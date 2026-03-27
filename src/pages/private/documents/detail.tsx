import { useParams, useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { DOCUMENTS, CHUNKS } from "@/data/mock";
import { StatusBadge, ModeBadge, ContentTypeBadge } from "@/components/app/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileText, Layers, Calendar, User, RefreshCw, Edit3, Clock,
  ExternalLink, CheckCircle2, AlertCircle
} from "lucide-react";

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = DOCUMENTS.find((d) => d.id === id) ?? DOCUMENTS[0];
  const chunks = CHUNKS.filter((c) => c.documentId === doc.id);

  const timeline = [
    { time: "14:32:01", event: "Upload started", status: "complete" },
    { time: "14:32:06", event: "Extraction complete — 187 pages, 3 tables, 12 images", status: "complete" },
    { time: "14:32:07", event: "Normalization applied — 7 operations", status: "complete" },
    { time: "14:32:08", event: "Chunking complete — 231 chunks generated", status: "complete" },
    { time: "14:32:09", event: "Embed text built for all chunks", status: "complete" },
    { time: "14:32:10", event: "Metadata assigned to 231 chunks", status: "complete" },
    { time: "14:35:20", event: "Embedding started — text-embedding-3-large", status: "complete" },
    { time: "14:35:44", event: "All 231 vectors indexed to Pinecone", status: "complete" },
    { time: "14:35:44", event: "Ingestion complete — document ready for retrieval", status: "complete" },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar
        title={doc.filename}
        breadcrumbs={[{ label: "Documents", path: "/documents" }]}
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto w-full px-8 py-7 space-y-5">
        {/* Document header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <FileText className="size-6 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 mb-2">{doc.filename}</h1>
                <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500">
                  <StatusBadge status={doc.status} />
                  <ModeBadge mode={doc.mode} />
                  <span className="flex items-center gap-1.5">
                    <FileText className="size-3.5" />{doc.fileType} · {doc.fileSize}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="size-3.5" />{doc.pages} pages · {doc.chunks} chunks
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3.5" />{doc.uploadedAt}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="size-3.5" />{doc.uploadedBy}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-2">
                <RefreshCw className="size-4" />Re-run Embedding
              </Button>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/ingestions/guided")}>
                <Edit3 className="size-4" />Open in Guided Editor
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="bg-white border border-gray-100 shadow-sm rounded-xl p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chunks">Chunks ({doc.chunks})</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="retrieval">Retrieval Preview</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Pages", value: doc.pages, icon: FileText },
                { label: "Chunks", value: doc.chunks, icon: Layers },
                { label: "File Size", value: doc.fileSize, icon: FileText },
                { label: "Mode", value: doc.mode === "auto" ? "Auto" : "Guided", icon: Clock },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Content Types Detected</h3>
              <div className="flex gap-3 flex-wrap">
                {[
                  { type: "text", count: "183 chunks" },
                  { type: "table", count: "22 chunks" },
                  { type: "ocr", count: "18 chunks" },
                  { type: "image", count: "8 chunks" },
                ].map((ct) => (
                  <div key={ct.type} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                    <ContentTypeBadge type={ct.type as any} />
                    <span className="text-xs text-gray-500">{ct.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Extracted Content Preview</h3>
              <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed h-40 overflow-y-auto">
                <p className="font-semibold mb-2">1. Authentication Overview</p>
                <p>The API uses Bearer token authentication. All requests must include a valid JWT in the Authorization header with the format 'Bearer &lt;token&gt;'. Tokens expire after 3600 seconds and must be refreshed using the /auth/refresh endpoint.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chunks" className="mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">#</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Type</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Section</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Page</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Tokens</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Embed Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {chunks.map((chunk) => (
                    <tr key={chunk.id} className="hover:bg-gray-50/50 cursor-pointer">
                      <td className="px-5 py-3.5 text-sm text-gray-500">{chunk.index}</td>
                      <td className="px-5 py-3.5"><ContentTypeBadge type={chunk.contentType} /></td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{chunk.sectionTitle}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{chunk.sourcePage}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700">{chunk.tokenCount}</td>
                      <td className="px-5 py-3.5 text-xs text-indigo-600 font-medium capitalize">{chunk.embeddingMode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="metadata" className="mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                {[
                  { key: "document_id", value: doc.id },
                  { key: "dataset_id", value: doc.datasetId },
                  { key: "filename", value: doc.filename },
                  { key: "file_type", value: doc.fileType },
                  { key: "file_size", value: doc.fileSize },
                  { key: "pages", value: String(doc.pages) },
                  { key: "chunks", value: String(doc.chunks) },
                  { key: "ingestion_mode", value: doc.mode },
                  { key: "status", value: doc.status },
                  { key: "uploaded_at", value: doc.uploadedAt },
                  { key: "uploaded_by", value: doc.uploadedBy },
                ].map((f, i) => (
                  <div key={f.key} className={`flex items-center gap-4 px-4 py-2.5 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}>
                    <span className="text-xs font-mono text-indigo-600 w-40 flex-shrink-0">{f.key}</span>
                    <span className="text-sm text-gray-700">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="space-y-4">
                {[
                  { label: "Visibility", value: "team" },
                  { label: "Owner", value: doc.uploadedBy },
                  { label: "Allowed Groups", value: "engineering, data-team" },
                  { label: "Allowed Users", value: "alex.kim@acme.com" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-medium text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="retrieval" className="mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex gap-2 mb-4">
                <input
                  placeholder="Enter a query to test retrieval..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <Button size="sm">Search</Button>
              </div>
              <div className="p-8 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">
                Enter a query above to test retrieval against this document
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Ingestion History</h3>
              </div>
              <div className="p-5">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
                  <div className="space-y-4">
                    {timeline.map((t, i) => (
                      <div key={i} className="flex items-start gap-4 pl-10 relative">
                        <div className="absolute left-2.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-sm mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-700">{t.event}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{t.time}</p>
                        </div>
                        <CheckCircle2 className="size-4 text-emerald-400 mt-0.5 ml-auto flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
              </div>
      </main>
    </div>
  );
}
