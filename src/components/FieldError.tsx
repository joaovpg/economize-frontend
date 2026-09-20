import { forwardRef } from "react";
import {
  composeRenderProps,
  FieldError as AriaFieldError,
  type FieldErrorProps as AriaFieldErrorProps,
} from "react-aria-components";

import { tv } from "tailwind-variants";

const fieldErrorStyles = tv(
  {
    base: "block text-validation wrap-break-word text-danger",
  },
  { twMerge: false },
);

/** Props do erro de campo estilizado do Economize. */
export type FieldErrorProps = AriaFieldErrorProps;

/**
 * Mensagem de validação React Aria com a tipografia e a cor de erro dos campos do Economize.
 *
 * O componente preserva o comportamento do React Aria: ele só é renderizado quando o contexto do
 * campo está inválido e pode obter a mensagem automaticamente a partir desse contexto.
 */
export const FieldError = forwardRef<HTMLElement, FieldErrorProps>(function FieldError(
  { className, ...fieldErrorProps },
  ref,
) {
  return (
    <AriaFieldError
      {...fieldErrorProps}
      className={composeRenderProps(className, (userClassName) =>
        fieldErrorStyles({ className: userClassName }),
      )}
      ref={ref}
    />
  );
});
