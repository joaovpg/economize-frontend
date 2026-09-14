import { forwardRef, type ReactNode } from "react";
import { Label as AriaLabel, type LabelProps as AriaLabelProps } from "react-aria-components";

import { tv } from "tailwind-variants";

const labelStyles = tv(
  {
    base: "text-label",
    variants: {
      disabled: {
        true: "text-subtle",
        false: "text-foreground",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
  { twMerge: false },
);

/**
 * Props da label estilizada do Economize.
 *
 * `isDisabled` controla somente a aparência da label. O estado funcional continua sendo
 * responsabilidade do campo React Aria que fornece o contexto para a label.
 */
export type LabelProps = Omit<AriaLabelProps, "children"> & {
  /** Conteúdo visível da label. */
  children: ReactNode;
  /** Aplica a aparência de label de um campo desabilitado. */
  isDisabled?: boolean;
};

/** Label React Aria com a tipografia e as cores dos campos do Economize. */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { children, className, isDisabled = false, ...labelProps },
  ref,
) {
  return (
    <AriaLabel
      {...labelProps}
      className={labelStyles({ className, disabled: isDisabled })}
      ref={ref}
    >
      {children}
    </AriaLabel>
  );
});
