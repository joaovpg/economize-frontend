import { useEffect, useRef, type ReactNode } from "react";
import {
  RadioButton as AriaRadioButton,
  RadioField as AriaRadioField,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
} from "react-aria-components";

import { cn } from "../../utils/tailwind";
import { IconSlot } from "../IconSlot";
import { Description } from "../primitives/field/Description";
import { FieldError } from "../primitives/field/FieldError";
import { FieldHeader } from "../primitives/field/FieldHeader";
import { fieldRootClassName, isFieldInvalid, type FieldBaseProps } from "./field-props";

/*
 * Regra do radio: só o clássico, sem pill nem segmentado. Na horizontal, as opções quebram linha
 * no celular; na vertical, empilham com `gap-1`. Os estados vêm dos data-* do botão da opção.
 */
const indicatorStyles = [
  "block size-4 shrink-0 rounded-full border border-border-strong bg-surface transition-colors motion-reduce:transition-none",
  "group-data-hovered:not-group-data-selected:not-group-data-invalid:not-group-data-disabled:border-foreground",
  "group-data-selected:border-5 group-data-selected:not-group-data-disabled:bg-brand-foreground",
  "group-data-selected:not-group-data-invalid:not-group-data-disabled:border-brand",
  "group-data-selected:group-data-invalid:not-group-data-disabled:border-danger",
  "group-data-invalid:not-group-data-selected:not-group-data-disabled:border-danger",
  "group-data-disabled:border-border group-data-disabled:bg-surface-muted",
].join(" ");

const indicatorFocusStyles = [
  "group-data-focus-visible:outline-1 group-data-focus-visible:outline-offset-1 group-data-focus-visible:outline-solid",
  "group-data-focus-visible:not-group-data-invalid:outline-brand",
  "group-data-focus-visible:group-data-invalid:outline-danger",
].join(" ");

export type RadioGroupProps = Omit<FieldBaseProps, "size"> &
  Omit<
    AriaRadioGroupProps,
    | keyof FieldBaseProps
    | "children"
    | "className"
    | "validationBehavior"
    | "isInvalid"
    | "orientation"
  > & {
    /** Opções criadas com `RadioItem`. */
    children: ReactNode;
    /** Disposição das opções. Padrão: `vertical`. */
    orientation?: "vertical" | "horizontal";
  };

/**
 * Grupo de opções de escolha única. `value` e `onChange(value)` seguem o contrato do React Hook
 * Form.
 */
export function RadioGroup({
  children,
  label,
  description,
  errorMessage,
  isInvalid,
  reserveErrorSpace = true,
  isRequired,
  isDisabled,
  isReadOnly,
  orientation = "vertical",
  className,
  ...radioGroupProps
}: RadioGroupProps) {
  return (
    <AriaRadioGroup
      {...radioGroupProps}
      className={cn(fieldRootClassName, className)}
      isDisabled={isDisabled}
      isInvalid={isFieldInvalid({ errorMessage, isInvalid })}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      orientation={orientation}
      validationBehavior="aria"
    >
      <FieldHeader description={description} isRequired={isRequired} label={label} />
      <div
        className={cn(
          orientation === "horizontal"
            ? "flex min-h-10 flex-wrap items-center gap-x-4 max-md:min-h-touch"
            : "grid gap-1",
        )}
      >
        {children}
      </div>
      <FieldError reserveSpace={reserveErrorSpace}>{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}

export type RadioItemProps = {
  /** Valor enviado ao grupo quando a opção é escolhida. */
  value: string;
  /** Texto visível da opção; ele nomeia o radio. */
  children: ReactNode;
  /** Texto auxiliar associado à opção. */
  description?: string;
  /** Ícone decorativo entre o indicador e o texto. */
  leadingIcon?: ReactNode;
  /** Move o foco para esta opção ao montar, como ao abrir um diálogo. */
  focusOnOpen?: boolean;
  isDisabled?: boolean;
  /** Classes adicionais aplicadas à área clicável da opção. */
  className?: string;
};

/** Opção do `RadioGroup`: indicador circular, texto e descrição opcional. */
export function RadioItem({
  children,
  value,
  description,
  leadingIcon,
  focusOnOpen = false,
  isDisabled = false,
  className,
}: RadioItemProps) {
  const buttonRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (focusOnOpen && !isDisabled) {
      // O RadioButton é o rótulo; o foco vai para o input nativo, que é o elemento focável.
      buttonRef.current?.querySelector("input")?.focus();
    }
  }, [focusOnOpen, isDisabled]);

  return (
    <AriaRadioField className="grid min-w-0" isDisabled={isDisabled} value={value}>
      <AriaRadioButton
        className={cn(
          "group flex min-h-6 min-w-0 cursor-pointer items-center gap-2 text-body-strong text-muted transition-colors outline-none select-none data-disabled:cursor-not-allowed data-disabled:text-muted data-invalid:text-danger data-selected:not-data-disabled:text-foreground motion-reduce:transition-none max-md:min-h-touch",
          className,
        )}
        ref={buttonRef}
      >
        <span aria-hidden="true" className={cn(indicatorStyles, indicatorFocusStyles)} />
        {leadingIcon && <IconSlot>{leadingIcon}</IconSlot>}
        <span className="min-w-0">{children}</span>
      </AriaRadioButton>
      {description && <Description className="pl-6">{description}</Description>}
    </AriaRadioField>
  );
}
