import type { ReactNode } from "react";
import { SwitchButton, SwitchField } from "react-aria-components";

import { cn } from "../../utils/tailwind";

export type SwitchProps = {
  /** Texto visível do switch. Sem ele, informe `aria-label`. */
  children?: ReactNode;
  /** Nome acessível quando o switch não tem texto visível. */
  "aria-label"?: string;
  /** Impede a alternância e aplica o estado desabilitado. */
  isDisabled?: boolean;
  /** Estado ligado (true) ou desligado (false). */
  isSelected: boolean;
  /** Recebe o próximo estado ao alternar. */
  onChange: (isSelected: boolean) => void;
  /** Classes adicionais aplicadas ao botão do switch. */
  className?: string;
};

/** Interruptor liga/desliga. O texto é opcional; o trilho e a bolinha seguem o estado do React Aria. */
export function Switch({
  children,
  "aria-label": ariaLabel,
  className,
  isDisabled = false,
  isSelected,
  onChange,
}: SwitchProps) {
  return (
    <SwitchField
      aria-label={ariaLabel}
      className="contents"
      isDisabled={isDisabled}
      isSelected={isSelected}
      onChange={onChange}
    >
      <SwitchButton
        className={cn(
          "group inline-flex min-h-8 cursor-pointer items-center gap-3 outline-none select-none data-disabled:cursor-not-allowed max-md:min-h-touch",
          className,
        )}
      >
        <span className="relative block h-5 w-8 shrink-0 rounded-full border-2 border-transparent bg-border-strong transition-colors group-data-disabled:opacity-disabled group-data-focus-visible:outline-1 group-data-focus-visible:outline-offset-1 group-data-focus-visible:outline-brand group-data-focus-visible:outline-solid group-data-selected:not-group-data-disabled:bg-brand motion-reduce:transition-none">
          <span className="block size-4 rounded-full border border-border bg-surface transition-transform duration-150 ease-out group-data-selected:translate-x-3 motion-reduce:transition-none" />
        </span>
        {children && (
          <span className="min-w-0 text-body-strong text-foreground group-data-disabled:text-muted">
            {children}
          </span>
        )}
      </SwitchButton>
    </SwitchField>
  );
}
