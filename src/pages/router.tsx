import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import LoadingPage from "@/pages/loading";
import { env } from "@/config/env";

const GlobalLayout = lazy(() => import("@/pages/layout"));
const PrivateLayout = lazy(() => import("@/pages/private/layout"));

/** Public pages */
const LoginPage = lazy(() => import("@/pages/public/auth"));
const NotFoundPage = lazy(() => import("@/pages/public/not-found"));
const ForbiddenPage = lazy(() => import("@/pages/public/403"));
const InternalServerErrorPage = lazy(() => import("@/pages/public/500"));
const ServiceUnavailablePage = lazy(() => import("@/pages/public/503"));
const DevPage = lazy(() => import("@/pages/public/dev"));

/** Private pages */
const HomePage = lazy(() => import("@/pages/private/home"));

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route element={<GlobalLayout />}>
            <Route element={<PrivateLayout />}>
              <Route path="/" element={<HomePage />} />
            </Route>
            {/* Public + misc */}
            <Route path="auth" element={<LoginPage />} />
            <Route path="403" element={<ForbiddenPage />} />
            <Route path="500" element={<InternalServerErrorPage />} />
            <Route path="503" element={<ServiceUnavailablePage />} />
            {env.VITE_NODE_ENV === "development" && (
              <Route path="dev" element={<DevPage />} />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
