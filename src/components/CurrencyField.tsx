import { type ClipboardEvent, type ReactNode, type Ref } from "react";
import {
  Input,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import { NumberFormatBase, type NumberFormatBaseProps } from "react-number-format";

import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

import { Description } from "./Description";
import { FieldError } from "./FieldError";
import { IconSlot } from "./IconSlot";
import { Label } from "./Label";

const control = tv({
  base: "flex h-12 min-h-12 min-w-0 items-center gap-2.5 rounded-xl border bg-surface px-3.5 font-ui text-subtle transition-[background-color,border-color,outline-color] motion-reduce:transition-none",
  variants: {
    disabled: {
      false: "",
      true: "cursor-not-allowed border-border bg-surface-muted text-subtle hover:border-border! focus-within:border-border! focus-within:outline-none!",
    },
    invalid: {
      false:
        "border-border hover:border-border-strong focus-within:border-brand! focus-within:outline-brand focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-0",
      true: "border-danger focus-within:border-danger! focus-within:outline-danger focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-0",
    },
  },
});

const inputStyles = tv(
  {
    base: "min-w-0 flex-1 border-0 bg-transparent text-body-small caret-brand outline-none placeholder:text-subtle",
    variants: {
      disabled: {
        false: "text-foreground",
        true: "text-subtle",
      },
    },
  },
  { twMerge: false },
);

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

export type CurrencyFieldProps = Omit<
  AriaTextFieldProps,
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
> & {
  label: string;
  description?: string;
  errorMessage?: string;
  reserveErrorSpace?: boolean;
  placeholder?: string;
  leadingIcon?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
  /** String decimal em reais, como "1234.56", ou "" para vazio. Até duas casas decimais. */
  value: string;
  /** Recebe "1234.56", "0.00" ou "". Alterações externas de value não disparam o callback. */
  onValueChange: (value: string) => void;
};

/**
 * Input BRL controlado com digitação em centavos: 1234 exibe R$ 12,34. A validação de
 * obrigatoriedade e de valor maior que zero pertence ao formulário. No Controller do React Hook
 * Form, conecte field.onChange a onValueChange e field.ref a inputRef. Colagens sem separador
 * representam centavos; valores formatados seguem o padrão brasileiro. Colagens inválidas são
 * rejeitadas. O valor é manipulado como string, sem conversão para float.
 *
 * @example
 *   ```tsx
 *   const [amount, setAmount] = useState("");
 *   <CurrencyField label="Valor" value={amount} onValueChange={setAmount} />;
 *   ```;
 */
export function CurrencyField({
  label,
  description,
  errorMessage,
  reserveErrorSpace = true,
  placeholder = "R$ 0,00",
  leadingIcon,
  inputRef,
  className,
  value,
  onValueChange,
  isDisabled = false,
  isInvalid = false,
  isReadOnly = false,
  ...textFieldProps
}: CurrencyFieldProps) {
  const hasError = Boolean(errorMessage) || isInvalid;
  const cents = valueToCents(value);

  return (
    <AriaTextField
      {...textFieldProps}
      isDisabled={isDisabled}
      isInvalid={hasError}
      isReadOnly={isReadOnly}
      className={twMerge("grid min-w-0 gap-1", className)}
    >
      <Label isDisabled={isDisabled}>{label}</Label>
      {description && <Description isDisabled={isDisabled}>{description}</Description>}
      <div className={control({ disabled: isDisabled, invalid: hasError && !isDisabled })}>
        {leadingIcon && <IconSlot>{leadingIcon}</IconSlot>}
        <NumberFormatBase
          customInput={Input}
          getInputRef={inputRef}
          value={cents}
          valueIsNumericString
          format={formatCents}
          removeFormatting={removeFormatting}
          onValueChange={(values, source) => {
            if (source.event) onValueChange(centsToValue(values.value));
          }}
          onPaste={pasteCents}
          inputMode="numeric"
          placeholder={placeholder}
          className={inputStyles({ disabled: isDisabled })}
        />
      </div>
      <div className={reserveErrorSpace ? "min-h-4 min-w-0" : "min-w-0"}>
        <FieldError>{errorMessage}</FieldError>
      </div>
    </AriaTextField>
  );
}
