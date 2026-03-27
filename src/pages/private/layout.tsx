import { Outlet } from "react-router";
import Sidebar from "@/components/app/sidebar";

export default function PrivateLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
