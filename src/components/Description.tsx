import { forwardRef, type ReactNode } from "react";
import { Text as AriaText, type TextProps as AriaTextProps } from "react-aria-components";

import { tv } from "tailwind-variants";

const descriptionStyles = tv(
  {
    base: "-mt-1 text-caption",
    defaultVariants: {
      disabled: false,
    },
    variants: {
      disabled: {
        false: "text-muted",
        true: "text-subtle",
      },
    },
  },
  { twMerge: false },
);

/**
 * Props da descrição estilizada do Economize.
 *
 * A descrição sempre ocupa o slot semântico `description` do React Aria para que os campos associem
 * o texto auxiliar ao controle automaticamente.
 */
export type DescriptionProps = Omit<AriaTextProps, "children" | "slot"> & {
  /** Conteúdo auxiliar exibido para o campo. */
  children: ReactNode;
  /** Aplica a aparência de descrição de um campo desabilitado. */
  isDisabled?: boolean;
};

/** Texto auxiliar React Aria com a tipografia e as cores dos campos do Economize. */
export const Description = forwardRef<HTMLElement, DescriptionProps>(function Description(
  { children, className, isDisabled = false, ...descriptionProps },
  ref,
) {
  return (
    <AriaText
      {...descriptionProps}
      className={descriptionStyles({ className, disabled: isDisabled })}
      ref={ref}
      slot="description"
    >
      {children}
    </AriaText>
  );
});
