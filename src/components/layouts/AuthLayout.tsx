import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";

import LoadingPage from "../../pages/LoadingPage";
import { Link } from "../Link";

function LogoMark() {
  return (
    <span
      className="grid size-7.25 place-items-center rounded-[0.5625rem] bg-brand text-brand-foreground"
      aria-hidden="true"
    >
      <TrendUpIcon size={19} weight="bold" />
    </span>
  );
}

function AuthLayout() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/login";
  const alternatePath = isLogin ? "/cadastro" : "/login";
  const linkTitle = isLogin ? "Criar conta" : "Entrar";

  return (
    <div className="mx-auto flex min-h-svh flex-col place-items-center gap-10 bg-canvas px-4 py-6 md:max-w-5xl lg:max-w-7xl lg:py-12">
      <header className="flex w-full items-center justify-between">
        <Link href="/login" aria-label="Economize, ir para login">
          <LogoMark />
          <span>economize</span>
        </Link>
        <Link className="gap-1.5 p-0 text-caption" variant="link" href={alternatePath}>
          {linkTitle}
        </Link>
      </header>
      <main className="w-full flex-1 items-center">
        <Suspense fallback={<LoadingPage />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default AuthLayout;
