import { Suspense } from "react";

import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";

import { Link } from "../../components/Link";
import LoadingPage from "../../components/LoadingPage";
import LogoMark from "../../components/LogoMark";
import { RouteError, RoutePending } from "../../components/RouteStates";

export const Route = createFileRoute("/_private")({
  component: PrivateLayout,
  errorComponent: RouteError,
  pendingComponent: RoutePending,
});

const navigation = [
  { label: "Resumo", to: "/summary" },
  { label: "Transações", to: "/transactions" },
  { label: "Contas", to: "/accounts" },
] as const;

function PrivateLayout() {
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === "/summary" ? pathname === "/summary" : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div className="app-background relative isolate min-h-svh overflow-hidden text-foreground selection:bg-brand-soft selection:text-brand-hover">
      <div className="relative z-1 min-h-svh w-full">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-canvas-panel px-5 py-4.5 backdrop-blur-header max-[48rem]:grid max-[48rem]:grid-cols-[minmax(0,1fr)_auto] max-[48rem]:gap-3.5 max-[48rem]:p-4">
          <Link
            className="justify-start! whitespace-nowrap"
            linkVariant="compactBrand"
            preload="intent"
            to="/summary"
            aria-label="Economize, ir para resumo"
          >
            <LogoMark />
            <span>economize</span>
          </Link>

          <nav
            className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface-overlay p-1 max-[48rem]:col-span-2 max-[48rem]:w-full max-[48rem]:justify-start max-[48rem]:overflow-x-auto"
            aria-label="Navegação principal"
          >
            {navigation.map(({ to, label }) => {
              const active = isActive(to);

              return (
                <Link
                  key={to}
                  active={active}
                  linkVariant="navigation"
                  preload="intent"
                  to={to}
                  aria-current={active ? "page" : undefined}
                  variant="link"
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <Link className="whitespace-nowrap max-[60rem]:hidden" preload="intent" to="/profile">
            Minha conta
          </Link>
        </header>

        <main className="min-w-0">
          <Suspense fallback={<LoadingPage className="min-h-[calc(100svh-5.5rem)]" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
