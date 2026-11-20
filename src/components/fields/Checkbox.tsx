import type { ReactNode } from "react";
import {
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps as AriaCheckboxFieldProps,
} from "react-aria-components";

import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";

import { cn } from "../../utils/tailwind";

/*
 * Os estados vêm dos data-* do botão do checkbox (grupo `group`). Cada regra tem guardas `not-*`
 * para não depender da ordem do CSS: inválido vence seleção e hover; desabilitado vence seleção.
 */
const indicatorStyles = [
  "grid size-4 shrink-0 place-items-center rounded-sm border border-border-strong bg-surface text-brand-foreground transition-colors motion-reduce:transition-none [&>svg]:size-3 [&>svg]:shrink-0",
  "group-data-hovered:not-group-data-selected:not-group-data-indeterminate:not-group-data-invalid:not-group-data-disabled:border-foreground",
  "group-data-selected:not-group-data-invalid:not-group-data-disabled:border-brand group-data-selected:not-group-data-disabled:bg-brand",
  "group-data-indeterminate:not-group-data-invalid:not-group-data-disabled:border-brand group-data-indeterminate:not-group-data-disabled:bg-brand",
  "group-data-invalid:not-group-data-disabled:border-danger",
  "group-data-disabled:border-border group-data-disabled:bg-surface-muted group-data-disabled:text-muted",
].join(" ");

const focusStyles = [
  "group-data-focus-visible:outline-1 group-data-focus-visible:outline-offset-1 group-data-focus-visible:outline-solid",
  "group-data-focus-visible:not-group-data-invalid:outline-brand",
  "group-data-focus-visible:group-data-invalid:outline-danger",
].join(" ");

export type CheckboxProps = Omit<AriaCheckboxFieldProps, "children" | "className"> & {
  /** Texto exibido ao lado do indicador. */
  children: ReactNode;
  /** Classes adicionais aplicadas ao botão do checkbox. */
  className?: string;
  /** Classes adicionais aplicadas ao texto. */
  labelClassName?: string;
  /**
   * `indicator` desenha o anel de foco no quadrado; `none` quando a linha que o contém já desenha o
   * foco.
   */
  focusRing?: "indicator" | "none";
};

/** Checkbox acessível: seleção, indeterminado, erro e desabilitado pelos data-* do React Aria. */
export function Checkbox({
  children,
  className,
  labelClassName,
  focusRing = "indicator",
  ...checkboxProps
}: CheckboxProps) {
  return (
    <CheckboxField {...checkboxProps} className="contents">
      <CheckboxButton
        className={cn(
          "group flex min-h-6 min-w-0 cursor-pointer items-center gap-2 text-body-strong text-muted transition-colors outline-none select-none data-disabled:cursor-not-allowed data-invalid:text-danger motion-reduce:transition-none max-md:min-h-touch",
          className,
        )}
      >
        {({ isIndeterminate, isSelected }) => (
          <>
            <span
              aria-hidden="true"
              className={cn(indicatorStyles, focusRing === "indicator" && focusStyles)}
            >
              {isIndeterminate && <MinusIcon aria-hidden="true" weight="bold" />}
              {isSelected && !isIndeterminate && <CheckIcon aria-hidden="true" weight="bold" />}
            </span>
            <span className={cn("min-w-0", labelClassName)}>{children}</span>
          </>
        )}
      </CheckboxButton>
    </CheckboxField>
  );
}
