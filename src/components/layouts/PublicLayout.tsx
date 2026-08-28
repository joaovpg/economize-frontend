import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";

import LoadingPage from "../../pages/LoadingPage";
import { Link } from "../Link";

function LogoMark() {
  return (
    <span
      className="grid size-7.75 place-items-center rounded-[10px] bg-brand text-brand-foreground shadow-[0_12px_28px_color-mix(in_oklch,var(--color-brand)_18%,transparent)]"
      aria-hidden="true"
    >
      <TrendUpIcon size={18} weight="bold" />
    </span>
  );
}

function PublicLayout() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/login";
  const alternatePath = isLogin ? "/cadastro" : "/login";
  const linkTitle = isLogin ? "Criar conta" : "Entrar";

  return (
    <div className="app-background relative isolate grid min-h-svh place-items-center overflow-hidden bg-canvas px-5 py-8 text-foreground md:px-8 lg:py-13">
      <div className="relative z-1 grid w-full max-w-260 gap-13.5 lg:gap-23">
        <header className="flex items-center justify-between gap-6">
          <Link
            className="gap-2.5 p-0 font-bold tracking-tight"
            href="/login"
            aria-label="Economize, ir para login"
          >
            <LogoMark />
            <span>economize</span>
          </Link>
          <Link
            className="gap-1.5 font-bold [&>span>svg]:size-4"
            variant="link"
            href={alternatePath}
            trailingIcon={<ArrowRightIcon aria-hidden="true" weight="bold" />}
          >
            {linkTitle}
          </Link>
        </header>
        <main className="w-full">
          <Suspense fallback={<LoadingPage />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default PublicLayout;
