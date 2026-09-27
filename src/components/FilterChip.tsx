import { type ComponentPropsWithoutRef } from "react";

import { twMerge } from "tailwind-merge";

/**
 * Chip compacto para exibir um filtro aplicado ou outro recorte contextual.
 *
 * Use este componente para valores informativos que podem aparecer em uma linha ou quebrar em
 * várias linhas. Ele não representa um controle interativo; ações de filtro devem usar `Button`.
 */
export type FilterChipProps = ComponentPropsWithoutRef<"span">;

export function FilterChip({ className, ...props }: FilterChipProps) {
  return (
    <span
      {...props}
      className={twMerge(
        "inline-flex items-center rounded-full border border-border bg-surface-overlay-strong px-2.5 py-1.5 text-caption text-muted",
        className,
      )}
      data-slot="filter-chip"
    />
  );
}
