import type { ReactNode, Ref } from "react";
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { cn } from "../../utils/tailwind";
import { FieldError } from "../primitives/field/FieldError";
import { FieldGroup } from "../primitives/field/FieldGroup";
import { FieldHeader } from "../primitives/field/FieldHeader";
import { FieldIcon } from "../primitives/field/FieldIcon";
import { Input } from "../primitives/field/Input";
import { fieldRootClassName, isFieldInvalid, type FieldBaseProps } from "./field-props";

export type TextFieldProps = FieldBaseProps &
  Omit<
    AriaTextFieldProps,
    keyof FieldBaseProps | "children" | "className" | "validationBehavior" | "isInvalid"
  > & {
    /** Referência do input. Com React Hook Form, use `{...field}`, que já a inclui. */
    ref?: Ref<HTMLInputElement>;
    placeholder?: string;
    /** Ícone decorativo antes do texto. */
    leadingIcon?: ReactNode;
    /** Ícone decorativo depois do texto. */
    trailingIcon?: ReactNode;
  };

/**
 * Campo de texto de uma linha. `value`, `onChange(value)`, `onBlur`, `name` e `ref` seguem o
 * contrato do React Hook Form.
 */
export function TextField({
  label,
  description,
  errorMessage,
  isInvalid,
  reserveErrorSpace = true,
  isRequired,
  isDisabled,
  isReadOnly,
  size,
  className,
  placeholder,
  leadingIcon,
  trailingIcon,
  ref,
  ...textFieldProps
}: TextFieldProps) {
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
      <FieldGroup size={size}>
        {leadingIcon && <FieldIcon>{leadingIcon}</FieldIcon>}
        <Input placeholder={placeholder} ref={ref} />
        {trailingIcon && <FieldIcon>{trailingIcon}</FieldIcon>}
      </FieldGroup>
      <FieldError reserveSpace={reserveErrorSpace}>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
