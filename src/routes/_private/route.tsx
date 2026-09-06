import { Suspense } from "react";

import { ChartLineUpIcon } from "@phosphor-icons/react/dist/csr/ChartLineUp";
import { ListBulletsIcon } from "@phosphor-icons/react/dist/csr/ListBullets";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { tv } from "tailwind-variants";

import { Link } from "../../components/Link";
import LoadingPage from "../../components/LoadingPage";
import { RouteError, RoutePending } from "../../components/RouteStates";

export const Route = createFileRoute("/_private")({
  component: PrivateLayout,
  errorComponent: RouteError,
  pendingComponent: RoutePending,
});

export const privateLayoutStyles = {
  app: "relative isolate min-h-svh overflow-hidden bg-canvas text-foreground selection:bg-brand-soft selection:text-brand-hover",
  shell:
    "relative z-[1] mx-auto min-h-svh w-full max-w-[77.5rem] border-x border-[color-mix(in_oklch,var(--color-border)_72%,transparent)] bg-[color-mix(in_oklch,var(--color-canvas)_34%,transparent)] max-[48rem]:border-x-0",
  topbar:
    "flex items-center justify-between gap-4.5 border-b border-border bg-[color-mix(in_oklch,var(--color-canvas)_76%,transparent)] px-6 py-4.5 backdrop-blur-[14px] max-[60rem]:px-5 max-[48rem]:grid max-[48rem]:grid-cols-[minmax(0,1fr)_auto] max-[48rem]:gap-3.5 max-[48rem]:p-4",
  brand:
    "gap-2.5 !text-foreground text-title-compact font-bold tracking-[-0.025em] no-underline whitespace-nowrap",
  brandMark:
    "grid size-7.75 place-items-center rounded-[10px] bg-brand text-brand-foreground shadow-[0_12px_28px_color-mix(in_oklch,var(--color-brand)_18%,transparent)]",
  nav: "flex items-center justify-center gap-1.5 rounded-full border border-border bg-[color-mix(in_oklch,var(--color-surface)_58%,transparent)] p-1 max-[48rem]:col-span-2 max-[48rem]:w-full max-[48rem]:justify-start max-[48rem]:overflow-x-auto",
  content: "min-w-0",
  account:
    "gap-2 !text-brand text-button no-underline whitespace-nowrap data-hovered:!text-brand-hover data-hovered:underline data-hovered:underline-offset-4 max-[60rem]:hidden",
} as const;

export const privateNavLinkStyles = tv({
  base: "!h-11 !min-h-11 !rounded-full !px-3 text-button !text-muted no-underline data-hovered:!text-foreground data-hovered:no-underline max-[28rem]:!px-2.5 max-[28rem]:[&>span>svg]:hidden",
  variants: {
    active: {
      false: "",
      true: "!bg-brand-soft !text-brand-hover shadow-[inset_0_1px_0_color-mix(in_oklch,var(--color-surface)_82%,transparent)]",
    },
  },
});

const navigation = [
  { to: "/summary", label: "Resumo", icon: ChartLineUpIcon },
  { to: "/transactions", label: "Transações", icon: ListBulletsIcon },
  { to: "/profile", label: "Perfil", icon: UserCircleIcon },
] as const;

function LogoMark() {
  return (
    <span className={privateLayoutStyles.brandMark} aria-hidden="true">
      <TrendUpIcon size={18} weight="bold" />
    </span>
  );
}

function PrivateLayout() {
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === "/summary"
      ? pathname === "/summary" || pathname === "/dashboard"
      : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <div className={`app-background ${privateLayoutStyles.app}`}>
      <div className={privateLayoutStyles.shell}>
        <header className={privateLayoutStyles.topbar}>
          <Link
            className={privateLayoutStyles.brand}
            preload="intent"
            to="/summary"
            aria-label="Economize, ir para resumo"
          >
            <LogoMark />
            <span>economize</span>
          </Link>

          <nav className={privateLayoutStyles.nav} aria-label="Navegação principal">
            {navigation.map(({ to, icon: Icon, label }) => {
              const active = isActive(to);

              return (
                <Link
                  key={to}
                  className={privateNavLinkStyles({ active })}
                  preload="intent"
                  to={to}
                  aria-current={active ? "page" : undefined}
                  variant="link"
                  leadingIcon={<Icon weight={active ? "fill" : "regular"} />}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <Link
            className={privateLayoutStyles.account}
            preload="intent"
            to="/profile"
            leadingIcon={<UserCircleIcon aria-hidden="true" />}
          >
            Minha conta
          </Link>
        </header>

        <div className={privateLayoutStyles.content}>
          <Suspense fallback={<LoadingPage className="min-h-[calc(100svh-5.5rem)]" />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
