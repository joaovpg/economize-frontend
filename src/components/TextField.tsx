import { useState, type ReactNode, type Ref } from "react";
import {
  Input,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
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

const passwordToggleStyles = tv({
  base: "![--button-height:2rem] rounded-lg text-subtle data-focus-visible:!outline-offset-0",
  defaultVariants: {
    disabled: false,
    invalid: false,
  },
  variants: {
    disabled: {
      false: "",
      true: "data-disabled:!opacity-100",
    },
    invalid: {
      false: "data-focus-visible:outline-brand",
      true: "data-focus-visible:outline-danger",
    },
  },
});

/**
 * Props do campo de texto do Economize.
 *
 * O componente segue a composição de TextField do React Aria. As propriedades do input, como
 * `name`, `type` e `placeholder`, são recebidas pelo próprio TextField e encaminhadas ao Input pelo
 * contexto do React Aria.
 *
 * @example
 *   ```tsx
 *   <TextField
 *     label="Senha"
 *     description="Use entre 8 e 128 caracteres."
 *     errorMessage={errorMessage}
 *     type="password"
 *     autoComplete="new-password"
 *   />;
 *   ```;
 *
 * @see https://react-aria.adobe.com/TextField
 */
export type TextFieldProps = Omit<AriaTextFieldProps, "children" | "className"> & {
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
  /** Ícone decorativo exibido antes do conteúdo do input. */
  leadingIcon?: ReactNode;
  /** Ícone decorativo exibido depois do conteúdo do input, exceto em campos de senha. */
  trailingIcon?: ReactNode;
  /** Referência encaminhada ao elemento input pelo contexto do React Aria. */
  inputRef?: Ref<HTMLInputElement>;
  /** Estilos */
  className?: string;
};

/**
 * Campo de texto estilizado e acessível para os formulários do Economize.
 *
 * Campos de senha incluem um controle de visibilidade. A área de feedback mantém uma reserva mínima
 * para evitar deslocamentos desnecessários, mas pode crescer para acomodar mensagens longas.
 */
export function TextField({
  label,
  description,
  errorMessage,
  reserveErrorSpace = true,
  placeholder,
  leadingIcon,
  trailingIcon,
  inputRef,
  type = "text",
  isDisabled = false,
  className,
  ...textFieldProps
}: TextFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const hasError = Boolean(errorMessage);
  const hasVisualError = hasError && !isDisabled;
  const inputType = isPassword && isPasswordVisible ? "text" : type;

  return (
    <AriaTextField
      {...textFieldProps}
      isInvalid={hasError}
      isDisabled={isDisabled}
      type={inputType}
      className={twMerge("grid min-w-0 gap-1", className)}
    >
      <Label isDisabled={isDisabled}>{label}</Label>
      {description && <Description isDisabled={isDisabled}>{description}</Description>}
      <div
        className={control({
          disabled: isDisabled,
          invalid: hasVisualError,
        })}
      >
        {leadingIcon && <IconSlot>{leadingIcon}</IconSlot>}
        <Input
          ref={inputRef}
          placeholder={placeholder}
          className={inputStyles({ disabled: isDisabled })}
        />
        {isPassword ? (
          <Button
            type="button"
            className={passwordToggleStyles({
              disabled: isDisabled,
              invalid: hasVisualError,
            })}
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label={isPasswordVisible ? "Ocultar senha" : "Exibir senha"}
            aria-pressed={isPasswordVisible}
            isDisabled={isDisabled}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
          >
            {isPasswordVisible ? (
              <EyeIcon aria-hidden="true" size={18} />
            ) : (
              <EyeSlashIcon aria-hidden="true" size={18} />
            )}
          </Button>
        ) : (
          trailingIcon && <IconSlot>{trailingIcon}</IconSlot>
        )}
      </div>
      <div className={reserveErrorSpace ? "min-h-4 min-w-0" : "min-w-0"}>
        <FieldError>{errorMessage}</FieldError>
      </div>
    </AriaTextField>
  );
}
