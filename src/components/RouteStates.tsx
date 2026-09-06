import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";
import { type ErrorComponentProps } from "@tanstack/react-router";

import { Button } from "./Button";

export function RoutePending() {
  return (
    <div className="grid min-h-48 place-items-center bg-canvas px-5 py-8" aria-live="polite">
      <div className="grid justify-items-center gap-3 text-center">
        <span
          className="size-7 animate-spin rounded-full border-2 border-brand border-t-transparent motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p className="m-0 text-body-small text-muted">Carregando esta área...</p>
      </div>
    </div>
  );
}

export function RouteError({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

  return (
    <main className="grid min-h-80 place-items-center px-6 py-16 text-center">
      <div className="grid max-w-120 justify-items-center gap-3">
        <WarningCircleIcon className="text-danger" size={32} weight="fill" aria-hidden="true" />
        <h1 className="m-0 text-title-compact">Não foi possível carregar esta página</h1>
        <p className="m-0 text-body-small text-muted">{message}</p>
        <Button type="button" variant="secondary" size="sm" onPress={reset}>
          Tentar novamente
        </Button>
      </div>
    </main>
  );
}
