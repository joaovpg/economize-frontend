import { useState, type Ref } from "react";
import {
  FieldError,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { tv } from "tailwind-variants";

import { Button } from "./Button";

const control = tv({
  base: "flex min-h-11 items-center rounded-md border bg-surface transition motion-reduce:transition-none",
  variants: {
    invalid: {
      true: "border-danger has-[input:focus]:shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-danger)_16%,transparent)]",
      false:
        "border-border-strong hover:border-foreground/30 has-[input:focus]:border-brand has-[input:focus]:shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-brand)_14%,transparent)]",
    },
    disabled: {
      true: "cursor-not-allowed border-border bg-surface-muted opacity-70",
      false: "",
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
export type TextFieldProps = Omit<AriaTextFieldProps, "children"> & {
  /** Texto exibido acima do input. */
  label: string;
  /** Texto auxiliar opcional exibido logo abaixo da label. */
  description?: string;
  /** Mensagem de validação exibida na área reservada abaixo do input. */
  errorMessage?: string;
  /** Texto exibido dentro do input quando ele está vazio. */
  placeholder?: string;
  /** Referência encaminhada ao elemento input pelo contexto do React Aria. */
  inputRef?: Ref<HTMLInputElement>;
};

/**
 * Campo de texto estilizado e acessível para os formulários do Economize.
 *
 * Campos de senha incluem um controle de visibilidade. A área de erro está sempre presente para que
 * mensagens de validação não movam o restante do formulário.
 */
export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  inputRef,
  type = "text",
  isDisabled = false,
  ...textFieldProps
}: TextFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const hasError = Boolean(errorMessage);
  const inputType = isPassword && isPasswordVisible ? "text" : type;

  return (
    <AriaTextField
      {...textFieldProps}
      isInvalid={hasError}
      isDisabled={isDisabled}
      type={inputType}
      className="grid gap-2"
    >
      <div className="flex flex-col gap-1">
        <Label className="text-label text-foreground">{label}</Label>
        {description && (
          <Text slot="description" className="text-caption text-muted">
            {description}
          </Text>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <div
          className={control({
            invalid: hasError,
            disabled: isDisabled,
          })}
        >
          <Input
            ref={inputRef}
            placeholder={placeholder}
            className="w-full min-w-0 border-0 bg-transparent px-3 py-2.5 text-[0.9rem] text-foreground caret-brand outline-none placeholder:text-subtle"
          />
          {isPassword && (
            <Button
              type="button"
              className="mr-1 rounded-[0.625rem] text-subtle"
              variant="ghost"
              size="sm"
              isIconOnly
              aria-label={isPasswordVisible ? "Ocultar senha" : "Exibir senha"}
              aria-pressed={isPasswordVisible}
              isDisabled={isDisabled}
              onPress={() => setIsPasswordVisible((visible) => !visible)}
            >
              {isPasswordVisible ? (
                <EyeIcon aria-hidden="true" size={19} />
              ) : (
                <EyeSlashIcon aria-hidden="true" size={19} />
              )}
            </Button>
          )}
        </div>
        <div className="min-h-4">
          <FieldError className="block font-ui text-xs leading-4 font-normal text-danger">
            {errorMessage}
          </FieldError>
        </div>
      </div>
    </AriaTextField>
  );
}
