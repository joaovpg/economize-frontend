import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { ChartLineUpIcon } from "@phosphor-icons/react/dist/csr/ChartLineUp";
import { ListBulletsIcon } from "@phosphor-icons/react/dist/csr/ListBullets";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";

import LoadingPage from "../../pages/LoadingPage";
import { Link } from "../Link";
import { privateLayoutStyles, privateNavLinkStyles } from "./privateLayoutStyles";

const navigation = [
  { href: "/summary", label: "Resumo", icon: ChartLineUpIcon },
  { href: "/transactions", label: "Transações", icon: ListBulletsIcon },
  { href: "/profile", label: "Perfil", icon: UserCircleIcon },
];

function LogoMark() {
  return (
    <span className={privateLayoutStyles.brandMark} aria-hidden="true">
      <TrendUpIcon size={18} weight="bold" />
    </span>
  );
}

function PrivateLayout() {
  const { pathname } = useLocation();

  const isActive = (href: string) =>
    href === "/summary"
      ? pathname === "/summary" || pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className={`app-background ${privateLayoutStyles.app}`}>
      <div className={privateLayoutStyles.shell}>
        <header className={privateLayoutStyles.topbar}>
          <Link
            className={privateLayoutStyles.brand}
            href="/summary"
            aria-label="Economize, ir para resumo"
          >
            <LogoMark />
            <span>economize</span>
          </Link>

          <nav className={privateLayoutStyles.nav} aria-label="Navegação principal">
            {navigation.map(({ href, icon: Icon, label }) => {
              const active = isActive(href);

              return (
                <Link
                  key={href}
                  className={privateNavLinkStyles({ active })}
                  href={href}
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
            href="/profile"
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

export default PrivateLayout;
