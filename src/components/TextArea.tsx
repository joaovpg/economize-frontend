import { forwardRef, type Ref } from "react";
import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextAreaProps as AriaTextAreaProps,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { tv } from "tailwind-variants";

import { Description } from "./Description";
import { FieldError } from "./FieldError";
import { Label } from "./Label";

const control = tv({
  base: "min-h-28 min-w-0 resize-y rounded-xl border bg-[linear-gradient(180deg,rgb(255_255_255_/_0.7),#fffdf8)] px-3.5 py-3 text-body-small text-foreground caret-brand outline-none transition-[background-color,border-color,outline-color] placeholder:text-subtle motion-reduce:transition-none",
  variants: {
    invalid: {
      true: "border-danger focus:border-danger focus:outline-danger focus:outline-2 focus:outline-solid focus:outline-offset-0",
      false:
        "border-border hover:border-border-strong focus:border-brand focus:outline-brand focus:outline-2 focus:outline-solid focus:outline-offset-0",
    },
    disabled: {
      true: "cursor-not-allowed border-border bg-surface-muted text-subtle hover:border-border focus:border-border focus:outline-none",
      false: "",
    },
  },
});

/** Props da área de texto estilizada do Economize. */
export type TextAreaProps = Omit<AriaTextFieldProps, "children"> & {
  /** Texto exibido acima da área de texto. */
  label: string;
  /** Texto auxiliar opcional. */
  description?: string;
  /** Mensagem de validação. */
  errorMessage?: string;
  /** Mantém espaço reservado para a mensagem de validação. */
  reserveErrorSpace?: boolean;
  /** Texto exibido quando a área está vazia. */
  placeholder?: string;
  /** Referência encaminhada ao elemento textarea. */
  textAreaRef?: Ref<HTMLTextAreaElement>;
} & Pick<AriaTextAreaProps, "rows" | "maxLength">;

/** Área de texto acessível com a mesma anatomia visual dos campos do Economize. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  {
    label,
    description,
    errorMessage,
    reserveErrorSpace = true,
    placeholder,
    textAreaRef,
    rows = 4,
    maxLength,
    isDisabled = false,
    ...textFieldProps
  },
  ref,
) {
  const hasError = Boolean(errorMessage);
  const textareaRef = textAreaRef ?? ref;

  return (
    <AriaTextField
      {...textFieldProps}
      isDisabled={isDisabled}
      isInvalid={hasError}
      className="grid min-w-0 gap-1"
    >
      <Label isDisabled={isDisabled}>{label}</Label>
      {description && <Description isDisabled={isDisabled}>{description}</Description>}
      <AriaTextArea
        className={control({ disabled: isDisabled, invalid: hasError })}
        maxLength={maxLength}
        placeholder={placeholder}
        ref={textareaRef}
        rows={rows}
      />
      <div className={reserveErrorSpace ? "min-h-4 min-w-0" : "min-w-0"}>
        <FieldError>{errorMessage}</FieldError>
      </div>
    </AriaTextField>
  );
});
