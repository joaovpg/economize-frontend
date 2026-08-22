import { useState } from "react";
import {
  FieldError,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
  type InputProps,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";

import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { tv } from "tailwind-variants";

const control = tv({
  base: "flex min-h-11 items-center rounded-md border bg-surface transition motion-reduce:transition-none",
  variants: {
    invalid: {
      true: "border-danger focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-danger)_16%,transparent)]",
      false:
        "border-border-strong focus-within:border-brand focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-brand)_14%,transparent)]",
    },
  },
});

/**
 * Props do campo de texto do Economize.
 *
 * O componente segue a composição de TextField do React Aria e mantém as propriedades específicas
 * do input agrupadas em `inputProps`.
 *
 * @example
 *   ```tsx
 *   <TextField
 *     label="Senha"
 *     description="Use entre 8 e 128 caracteres."
 *     errorMessage={errorMessage}
 *     inputProps={{ type: "password", autoComplete: "new-password" }}
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
  /** Propriedades nativas e do React Aria encaminhadas ao elemento input. */
  inputProps?: InputProps;
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
  inputProps,
  ...textFieldProps
}: TextFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = inputProps?.type === "password";
  const inputType = isPassword && isPasswordVisible ? "text" : inputProps?.type;

  return (
    <AriaTextField {...textFieldProps} isInvalid={Boolean(errorMessage)} className="grid gap-2">
      <Label className="text-[0.84rem] font-semibold text-foreground">{label}</Label>
      {description && (
        <Text slot="description" className="-mt-1 text-[0.78rem] leading-normal text-muted">
          {description}
        </Text>
      )}
      <div className={control({ invalid: Boolean(errorMessage) })}>
        <Input
          {...inputProps}
          type={inputType}
          className="w-full min-w-0 border-0 bg-transparent px-3 py-2.5 text-[0.9rem] text-foreground outline-none placeholder:text-subtle"
        />
        {isPassword && (
          <button
            type="button"
            className="grid size-11 shrink-0 place-items-center rounded-[0.625rem] border-0 bg-transparent p-0 text-subtle outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
            aria-label={isPasswordVisible ? "Ocultar senha" : "Exibir senha"}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
          >
            {isPasswordVisible ? (
              <EyeIcon aria-hidden="true" size={19} />
            ) : (
              <EyeSlashIcon aria-hidden="true" size={19} />
            )}
          </button>
        )}
      </div>
      <div className="min-h-4.5">
        <FieldError className="m-0 text-[0.78rem] text-danger">{errorMessage}</FieldError>
      </div>
    </AriaTextField>
  );
}
