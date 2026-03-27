import { useNavigate, useParams } from "react-router";
import Topbar from "@/components/app/topbar";
import { StatusBadge, VisibilityBadge, ModeBadge } from "@/components/app/status-badge";
import { DATASETS, DOCUMENTS, ACTIVITY_LOGS } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Upload, Tag, Globe, Lock, Users, FileText, Layers, ChevronRight,
  MoreHorizontal, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DatasetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dataset = DATASETS.find((d) => d.id === id) ?? DATASETS[0];
  const docs = DOCUMENTS.filter((d) => d.datasetId === dataset.id);
  const activity = ACTIVITY_LOGS.filter((a) => a.dataset === dataset.name);

  const visibilityIcon =
    dataset.visibility === "public" ? Globe :
    dataset.visibility === "private" ? Lock : Users;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar
        title={dataset.name}
        breadcrumbs={[{ label: "Datasets", path: "/datasets" }]}
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Dataset header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900">{dataset.name}</h1>
                <StatusBadge status={dataset.status} />
                <VisibilityBadge visibility={dataset.visibility} />
              </div>
              <p className="text-sm text-gray-500 mb-4 max-w-2xl">{dataset.description}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <FileText className="size-4 text-gray-400" />
                  <span><strong className="text-gray-800">{dataset.documents.toLocaleString()}</strong> documents</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="size-4 text-gray-400" />
                  <span><strong className="text-gray-800">{dataset.chunks.toLocaleString()}</strong> chunks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <visibilityIcon className="size-4 text-gray-400" />
                  <span>{dataset.owner}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {dataset.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    <Tag className="size-3" />
                    {tag}
                  </span>
                ))}
              </div>
              <Button
                size="sm"
                className="ml-4 gap-2"
                onClick={() => navigate("/ingestions/new")}
              >
                <Upload className="size-4" />
                Upload File
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="documents">
          <TabsList className="bg-white border border-gray-100 shadow-sm rounded-xl p-1">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="ingestions">Ingestions</TabsTrigger>
            <TabsTrigger value="retrieval">Retrieval</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Documents tab */}
          <TabsContent value="documents" className="mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input placeholder="Search documents..." className="pl-9 h-8 text-sm" />
                </div>
              </div>
              {docs.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">File</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Mode</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Chunks</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Uploaded</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {docs.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-gray-50/50 cursor-pointer"
                        onClick={() => navigate(`/documents/${doc.id}`)}
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                          <p className="text-xs text-gray-500">{doc.fileType} · {doc.fileSize} · {doc.pages} pages</p>
                        </td>
                        <td className="px-5 py-3.5"><ModeBadge mode={doc.mode} /></td>
                        <td className="px-5 py-3.5 text-sm text-gray-700">{doc.chunks}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={doc.status} /></td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">{doc.uploadedAt}</td>
                        <td className="px-5 py-3.5">
                          <button className="p-1 rounded hover:bg-gray-100">
                            <MoreHorizontal className="size-4 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  title="No documents yet"
                  description="Upload a file to start ingesting documents into this dataset."
                  action={
                    <Button size="sm" onClick={() => navigate("/ingestions/new")}>
                      <Upload className="size-4 mr-2" />Upload File
                    </Button>
                  }
                />
              )}
            </div>
          </TabsContent>

          {/* Ingestions tab */}
          <TabsContent value="ingestions" className="mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {activity.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Document</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Mode</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Started</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activity.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{a.document}</td>
                        <td className="px-5 py-3.5"><ModeBadge mode={a.mode} /></td>
                        <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">{a.startedAt}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">{a.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState title="No ingestions yet" description="Ingestion history will appear here." />
              )}
            </div>
          </TabsContent>

          {/* Retrieval tab */}
          <TabsContent value="retrieval" className="mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="max-w-2xl">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Test Retrieval</h3>
                <p className="text-xs text-gray-500 mb-4">Run a quick retrieval query against this dataset to verify your indexed content.</p>
                <div className="flex gap-2">
                  <Input placeholder="Enter your query…" className="flex-1" />
                  <Button>Search</Button>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-xl text-sm text-gray-500 text-center">
                  Results will appear here after you run a query
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Metadata tab */}
          <TabsContent value="metadata" className="mt-4">
            <MetadataTab dataset={dataset} />
          </TabsContent>

          {/* Permissions tab */}
          <TabsContent value="permissions" className="mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Access & Permissions</h3>
              <div className="space-y-3">
                {[
                  { label: "Owner", value: dataset.owner },
                  { label: "Visibility", value: dataset.visibility },
                  { label: "Allowed Groups", value: "engineering, data-team" },
                  { label: "Allowed Users", value: "alex.kim@acme.com, jane.doe@acme.com" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-medium text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm">Edit Permissions</Button>
            </div>
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings" className="mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Dataset Settings</h3>
              <div className="space-y-3">
                {[
                  { label: "Embedding Model", value: dataset.embeddingModel },
                  { label: "Default Chunk Size", value: "512 tokens" },
                  { label: "Default Overlap", value: "64 tokens" },
                  { label: "Default Ingestion Mode", value: "Auto" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-medium text-gray-800">{row.value}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm">Edit Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function MetadataTab({ dataset }: { dataset: typeof DATASETS[0] }) {
  const fields = [
    { key: "dataset_id", value: dataset.id },
    { key: "name", value: dataset.name },
    { key: "owner", value: dataset.owner },
    { key: "visibility", value: dataset.visibility },
    { key: "embedding_model", value: dataset.embeddingModel },
    { key: "created_at", value: dataset.createdAt },
    { key: "tags", value: dataset.tags.join(", ") },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Dataset Metadata</h3>
      <div className="space-y-0 rounded-xl border border-gray-100 overflow-hidden">
        {fields.map((f, i) => (
          <div key={f.key} className={`flex items-center gap-4 px-4 py-3 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}>
            <span className="text-xs font-mono text-indigo-600 w-40 flex-shrink-0">{f.key}</span>
            <span className="text-sm text-gray-700">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({
  title, description, action
}: {
  title: string; description: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
        <FileText className="size-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-4 text-center max-w-xs">{description}</p>
      {action}
    </div>
  );
}
