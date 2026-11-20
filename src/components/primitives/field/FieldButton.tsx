import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

import { cn } from "../../../utils/tailwind";

export type FieldButtonProps = Omit<AriaButtonProps, "className"> & {
  /** Classes adicionais, como o alinhamento de um stepper à esquerda. */
  className?: string;
};

/** Botão dentro da caixa do campo: olho da senha, calendário, stepper. Não tem borda própria. */
export function FieldButton({ className, ...buttonProps }: FieldButtonProps) {
  return (
    <AriaButton
      {...buttonProps}
      className={cn(
        "-mr-1 grid size-6 shrink-0 cursor-pointer place-items-center rounded-sm text-muted transition-colors outline-none data-disabled:cursor-not-allowed data-disabled:text-muted data-focus-visible:bg-surface-strong data-focus-visible:text-foreground data-hovered:text-foreground data-pressed:bg-surface-strong motion-reduce:transition-none [&>svg]:size-4",
        className,
      )}
    />
  );
}
