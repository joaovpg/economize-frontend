import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import LoadingPage from "./LoadingPage";

function AuthenticatedLayout() {
  return (
    <div className="min-h-svh bg-canvas px-5 py-8 text-foreground">
      <Suspense fallback={<LoadingPage />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

export default AuthenticatedLayout;
