import { type ClipboardEvent, type ReactNode, type Ref } from "react";
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import { NumberFormatBase, type NumberFormatBaseProps } from "react-number-format";

import { cn } from "../../utils/tailwind";
import { FieldError } from "../primitives/field/FieldError";
import { FieldGroup } from "../primitives/field/FieldGroup";
import { FieldHeader } from "../primitives/field/FieldHeader";
import { FieldIcon } from "../primitives/field/FieldIcon";
import { Input } from "../primitives/field/Input";
import { fieldRootClassName, isFieldInvalid, type FieldBaseProps } from "./field-props";

function normalizeCents(digits: string) {
  return digits.replace(/^0+(?=\d)/, "");
}

function valueToCents(value: string) {
  if (value === "") return "";
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    throw new RangeError(
      'CurrencyField: value deve ser "" ou uma string decimal não negativa com até duas casas, como "1234.56".',
    );
  }
  const [integer = "", fraction = ""] = value.split(".");
  return normalizeCents(integer + fraction.padEnd(2, "0"));
}

function centsToValue(digits: string) {
  if (!digits) return "";
  const padded = normalizeCents(digits).padStart(3, "0");
  return `${padded.slice(0, -2)}.${padded.slice(-2)}`;
}

function formatCents(digits: string) {
  const value = centsToValue(digits);
  if (!value) return "";
  const [integer, fraction] = value.split(".");
  const groups = [];
  for (let end = integer.length; end > 0; end -= 3) {
    groups.push(integer.slice(Math.max(0, end - 3), end));
  }
  return `R$ ${groups.toReversed().join(".")},${fraction}`;
}

const removeFormatting: NonNullable<NumberFormatBaseProps["removeFormatting"]> = (
  formatted,
  change,
) => {
  const digits = formatted.replace(/\D/g, "");
  // Os zeros de preenchimento não devem impedir que o último dígito seja apagado.
  const isDeletion =
    change && change.from.end - change.from.start > change.to.end - change.to.start;
  return isDeletion && /^0*$/.test(digits) ? "" : normalizeCents(digits);
};

function pasteCents(event: ClipboardEvent<HTMLInputElement>) {
  event.preventDefault();
  const input = event.currentTarget;
  if (input.readOnly || input.disabled) return;

  const text = event.clipboardData.getData("text").trim();
  let digits: string;
  if (/^\d+$/.test(text)) {
    digits = text;
  } else if (/^(?:R\$\s*)?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(text)) {
    const [integer = "", fraction = ""] = text.replace(/^R\$\s*/, "").split(",");
    digits = integer.replaceAll(".", "") + fraction.padEnd(2, "0");
  } else {
    return;
  }

  // Usa o mesmo caminho de edição do teclado, incluindo seleção e posição do cursor.
  input.setRangeText(digits, input.selectionStart ?? 0, input.selectionEnd ?? 0, "end");
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export type CurrencyFieldProps = FieldBaseProps &
  Omit<
    AriaTextFieldProps,
    | keyof FieldBaseProps
    | "children"
    | "className"
    | "defaultValue"
    | "value"
    | "onChange"
    | "type"
    | "inputMode"
    | "pattern"
    | "minLength"
    | "maxLength"
    | "validationBehavior"
    | "isInvalid"
  > & {
    /** Referência do input. Com React Hook Form, use `{...field}`. */
    ref?: Ref<HTMLInputElement>;
    placeholder?: string;
    /** Ícone decorativo antes do valor. */
    leadingIcon?: ReactNode;
    /** String decimal em reais, como "1234.56", ou "" para vazio. Até duas casas decimais. */
    value: string;
    /** Recebe "1234.56", "0.00" ou "". Alterações externas de value não disparam o callback. */
    onChange: (value: string) => void;
  };

/**
 * Input BRL controlado com digitação em centavos: 1234 exibe R$ 12,34. A validação de
 * obrigatoriedade e de valor maior que zero pertence ao formulário. Colagens sem separador
 * representam centavos; valores formatados seguem o padrão brasileiro. Colagens inválidas são
 * rejeitadas. O valor é manipulado como string, sem conversão para float.
 *
 * @example
 *   ```tsx
 *   <Controller control={control} name="valor" render={({ field }) => (
 *     <CurrencyField label="Valor" {...field} errorMessage={errors.valor?.message} />
 *   )} />;
 *   ```;
 */
export function CurrencyField({
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
  placeholder = "R$ 0,00",
  leadingIcon,
  value,
  onChange,
  ref,
  ...textFieldProps
}: CurrencyFieldProps) {
  const cents = valueToCents(value);

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
        <NumberFormatBase
          className="tabular-nums"
          customInput={Input}
          format={formatCents}
          getInputRef={ref}
          inputMode="numeric"
          onPaste={pasteCents}
          onValueChange={(values, source) => {
            if (source.event) onChange(centsToValue(values.value));
          }}
          placeholder={placeholder}
          removeFormatting={removeFormatting}
          value={cents}
          valueIsNumericString
        />
      </FieldGroup>
      <FieldError reserveSpace={reserveErrorSpace}>{errorMessage}</FieldError>
    </AriaTextField>
  );
}
