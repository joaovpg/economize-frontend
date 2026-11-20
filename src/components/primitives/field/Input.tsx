import type { Ref } from "react";
import { Input as AriaInput, type InputProps as AriaInputProps } from "react-aria-components";

import { cn } from "../../../utils/tailwind";
import { fieldInputStyles } from "./fieldStyles";

export type InputProps = Omit<AriaInputProps, "className"> & {
  /** Classes adicionais aplicadas ao input, como `text-center` ou `tabular-nums`. */
  className?: string;
  /** Referência do elemento input, usada pelo React Hook Form para foco em erros. */
  ref?: Ref<HTMLInputElement>;
};

/** Input de texto dentro de um `FieldGroup`. Sem borda própria: a caixa desenha o contorno. */
export function Input({ className, ref, ...inputProps }: InputProps) {
  return <AriaInput {...inputProps} ref={ref} className={cn(fieldInputStyles, className)} />;
}
