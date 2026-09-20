import { type ReactNode, type Ref } from "react";
import {
  Group,
  Input,
  NumberField as AriaNumberField,
  type InputProps as AriaInputProps,
  type NumberFieldProps as AriaNumberFieldProps,
} from "react-aria-components";

import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

import { Button } from "./Button";
import { Description } from "./Description";
import { FieldError } from "./FieldError";
import { IconSlot } from "./IconSlot";
import { Label } from "./Label";

const control = tv({
  base: "flex h-12 min-h-12 min-w-0 items-center gap-2.5 rounded-xl border bg-[linear-gradient(180deg,rgb(255_255_255_/_0.7),#fffdf8)] px-3.5 font-ui text-subtle transition-[background-color,border-color,outline-color] motion-reduce:transition-none",
  variants: {
    disabled: {
      false: "",
      true: "cursor-not-allowed border-border bg-surface-muted text-subtle hover:!border-border focus-within:!border-border focus-within:!outline-none",
    },
    invalid: {
      false:
        "border-border hover:border-border-strong focus-within:!border-brand focus-within:outline-brand focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-0",
      true: "border-danger focus-within:!border-danger focus-within:outline-danger focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-0",
    },
  },
});

const inputStyles = tv(
  {
    base: "min-w-0 flex-1 border-0 bg-transparent text-body-small caret-brand outline-none placeholder:text-subtle",
    defaultVariants: {
      disabled: false,
    },
    variants: {
      disabled: {
        false: "text-foreground",
        true: "text-subtle",
      },
    },
  },
  { twMerge: false },
);

const stepperButtonStyles = tv({
  base: "![--button-height:1.25rem] !size-5 rounded-md text-subtle data-focus-visible:!outline-offset-0 [&>span]:!size-3",
  defaultVariants: {
    invalid: false,
  },
  variants: {
    invalid: {
      false: "data-focus-visible:outline-brand",
      true: "data-focus-visible:outline-danger",
    },
  },
});

/**
 * Props do campo numérico estilizado do Economize.
 *
 * O componente segue a composição de NumberField do React Aria. As propriedades numéricas, como
 * `minValue`, `maxValue`, `step` e `formatOptions`, são recebidas pelo próprio NumberField e
 * encaminhadas aos seus elementos internos pelo contexto do React Aria.
 */
export type NumberFieldProps = Omit<
  AriaNumberFieldProps,
  "children" | "className" | "description" | "errorMessage" | "label" | "placeholder"
> & {
  /** Texto exibido acima do input. */
  label: string;
  /** Texto auxiliar opcional exibido logo abaixo da label. */
  description?: string;
  /** Mensagem de validação exibida na área reservada abaixo do input. */
  errorMessage?: string;
  /** Mantém uma área reservada para a mensagem de validação quando não houver erro. */
  reserveErrorSpace?: boolean;
  /** Texto exibido dentro do input quando ele está vazio. */
  placeholder?: string;
  /** Configuração de preenchimento automático do input. */
  autoComplete?: AriaInputProps["autoComplete"];
  /** Teclado virtual sugerido para o input em dispositivos móveis. */
  inputMode?: AriaInputProps["inputMode"];
  /** Quantidade máxima de caracteres permitida no input. */
  maxLength?: AriaInputProps["maxLength"];
  /** Ícone decorativo exibido antes do conteúdo do input. */
  leadingIcon?: ReactNode;
  /** Referência encaminhada ao elemento input pelo contexto do React Aria. */
  inputRef?: Ref<HTMLInputElement>;
  /** Exibe os botões de incremento e decremento dentro do controle. */
  showStepperButton?: boolean;
  /** Estilos adicionais aplicados ao campo. */
  className?: string;
};

/**
 * Campo numérico acessível e estilizado para os formulários do Economize.
 *
 * Os botões de incremento e decremento são opcionais e ficam ocultos por padrão. Quando exibidos, o
 * React Aria controla seus rótulos acessíveis, seus estados desabilitados e a aplicação dos limites
 * e do passo configurados no campo.
 *
 * @see https://react-aria.adobe.com/NumberField
 */
export function NumberField({
  autoComplete,
  className,
  description,
  errorMessage,
  inputRef,
  inputMode,
  isDisabled = false,
  isInvalid = false,
  label,
  leadingIcon,
  maxLength,
  placeholder,
  reserveErrorSpace = true,
  showStepperButton = false,
  ...numberFieldProps
}: NumberFieldProps) {
  const hasError = Boolean(errorMessage) || isInvalid;
  const hasVisualError = hasError && !isDisabled;

  return (
    <AriaNumberField
      {...numberFieldProps}
      className={twMerge("grid min-w-0 gap-1", className)}
      isDisabled={isDisabled}
      isInvalid={hasError}
    >
      <Label isDisabled={isDisabled}>{label}</Label>
      {description && <Description isDisabled={isDisabled}>{description}</Description>}
      <Group className={control({ disabled: isDisabled, invalid: hasVisualError })}>
        {leadingIcon && <IconSlot>{leadingIcon}</IconSlot>}
        <Input
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          ref={inputRef}
          className={inputStyles({ disabled: isDisabled })}
          placeholder={placeholder}
        />
        {showStepperButton && (
          <div className="flex shrink-0 flex-col justify-center">
            <Button
              className={stepperButtonStyles({ invalid: hasVisualError })}
              isIconOnly
              size="sm"
              slot="increment"
              variant="ghost"
            >
              <CaretUpIcon aria-hidden="true" />
            </Button>
            <Button
              className={stepperButtonStyles({ invalid: hasVisualError })}
              isIconOnly
              size="sm"
              slot="decrement"
              variant="ghost"
            >
              <CaretDownIcon aria-hidden="true" />
            </Button>
          </div>
        )}
      </Group>
      <div className={reserveErrorSpace ? "min-h-4 min-w-0" : "min-w-0"}>
        <FieldError>{errorMessage}</FieldError>
      </div>
    </AriaNumberField>
  );
}
