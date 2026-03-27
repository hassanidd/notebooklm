import { useNavigate } from "react-router";
import { Search, Bell, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  title: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
}

export default function Topbar({ title, breadcrumbs = [] }: TopbarProps) {
  const navigate = useNavigate();
  return (
    <header className="h-14 flex items-center gap-4 px-6 border-b border-gray-100 bg-white flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <button
              onClick={() => crumb.path && navigate(crumb.path)}
              className={
                crumb.path
                  ? "text-sm text-gray-500 hover:text-gray-800 transition-colors"
                  : "text-sm text-gray-400 cursor-default"
              }
            >
              {crumb.label}
            </button>
            {i < breadcrumbs.length - 1 && (
              <ChevronRight className="size-3.5 text-gray-300" />
            )}
          </span>
        ))}
        {breadcrumbs.length > 0 && (
          <ChevronRight className="size-3.5 text-gray-300" />
        )}
        <h1 className="text-sm font-semibold text-gray-900 truncate">{title}</h1>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500 w-64 cursor-pointer hover:bg-gray-100 transition-colors">
        <Search className="size-3.5 text-gray-400" />
        <span>Search everything…</span>
        <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono">⌘K</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => navigate("/ingestions/new")}
        >
          <Plus className="size-3.5" />
          New Ingestion
        </Button>
      </div>
    </header>
  );
}
