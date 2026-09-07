import { Suspense } from "react";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Link } from "../../components/Link";
import LoadingPage from "../../components/LoadingPage";
import LogoMark from "../../components/LogoMark";
import { RouteError, RoutePending } from "../../components/RouteStates";

export const Route = createFileRoute("/_public")({
  component: PublicLayout,
  errorComponent: RouteError,
  pendingComponent: RoutePending,
});

function PublicLayout() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const reducedMotion = useReducedMotion();
  const isLogin = pathname === "/login";
  const alternatePath = isLogin ? "/cadastro" : "/login";
  const linkTitle = isLogin ? "Criar conta" : "Entrar";

  return (
    <div className="app-background relative isolate grid min-h-svh bg-canvas px-5 py-6 text-foreground sm:py-8 md:px-8 lg:py-13">
      <div className="relative z-1 mx-auto flex w-full max-w-260 min-w-0 flex-col gap-10 sm:gap-12">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <Link
            className="gap-3 font-bold tracking-tight"
            to="/login"
            aria-label="Economize, ir para login"
          >
            <LogoMark />
            <span>economize</span>
          </Link>
          <Link
            className="gap-2 font-bold [&>span>svg]:size-4"
            to={alternatePath}
            trailingIcon={<ArrowRightIcon aria-hidden="true" weight="bold" />}
          >
            {linkTitle}
          </Link>
        </header>
        <main className="flex w-full min-w-0 flex-1 flex-col justify-center">
          <Suspense fallback={<LoadingPage />}>
            <AnimatePresence initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, x: reducedMotion ? 0 : isLogin ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: reducedMotion ? 0.12 : 0.25,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="w-full min-w-0"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
