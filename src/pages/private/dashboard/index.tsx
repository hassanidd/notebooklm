import { useNavigate } from "react-router";
import Topbar from "@/components/app/topbar";
import { StatusBadge, ModeBadge } from "@/components/app/status-badge";
import { DATASETS, ACTIVITY_LOGS } from "@/data/mock";
import {
  Database,
  FileText,
  Layers,
  Cpu,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STAT_CARDS = [
  { label: "Total Datasets", value: "24", delta: "+2 this week", icon: Database, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Total Documents", value: "2,700", delta: "+142 this week", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Total Chunks", value: "71,540", delta: "+8,430 indexed", icon: Layers, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Embeddings", value: "71,540", delta: "text-embedding-3-large", icon: Cpu, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const QUICK_STATS = [
  { label: "Docs Processed This Week", value: "142", icon: TrendingUp, status: "positive" },
  { label: "Pending Guided Approvals", value: "3", icon: Clock, status: "warning" },
  { label: "Failed Jobs", value: "2", icon: AlertTriangle, status: "danger" },
  { label: "Ready for Retrieval", value: "2,685", icon: CheckCircle2, status: "positive" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Dashboard" />

      <main className="flex-1 p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`size-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">{card.label}</p>
              <p className="text-xs text-gray-400 mt-1">{card.delta}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Quick stats + recent activity */}
          <div className="col-span-2 space-y-6">
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4">
              {QUICK_STATS.map((s) => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      s.status === "positive"
                        ? "bg-emerald-50"
                        : s.status === "warning"
                        ? "bg-amber-50"
                        : "bg-red-50"
                    }`}
                  >
                    <s.icon
                      className={`size-4 ${
                        s.status === "positive"
                          ? "text-emerald-600"
                          : s.status === "warning"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent ingestions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Recent Ingestions</h3>
                <button
                  onClick={() => navigate("/activity")}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  View all <ArrowRight className="size-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {ACTIVITY_LOGS.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{log.document}</p>
                      <p className="text-xs text-gray-500 truncate">{log.dataset}</p>
                    </div>
                    <ModeBadge mode={log.mode} />
                    <StatusBadge status={log.status} />
                    <span className="text-xs text-gray-400 w-24 text-right flex-shrink-0">{log.startedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: System status + top datasets */}
          <div className="space-y-4">
            {/* System status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="size-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Vector Store</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Embedding Model</span>
                  </div>
                  <span className="text-xs text-gray-500">3-large</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Ingestion Queue</span>
                  </div>
                  <span className="text-xs text-gray-500">2 running</span>
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Storage Used</span>
                    <span className="text-xs font-medium text-gray-700">68%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Top datasets */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Top Datasets</h3>
                <button
                  onClick={() => navigate("/datasets")}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  All <ArrowRight className="size-3" />
                </button>
              </div>
              <div className="space-y-3">
                {DATASETS.slice(0, 4).map((ds, i) => (
                  <div
                    key={ds.id}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate(`/datasets/${ds.id}`)}
                  >
                    <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                        {ds.name}
                      </p>
                      <p className="text-xs text-gray-400">{ds.documents.toLocaleString()} docs</p>
                    </div>
                    <StatusBadge status={ds.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white">
              <h3 className="text-sm font-semibold mb-1">Start Ingesting</h3>
              <p className="text-xs text-indigo-200 mb-4">Upload a file and choose Auto or Guided mode</p>
              <Button
                size="sm"
                variant="secondary"
                className="w-full text-indigo-700 font-semibold"
                onClick={() => navigate("/ingestions/new")}
              >
                New Ingestion
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
