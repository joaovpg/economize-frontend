import type { ReactNode } from "react";

/**
 * Ícone decorativo dentro da caixa do campo. Não é anunciado: o nome vem do rótulo ou do
 * aria-label.
 */
export function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-4 shrink-0 place-items-center text-muted [&>svg]:size-full"
    >
      {children}
    </span>
  );
}
