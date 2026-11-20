import type { Ref } from "react";
import {
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
} from "react-aria-components";

import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { cn } from "../../utils/tailwind";
import { FieldButton } from "../primitives/field/FieldButton";
import { FieldError } from "../primitives/field/FieldError";
import { FieldGroup } from "../primitives/field/FieldGroup";
import { FieldHeader } from "../primitives/field/FieldHeader";
import { Input } from "../primitives/field/Input";
import { fieldRootClassName, isFieldInvalid, type FieldBaseProps } from "./field-props";

export type NumberFieldProps = FieldBaseProps &
  Omit<
    AriaNumberFieldProps,
    keyof FieldBaseProps | "children" | "className" | "validationBehavior" | "isInvalid"
  > & {
    /** Referência do input. Com React Hook Form, use `{...field}`. */
    ref?: Ref<HTMLInputElement>;
    placeholder?: string;
    /** Botões − e + dentro da caixa. O texto fica centralizado quando eles aparecem. */
    showSteppers?: boolean;
  };

/** Campo numérico com steppers opcionais. Sempre usa dígitos tabulares. */
export function NumberField({
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
  showSteppers = false,
  ref,
  ...numberFieldProps
}: NumberFieldProps) {
  return (
    <AriaNumberField
      {...numberFieldProps}
      className={cn(fieldRootClassName, className)}
      isDisabled={isDisabled}
      isInvalid={isFieldInvalid({ errorMessage, isInvalid })}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      validationBehavior="aria"
    >
      <FieldHeader description={description} isRequired={isRequired} label={label} />
      <FieldGroup size={size}>
        {showSteppers && (
          <FieldButton aria-label="Diminuir" className="mr-0 -ml-1" slot="decrement">
            <MinusIcon aria-hidden="true" />
          </FieldButton>
        )}
        <Input
          className={cn("tabular-nums", showSteppers && "text-center")}
          placeholder={placeholder}
          ref={ref}
        />
        {showSteppers && (
          <FieldButton aria-label="Aumentar" slot="increment">
            <PlusIcon aria-hidden="true" />
          </FieldButton>
        )}
      </FieldGroup>
      <FieldError reserveSpace={reserveErrorSpace}>{errorMessage}</FieldError>
    </AriaNumberField>
  );
}
