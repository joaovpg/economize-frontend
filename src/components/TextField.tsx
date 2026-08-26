import { useState, type ReactNode, type Ref } from "react";
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
import { IconSlot } from "./IconSlot";

const control = tv({
  base: "flex h-12 min-h-12 min-w-0 items-center gap-2.5 rounded-xl border bg-[linear-gradient(180deg,rgb(255_255_255_/_0.7),#fffdf8)] px-3.5 font-ui text-subtle transition-[background-color,border-color,outline-color] motion-reduce:transition-none",
  variants: {
    invalid: {
      true: "border-danger focus-within:!border-danger focus-within:outline-danger focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-0",
      false:
        "border-border hover:border-border-strong focus-within:!border-brand focus-within:outline-brand focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-0",
    },
    disabled: {
      true: "cursor-not-allowed border-border bg-surface-muted text-subtle hover:!border-border focus-within:!border-border focus-within:!outline-none",
      false: "",
    },
  },
});

const fieldCopyStyles = tv(
  {
    slots: {
      label: "text-label",
      description: "-mt-1 text-caption",
    },
    variants: {
      disabled: {
        true: {
          label: "text-subtle",
          description: "text-subtle",
        },
        false: {
          label: "text-foreground",
          description: "text-muted",
        },
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
  { twMerge: false },
);

const inputStyles = tv(
  {
    base: "min-w-0 flex-1 border-0 bg-transparent text-body-small caret-brand outline-none placeholder:text-subtle",
    variants: {
      disabled: {
        true: "text-subtle",
        false: "text-foreground",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
  { twMerge: false },
);

const passwordToggleStyles = tv({
  base: "!h-8 !min-h-8 !w-8 !min-w-8 rounded-lg text-subtle data-focus-visible:!outline-offset-0",
  variants: {
    invalid: {
      true: "data-focus-visible:outline-danger",
      false: "data-focus-visible:outline-brand",
    },
    disabled: {
      true: "data-disabled:!opacity-100",
      false: "",
    },
  },
  defaultVariants: {
    invalid: false,
    disabled: false,
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
  /** Ícone decorativo exibido antes do conteúdo do input. */
  leadingIcon?: ReactNode;
  /** Ícone decorativo exibido depois do conteúdo do input, exceto em campos de senha. */
  trailingIcon?: ReactNode;
  /** Referência encaminhada ao elemento input pelo contexto do React Aria. */
  inputRef?: Ref<HTMLInputElement>;
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
  placeholder,
  leadingIcon,
  trailingIcon,
  inputRef,
  type = "text",
  isDisabled = false,
  ...textFieldProps
}: TextFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const hasError = Boolean(errorMessage);
  const hasVisualError = hasError && !isDisabled;
  const inputType = isPassword && isPasswordVisible ? "text" : type;
  const { description: descriptionStyles, label: labelStyles } = fieldCopyStyles({
    disabled: isDisabled,
  });

  return (
    <AriaTextField
      {...textFieldProps}
      isInvalid={hasError}
      isDisabled={isDisabled}
      type={inputType}
      className="grid min-w-0 gap-1"
    >
      <Label className={labelStyles()}>{label}</Label>
      {description && (
        <Text slot="description" className={descriptionStyles()}>
          {description}
        </Text>
      )}
      <div
        className={control({
          invalid: hasVisualError,
          disabled: isDisabled,
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
              invalid: hasVisualError,
              disabled: isDisabled,
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
              <EyeIcon aria-hidden="true" size={19} />
            ) : (
              <EyeSlashIcon aria-hidden="true" size={19} />
            )}
          </Button>
        ) : (
          trailingIcon && <IconSlot>{trailingIcon}</IconSlot>
        )}
      </div>
      <div className="min-h-4 min-w-0">
        <FieldError className="block text-validation wrap-break-word text-danger">
          {errorMessage}
        </FieldError>
      </div>
    </AriaTextField>
  );
}
