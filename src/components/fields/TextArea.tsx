import type { Ref } from "react";
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { cn } from "../../utils/tailwind";
import { FieldError } from "../primitives/field/FieldError";
import { FieldHeader } from "../primitives/field/FieldHeader";
import { TextArea as TextAreaPrimitive } from "../primitives/field/TextArea";
import { fieldRootClassName, isFieldInvalid, type FieldBaseProps } from "./field-props";

export type TextAreaProps = Omit<FieldBaseProps, "size"> &
  Omit<
    AriaTextFieldProps,
    keyof FieldBaseProps | "children" | "className" | "validationBehavior" | "isInvalid"
  > & {
    /** Referência da área de texto. Com React Hook Form, use `{...field}`. */
    ref?: Ref<HTMLTextAreaElement>;
    placeholder?: string;
    /** Linhas visíveis iniciais; a altura mínima vem do campo. */
    rows?: number;
  };

/** Área de texto de várias linhas. Usa a mesma caixa e os mesmos estados dos campos de uma linha. */
export function TextArea({
  label,
  description,
  errorMessage,
  isInvalid,
  reserveErrorSpace = true,
  isRequired,
  isDisabled,
  isReadOnly,
  className,
  placeholder,
  rows = 3,
  ref,
  ...textFieldProps
}: TextAreaProps) {
  return (
    <AriaTextField
      {...textFieldProps}
      className={cn(fieldRootClassName, className)}
      isDisabled={isDisabled}
      isInvalid={isFieldInvalid({ errorMessage, isInvalid })}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      validationBehavior="aria"
    >
      <FieldHeader description={description} isRequired={isRequired} label={label} />
      <TextAreaPrimitive placeholder={placeholder} ref={ref} rows={rows} />
      <FieldError reserveSpace={reserveErrorSpace}>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
