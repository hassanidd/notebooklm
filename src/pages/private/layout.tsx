import { Outlet } from "react-router";

export default function PrivateLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Outlet />
    </div>
  );
}
