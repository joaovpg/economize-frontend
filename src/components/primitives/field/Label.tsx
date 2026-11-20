import type { ReactNode } from "react";
import { Label as AriaLabel, type LabelProps as AriaLabelProps } from "react-aria-components";

import { cn } from "../../../utils/tailwind";

export type LabelProps = Omit<AriaLabelProps, "children" | "className"> & {
  /** Texto visível do rótulo. */
  children: ReactNode;
  /** Classes adicionais aplicadas ao rótulo. */
  className?: string;
  /** Mostra "(obrigatório)" à direita. O campo já anuncia aria-required; a marca é só visual. */
  isRequired?: boolean;
};

/** Rótulo do campo. Com `isRequired`, a marca "(obrigatório)" fica à direita e não é anunciada. */
export function Label({ children, className, isRequired = false, ...labelProps }: LabelProps) {
  return (
    <AriaLabel
      {...labelProps}
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-2 text-body-strong text-foreground",
        className,
      )}
    >
      <span className="min-w-0">{children}</span>
      {isRequired && (
        <span aria-hidden="true" className="ml-auto shrink-0 text-body text-muted">
          (obrigatório)
        </span>
      )}
    </AriaLabel>
  );
}
