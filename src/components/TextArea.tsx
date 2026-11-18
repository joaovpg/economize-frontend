import { forwardRef, type Ref } from "react";
import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
  type TextAreaProps as AriaTextAreaProps,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { tv } from "../utils/tailwind";
import { Description } from "./Description";
import { FieldError } from "./FieldError";
import { Label } from "./Label";

const control = tv({
  base: "min-h-textarea min-w-0 resize-y rounded-control border bg-surface px-3 py-3 text-body max-md:text-md text-foreground caret-brand outline-none transition-colors placeholder:text-muted motion-reduce:transition-none",
  variants: {
    disabled: {
      false: "",
      true: "cursor-not-allowed border-border bg-surface-muted text-muted hover:border-border focus:border-border focus:outline-none",
    },
    invalid: {
      false:
        "border-border hover:border-border-strong focus:border-brand focus:outline-brand focus:outline-2 focus:outline-solid focus:outline-offset-0",
      true: "border-danger focus:border-danger focus:outline-danger focus:outline-2 focus:outline-solid focus:outline-offset-0",
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
