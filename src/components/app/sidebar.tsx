import { NavLink, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Database,
  FileText,
  Zap,
  Search,
  Cpu,
  Box,
  Activity,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Datasets", icon: Database, path: "/datasets" },
  { label: "Documents", icon: FileText, path: "/documents" },
  { label: "Ingestions", icon: Zap, path: "/ingestions/new" },
  { label: "Retrieval Test", icon: Search, path: "/retrieval" },
  { label: "Models", icon: Cpu, path: "/settings?tab=models" },
  { label: "Vector Store", icon: Box, path: "/settings?tab=vector-store" },
  { label: "Activity", icon: Activity, path: "/activity" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path.split("?")[0]);
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 flex-shrink-0">
      {/* Workspace switcher */}
      <div className="px-4 py-4 border-b border-gray-100">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="size-4 text-white" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">Acme Corp</p>
            <p className="text-xs text-gray-500 truncate">Enterprise</p>
          </div>
          <ChevronDown className="size-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "size-4 flex-shrink-0",
                  active ? "text-indigo-600" : "text-gray-400"
                )}
              />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom user area */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AK
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Alex Kim</p>
            <p className="text-xs text-gray-500 truncate">alex.kim@acme.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
