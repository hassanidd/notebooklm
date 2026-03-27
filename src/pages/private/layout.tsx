import { Outlet } from "react-router";
import Sidebar from "@/components/app/sidebar";

export default function PrivateLayout() {
  return (
    <div className="flex h-screen bg-[#eeeef3] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden m-2 ml-0 rounded-2xl shadow-sm bg-white ring-1 ring-black/[0.04]">
        <Outlet />
      </div>
    </div>
  );
}
