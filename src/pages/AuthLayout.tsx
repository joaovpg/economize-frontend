import { Suspense } from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";

import { Link } from "../components/Link";
import LoadingPage from "./LoadingPage";

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
  const contentMinHeight = isLogin
    ? "min-h-[38rem] lg:min-h-[24rem]"
    : "min-h-[52rem] lg:min-h-[37rem]";

  return (
    <main className="grid min-h-svh place-items-center bg-canvas px-5 py-8 sm:px-8 lg:px-16 lg:py-12">
      <section className="w-full max-w-100 lg:max-w-5xl" aria-labelledby="auth-title">
        <header className="mb-16 flex items-center justify-between sm:mb-20 lg:mb-24">
          <Link
            className="inline-flex items-center gap-2 rounded-md text-md font-bold tracking-heading text-foreground data-hovered:text-foreground data-hovered:no-underline"
            href="/login"
            render={(props) => {
              if (!("href" in props)) {
                return <span {...props} />;
              }

              const { href, ...routerProps } = props;
              return <RouterLink {...routerProps} to={href} />;
            }}
            aria-label="Economize, ir para login"
          >
            <LogoMark />
            <span>economize</span>
          </Link>
          <Link
            className="gap-1.5 p-0 text-caption"
            variant="link"
            href={alternatePath}
            render={(props) => {
              if (!("href" in props)) {
                return <span {...props} />;
              }

              const { href, ...routerProps } = props;
              return <RouterLink {...routerProps} to={href} />;
            }}
            trailingIcon={<ArrowRightIcon aria-hidden="true" weight="bold" />}
          >
            {isLogin ? "Criar conta" : "Entrar"}
          </Link>
        </header>

        <Suspense fallback={<LoadingPage className={contentMinHeight} />}>
          <div
            className={`lg:grid lg:grid-cols-[1fr_20rem] lg:items-end lg:gap-24 ${contentMinHeight}`}
          >
            <Outlet />
          </div>
        </Suspense>
      </section>
    </main>
  );
}

export default AuthLayout;
