import { Suspense } from "react";

import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

import { Button } from "../../components/Button";
import { Link } from "../../components/Link";
import LoadingPage from "../../components/LoadingPage";
import LogoMark from "../../components/LogoMark";
import { RouteError, RoutePending } from "../../components/RouteStates";
import { clearCsrfToken } from "../../lib/csrf";
import { postLogout } from "../../services/auth/api";

export const Route = createFileRoute("/_private")({
  component: PrivateLayout,
  errorComponent: RouteError,
  pendingComponent: RoutePending,
});

function LogoutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: postLogout,
    // A limpeza local e o redirecionamento ocorrem mesmo se a API falhar.
    // O cache é limpo depois de sair da área privada para evitar refetch com a sessão encerrada.
    onSettled: async () => {
      clearCsrfToken();
      await navigate({ replace: true, to: "/login" });
      queryClient.clear();
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      leadingIcon={<SignOutIcon weight="bold" />}
      isPending={logoutMutation.isPending}
      onPress={() => logoutMutation.mutate()}
    >
      Sair
    </Button>
  );
}

function PrivateLayout() {
  return (
    <div className="min-h-svh overflow-x-clip bg-canvas text-foreground selection:bg-brand-soft selection:text-brand-hover">
      <div className="min-h-svh w-full">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-surface px-5 py-4 max-md:grid max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-3 max-md:p-4">
          <Link
            className="justify-start! whitespace-nowrap"
            linkVariant="compactBrand"
            preload="intent"
            to="/transactions"
            aria-label="Economize, ir para transações"
          >
            <LogoMark />
            <span>economize</span>
          </Link>
          <LogoutButton />
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
