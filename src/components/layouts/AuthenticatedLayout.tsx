import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import LoadingPage from "../../pages/LoadingPage";

function AuthenticatedLayout() {
  return (
    <div className="app-background min-h-svh px-5 py-8 text-foreground">
      <Suspense fallback={<LoadingPage />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

export default AuthenticatedLayout;
