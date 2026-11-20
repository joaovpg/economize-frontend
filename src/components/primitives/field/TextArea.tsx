import type { Ref } from "react";
import {
  TextArea as AriaTextArea,
  type TextAreaProps as AriaTextAreaProps,
} from "react-aria-components";

import { cn } from "../../../utils/tailwind";
import { fieldBoxStyles } from "./fieldStyles";

export type TextAreaProps = Omit<AriaTextAreaProps, "className"> & {
  /** Classes adicionais aplicadas à área de texto. */
  className?: string;
  /** Referência do elemento textarea, usada pelo React Hook Form para foco em erros. */
  ref?: Ref<HTMLTextAreaElement>;
};

/** Área de texto que é a própria caixa do campo; usa os mesmos estados de foco e erro. */
export function TextArea({ className, ref, ...textAreaProps }: TextAreaProps) {
  return (
    <AriaTextArea
      {...textAreaProps}
      ref={ref}
      className={cn(
        fieldBoxStyles({ focus: "field" }),
        "block min-h-textarea w-full resize-y px-3 py-2 text-body text-foreground caret-brand outline-none placeholder:text-muted data-disabled:text-muted max-md:text-md",
        className,
      )}
    />
  );
}
