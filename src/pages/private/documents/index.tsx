import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { DOCUMENTS } from "@/data/mock";
import { StatusBadge, ModeBadge } from "@/components/app/status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, Upload, MoreHorizontal } from "lucide-react";

export default function DocumentsPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Documents" />

      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input placeholder="Search documents..." className="pl-9" />
          </div>
          <Button size="sm" className="gap-2" onClick={() => navigate("/ingestions/new")}>
            <Upload className="size-4" />
            Upload File
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
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
              {DOCUMENTS.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/documents/${doc.id}`)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="size-4 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                        <p className="text-xs text-gray-500">{doc.fileType} · {doc.fileSize} · {doc.pages} pages</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{doc.datasetId}</td>
                  <td className="px-5 py-3.5"><ModeBadge mode={doc.mode} /></td>
                  <td className="px-5 py-3.5 text-sm text-gray-700">{doc.chunks}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={doc.status} /></td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{doc.uploadedAt}</td>
                  <td className="px-5 py-3.5">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreHorizontal className="size-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
