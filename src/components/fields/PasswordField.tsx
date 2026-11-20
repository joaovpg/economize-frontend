import { useState } from "react";
import { TextField as AriaTextField } from "react-aria-components";

import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";

import { cn } from "../../utils/tailwind";
import { FieldButton } from "../primitives/field/FieldButton";
import { FieldError } from "../primitives/field/FieldError";
import { FieldGroup } from "../primitives/field/FieldGroup";
import { FieldHeader } from "../primitives/field/FieldHeader";
import { Input } from "../primitives/field/Input";
import { fieldRootClassName, isFieldInvalid } from "./field-props";

import type { TextFieldProps } from "./TextField";

export type PasswordFieldProps = Omit<TextFieldProps, "type" | "leadingIcon" | "trailingIcon">;

/** Campo de senha com botão para exibir ou ocultar o texto. */
export function PasswordField({
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
  ref,
  ...textFieldProps
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <AriaTextField
      {...textFieldProps}
      className={cn(fieldRootClassName, className)}
      isDisabled={isDisabled}
      isInvalid={isFieldInvalid({ errorMessage, isInvalid })}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      type={isVisible ? "text" : "password"}
      validationBehavior="aria"
    >
      <FieldHeader description={description} isRequired={isRequired} label={label} />
      <FieldGroup size={size}>
        <Input placeholder={placeholder} ref={ref} />
        <FieldButton
          aria-label={isVisible ? "Ocultar senha" : "Exibir senha"}
          aria-pressed={isVisible}
          isDisabled={isDisabled}
          onPress={() => setIsVisible((visible) => !visible)}
        >
          {isVisible ? <EyeIcon aria-hidden="true" /> : <EyeSlashIcon aria-hidden="true" />}
        </FieldButton>
      </FieldGroup>
      <FieldError reserveSpace={reserveErrorSpace}>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
