import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  composeRenderProps,
  RadioButton as AriaRadioButton,
  RadioField as AriaRadioField,
  RadioGroup as AriaRadioGroup,
  type RadioButtonProps as AriaRadioButtonProps,
  type RadioFieldProps as AriaRadioFieldProps,
  type RadioGroupProps as AriaRadioGroupProps,
} from "react-aria-components";

import { tv } from "tailwind-variants";

import { composeTailwindRenderProps } from "../utils/composeTailwindRenderProps";
import { Description } from "./Description";
import { FieldError } from "./FieldError";
import { IconSlot } from "./IconSlot";
import { Label } from "./Label";

const radioOptionsStyles = tv({
  base: "min-w-0",
  compoundVariants: [
    {
      appearance: "segmented",
      class: "flex-nowrap gap-1",
    },
  ],
  variants: {
    appearance: {
      default: "",
      pill: "",
      segmented:
        "flex w-full max-w-full gap-1 overflow-hidden rounded-xl border border-border bg-surface-muted p-1",
    },
    invalid: {
      false: "",
      true: "border-danger",
    },
    orientation: {
      horizontal: "flex flex-wrap gap-2",
      vertical: "grid gap-1.5",
    },
  },
});

const radioFieldStyles = tv({
  base: "min-w-0",
  variants: {
    appearance: {
      default: "",
      pill: "",
      segmented: "flex-1",
    },
    hasDescription: {
      false: "",
      true: "grid gap-0.5",
    },
  },
});

const radioButtonStyles = tv(
  {
    base: "group flex min-w-0 cursor-pointer select-none items-center outline-none transition-[background-color,border-color,color,outline-color] duration-150 ease-out data-disabled:cursor-not-allowed data-disabled:opacity-50 data-readonly:cursor-default motion-reduce:transition-none",
    variants: {
      appearance: {
        default:
          "min-h-11 gap-2 rounded-lg text-label text-muted data-hovered:bg-surface-muted data-hovered:text-foreground data-pressed:bg-surface-strong data-pressed:text-foreground data-selected:text-foreground",
        pill: "min-h-11 max-w-full gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-button text-foreground data-hovered:border-border-strong data-hovered:bg-surface-muted data-pressed:border-border-strong data-pressed:bg-surface-strong data-selected:border-brand data-selected:bg-brand-soft data-selected:text-brand-hover",
        segmented:
          "min-h-11 w-full justify-center gap-2 rounded-lg px-3 py-2 text-center text-button text-muted data-hovered:bg-surface data-hovered:text-foreground data-pressed:bg-surface-strong data-pressed:text-foreground data-selected:bg-surface data-selected:text-foreground data-selected:shadow-sm",
      },
      invalid: {
        false: "",
        true: "!border-danger !text-danger",
      },
    },
  },
  { twMerge: false },
);

const radioIndicatorStyles = tv({
  base: "grid size-4.5 shrink-0 place-items-center rounded-full border bg-surface transition-[background-color,border-color] duration-150 ease-out motion-reduce:transition-none",
  variants: {
    invalid: {
      false: "",
      true: "!border-danger",
    },
    selected: {
      false: "border-border-strong",
      true: "border-brand",
    },
  },
});

export type RadioAppearance = "default" | "pill" | "segmented";

type RadioContextValue = {
  appearance: RadioAppearance;
  isDisabled: boolean;
};

const RadioContext = createContext<RadioContextValue>({
  appearance: "default",
  isDisabled: false,
});

function hasRenderableDescription(description: ReactNode) {
  return description !== undefined && description !== null && description !== false;
}

function getRadioButtonClassName({
  appearance,
  className,
  isDisabled,
  isFocusVisible,
  isInvalid,
}: {
  appearance: RadioAppearance;
  className?: string;
  isDisabled: boolean;
  isFocusVisible: boolean;
  isInvalid: boolean;
}) {
  const hasVisualError = isInvalid && !isDisabled;
  const focusClassName =
    appearance !== "default" && isFocusVisible
      ? `outline-2 outline-offset-2 outline-solid ${hasVisualError ? "outline-danger" : "outline-brand"}`
      : "";

  return [radioButtonStyles({ appearance, className, invalid: hasVisualError }), focusClassName]
    .filter(Boolean)
    .join(" ");
}

function getRadioIndicatorClassName({
  appearance,
  isDisabled,
  isFocusVisible,
  isInvalid,
  isPressed,
  isSelected,
}: {
  appearance: RadioAppearance;
  isDisabled: boolean;
  isFocusVisible: boolean;
  isInvalid: boolean;
  isPressed: boolean;
  isSelected: boolean;
}) {
  const hasVisualError = isInvalid && !isDisabled;
  const pressedClassName =
    !isDisabled && !hasVisualError && isPressed
      ? isSelected
        ? "border-brand-pressed bg-brand-soft"
        : "bg-surface-strong"
      : "";
  const focusClassName =
    appearance === "default" && isFocusVisible
      ? `outline-2 outline-offset-2 outline-solid ${hasVisualError ? "outline-danger" : "outline-brand"}`
      : "";

  return [
    radioIndicatorStyles({ invalid: hasVisualError, selected: isSelected }),
    pressedClassName,
    focusClassName,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Props do grupo de radio estilizado do Economize.
 *
 * A aparência pode ser alternada entre o radio tradicional, opções pill ou um segmented radio sem
 * alterar a semântica, o comportamento de teclado ou o contrato de formulário do componente.
 */
export type RadioGroupProps = Omit<
  AriaRadioGroupProps,
  "children" | "description" | "errorMessage" | "label"
> & {
  /** Opções renderizadas dentro do grupo, normalmente usando `RadioItem`. */
  children: ReactNode;
  /** Texto exibido acima das opções e usado para nomear o grupo para tecnologias assistivas. */
  label: string;
  /** Aparência das opções. */
  appearance?: RadioAppearance;
  /** Texto auxiliar opcional exibido logo abaixo da label. */
  description?: string;
  /** Mensagem de validação exibida na área reservada abaixo das opções. */
  errorMessage?: string;
  /** Classes adicionais aplicadas à label do grupo. */
  labelClassName?: string;
  /** Mantém uma área reservada para a mensagem de validação quando não houver erro. */
  reserveErrorSpace?: boolean;
};

/**
 * Props da opção de radio estilizada do Economize.
 *
 * `className` estiliza a área clicável da opção. O `leadingIcon` é tratado como conteúdo
 * decorativo; o texto principal ou um `aria-label` continua sendo necessário para nomear o radio.
 */
export type RadioItemProps = Omit<AriaRadioFieldProps, "children" | "className" | "isInvalid"> & {
  /** Conteúdo que nomeia visualmente a opção. */
  children: ReactNode;
  /** Descrição opcional associada semanticamente à opção. */
  description?: ReactNode;
  /** Ícone decorativo exibido entre o indicador e o conteúdo da opção. */
  leadingIcon?: ReactNode;
  /** Classes adicionais aplicadas à área clicável da opção. */
  className?: AriaRadioButtonProps["className"];
  /** Classes adicionais aplicadas ao conteúdo textual da opção. */
  labelClassName?: string;
};

/**
 * Grupo de radio acessível e estilizado para os formulários do Economize.
 *
 * O componente usa `RadioGroup` + `RadioField` + `RadioButton` do React Aria, preservando inputs
 * nativos, navegação por setas, seleção única, associação de label/descrição/erro e validação de
 * formulário. Use `appearance="pill"` para opções independentes ou `appearance="segmented"` para
 * opções curtas dentro de um único controle agrupado.
 *
 * @example
 *   ```tsx
 *   <RadioGroup label="Periodicidade" appearance="segmented" name="frequency">
 *     <RadioItem value="monthly">Mensal</RadioItem>
 *     <RadioItem value="yearly">Anual</RadioItem>
 *   </RadioGroup>
 *   ```;
 *
 * @see https://react-aria.adobe.com/RadioGroup
 */
export function RadioGroup({
  appearance = "default",
  children,
  className,
  description,
  errorMessage,
  isDisabled = false,
  isInvalid = false,
  label,
  labelClassName,
  orientation,
  reserveErrorSpace = true,
  ...radioGroupProps
}: RadioGroupProps) {
  const hasError = Boolean(errorMessage) || isInvalid;
  const hasVisualError = hasError && !isDisabled;
  const resolvedOrientation = orientation ?? (appearance === "default" ? "vertical" : "horizontal");
  const radioContextValue = useMemo(() => ({ appearance, isDisabled }), [appearance, isDisabled]);

  return (
    <RadioContext.Provider value={radioContextValue}>
      <AriaRadioGroup
        {...radioGroupProps}
        className={composeTailwindRenderProps(className, "grid min-w-0 gap-1")}
        isDisabled={isDisabled}
        isInvalid={hasError}
        orientation={resolvedOrientation}
      >
        <Label className={labelClassName} isDisabled={isDisabled}>
          {label}
        </Label>
        {description && <Description isDisabled={isDisabled}>{description}</Description>}
        <div
          className={radioOptionsStyles({
            appearance,
            invalid: hasVisualError,
            orientation: resolvedOrientation,
          })}
        >
          {children}
        </div>
        <div className={reserveErrorSpace ? "min-h-4 min-w-0" : "min-w-0"}>
          <FieldError>{errorMessage}</FieldError>
        </div>
      </AriaRadioGroup>
    </RadioContext.Provider>
  );
}

/** Opção reutilizável para o `RadioGroup` do Economize. */
export function RadioItem({
  children,
  className,
  description,
  isDisabled = false,
  labelClassName,
  leadingIcon,
  ...radioFieldProps
}: RadioItemProps) {
  const { appearance, isDisabled: isGroupDisabled } = useContext(RadioContext);
  const isOptionDisabled = isDisabled || isGroupDisabled;
  const hasDescription = hasRenderableDescription(description);

  return (
    <AriaRadioField
      {...radioFieldProps}
      className={radioFieldStyles({ appearance, hasDescription })}
      isDisabled={isDisabled}
    >
      <AriaRadioButton
        className={composeRenderProps(className, (userClassName, renderProps) =>
          getRadioButtonClassName({
            appearance,
            className: userClassName,
            isDisabled: renderProps.isDisabled,
            isFocusVisible: renderProps.isFocusVisible,
            isInvalid: renderProps.isInvalid,
          }),
        )}
      >
        {({ isDisabled: isRadioDisabled, isFocusVisible, isInvalid, isPressed, isSelected }) => (
          <>
            {appearance !== "segmented" && (
              <span
                aria-hidden="true"
                className={getRadioIndicatorClassName({
                  appearance,
                  isDisabled: isRadioDisabled,
                  isFocusVisible,
                  isInvalid,
                  isPressed,
                  isSelected,
                })}
              >
                {isSelected && <span className="size-2 rounded-full bg-brand" />}
              </span>
            )}
            {leadingIcon && <IconSlot>{leadingIcon}</IconSlot>}
            <span className={labelClassName ? `min-w-0 ${labelClassName}` : "min-w-0"}>
              {children}
            </span>
          </>
        )}
      </AriaRadioButton>
      {hasDescription && (
        <Description isDisabled={isOptionDisabled} className="ml-7">
          {description}
        </Description>
      )}
    </AriaRadioField>
  );
}
