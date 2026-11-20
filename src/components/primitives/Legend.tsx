import type { ReactNode } from "react";

import { cn } from "../../utils/tailwind";

export type LegendProps = {
  /** Texto da legenda do fieldset. */
  children: ReactNode;
  /** Classes adicionais aplicadas à legenda. */
  className?: string;
};

/** `<legend>` nativo com o papel de rótulo dos campos. O `fieldset` continua nativo. */
export function Legend({ children, className }: LegendProps) {
  return (
    <legend className={cn("p-0 text-body-strong text-foreground", className)}>{children}</legend>
  );
}
