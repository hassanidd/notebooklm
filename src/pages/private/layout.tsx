import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import Sidebar from "@/components/app/sidebar";
import { getStoredUser } from "@/core/auth";
import { useGlobalStore } from "@/core/global-store/index";
import LoadingPage from "@/pages/loading";

export default function PrivateLayout() {
  const location = useLocation();
  const user = useGlobalStore((state) => state.user);
  const setUser = useGlobalStore((state) => state.setUser);

  useEffect(() => {
    if (user === undefined) {
      setUser(getStoredUser());
    }
  }, [setUser, user]);

  if (user === undefined) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
