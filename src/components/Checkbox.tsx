import type { ReactNode } from "react";
import {
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps as AriaCheckboxFieldProps,
} from "react-aria-components";

import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { tv } from "tailwind-variants";

const checkboxRootStyles = tv(
  {
    base: "group flex min-h-[1.625rem] min-w-0 cursor-pointer select-none items-center gap-2 text-label text-muted outline-none transition-colors duration-150 ease-out data-disabled:cursor-not-allowed data-disabled:opacity-50 max-[48rem]:min-h-11 motion-reduce:transition-none",
    variants: {
      size: {
        default: "",
        compact: "mb-1 min-h-8 gap-2.25",
      },
      invalid: {
        false: "",
        true: "text-danger",
      },
    },
    defaultVariants: {
      size: "default",
      invalid: false,
    },
  },
  { twMerge: false },
);

const checkboxIndicatorStyles = tv({
  base: "grid size-[1.125rem] shrink-0 place-items-center rounded-[0.3125rem] border text-brand-foreground transition-[background-color,border-color,color] duration-150 ease-out [&>svg]:size-2.75 [&>svg]:shrink-0 motion-reduce:transition-none",
  variants: {
    selected: {
      false:
        "border-border-strong bg-[color-mix(in_oklch,var(--color-surface)_70%,transparent)] text-transparent",
      true: "border-brand bg-brand text-brand-foreground",
    },
  },
});

export type CheckboxProps = Omit<AriaCheckboxFieldProps, "children" | "className"> & {
  /** Conteúdo textual exibido ao lado do indicador. */
  children: ReactNode;
  /** Classes adicionais aplicadas ao elemento raiz do checkbox. */
  className?: string;
  /** Classes adicionais aplicadas ao texto do checkbox. */
  labelClassName?: string;
  /** Elemento que recebe o anel de foco visível. */
  focusRing?: "indicator" | "none";
  /** Densidade do checkbox para contextos com linhas mais compactas. */
  size?: "default" | "compact";
};

function getIndicatorClassName({
  isDisabled,
  focusRing,
  isIndeterminate,
  isInvalid,
  isPressed,
  isSelected,
}: {
  isDisabled: boolean;
  focusRing: "indicator" | "none";
  isIndeterminate: boolean;
  isInvalid: boolean;
  isPressed: boolean;
  isSelected: boolean;
}) {
  const selected = isSelected || isIndeterminate;
  const stateClassName = isDisabled
    ? ""
    : isPressed
      ? selected
        ? "border-brand-pressed bg-brand-pressed"
        : "bg-surface-strong"
      : "";
  const focusClassName =
    focusRing === "indicator"
      ? `group-data-focus-visible:outline-2 group-data-focus-visible:outline-offset-2 group-data-focus-visible:outline-solid ${isInvalid ? "group-data-focus-visible:outline-danger" : "group-data-focus-visible:outline-brand"}`
      : "";

  return [
    checkboxIndicatorStyles({ selected }),
    stateClassName,
    focusClassName,
    isInvalid ? "border-danger" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Checkbox acessível e estilizado do Economize.
 *
 * O componente usa a composição CheckboxField + CheckboxButton do React Aria e centraliza os
 * estados visuais de seleção, indeterminação, pressionado, foco, invalidez e desabilitado.
 *
 * @see https://react-aria.adobe.com/Checkbox
 */
export function Checkbox({
  children,
  className,
  focusRing = "indicator",
  labelClassName,
  size = "default",
  ...checkboxProps
}: CheckboxProps) {
  return (
    <CheckboxField {...checkboxProps} className="contents">
      <CheckboxButton
        className={({ isInvalid }) =>
          [checkboxRootStyles({ invalid: isInvalid, size }), className].filter(Boolean).join(" ")
        }
      >
        {({ isIndeterminate, isInvalid, isPressed, isSelected, isDisabled }) => {
          const selected = isSelected || isIndeterminate;

          return (
            <>
              <span
                className={getIndicatorClassName({
                  isDisabled,
                  focusRing,
                  isIndeterminate,
                  isInvalid,
                  isPressed,
                  isSelected,
                })}
              >
                {isIndeterminate ? (
                  <MinusIcon aria-hidden="true" weight="bold" />
                ) : selected ? (
                  <CheckIcon aria-hidden="true" weight="bold" />
                ) : null}
              </span>
              <span className={labelClassName ? `min-w-0 ${labelClassName}` : "min-w-0"}>
                {children}
              </span>
            </>
          );
        }}
      </CheckboxButton>
    </CheckboxField>
  );
}
