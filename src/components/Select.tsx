import type { ReactNode } from "react";
import {
  Button as AriaButton,
  ListBox,
  ListBoxItem as AriaListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
  composeRenderProps,
  type ListBoxItemProps as AriaListBoxItemProps,
  type SelectProps as AriaSelectProps,
} from "react-aria-components";

import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { tv, cn } from "tailwind-variants";

import { composeTailwindRenderProps } from "../utils/composeTailwindRenderProps";
import { Description } from "./Description";
import { FieldError } from "./FieldError";
import { IconSlot } from "./IconSlot";
import { Label } from "./Label";

const control = tv({
  base: "flex w-full min-w-0 cursor-pointer items-center gap-3 border font-ui text-subtle transition-[background-color,border-color,outline-color] motion-reduce:transition-none",
  variants: {
    appearance: {
      compact:
        "h-9 min-h-9 rounded-lg !border-transparent bg-transparent px-2.5 data-hovered:bg-surface-muted data-pressed:bg-surface-strong",
      default:
        "h-12 min-h-12 rounded-xl bg-[linear-gradient(180deg,rgb(255_255_255_/_0.7),#fffdf8)] px-3.5",
    },
    disabled: {
      false: "",
      true: "cursor-not-allowed border-border bg-surface-muted text-subtle hover:!border-border focus-within:!border-border focus-within:!outline-none",
    },
    invalid: {
      false:
        "border-border hover:border-border-strong focus-within:!border-brand focus-within:outline-brand focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-0",
      true: "!border-danger focus-within:!border-danger focus-within:outline-danger focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-0",
    },
  },
});

const selectValueStyles = tv(
  {
    base: "min-w-0 flex-1 truncate text-left text-body-small data-placeholder:text-subtle",
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

const itemStyles = tv({
  base: "group flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-body-small text-foreground outline-none transition-colors duration-150 ease-out data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focused:bg-surface-muted data-selected:bg-brand-soft data-selected:text-brand-hover motion-reduce:transition-none",
});

const itemIndicatorStyles = tv({
  base: "size-4 shrink-0 text-brand opacity-0 transition-opacity duration-150 ease-out group-data-disabled:text-subtle group-data-selected:opacity-100 motion-reduce:transition-none",
});

type SelectionMode = "single" | "multiple";

/**
 * Props da opção estilizada do Select do Economize.
 *
 * O componente mantém os recursos de identificação, desabilitação, tipagem e customização do
 * ListBoxItem do React Aria, acrescentando o indicador visual de seleção.
 */
export type SelectItemProps<T = object> = Omit<AriaListBoxItemProps<T>, "children"> & {
  /** Conteúdo visível da opção. */
  children: ReactNode;
};

/**
 * Opção reutilizável para o Select do Economize.
 *
 * @see https://react-aria.adobe.com/ListBox
 */
export function SelectItem<T = object>({ children, className, ...itemProps }: SelectItemProps<T>) {
  return (
    <AriaListBoxItem
      {...itemProps}
      className={composeRenderProps(className, (userClassName) =>
        itemStyles({ className: userClassName }),
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <CheckIcon aria-hidden="true" className={itemIndicatorStyles()} weight="bold" />
    </AriaListBoxItem>
  );
}

/**
 * Props do Select estilizado do Economize.
 *
 * A anatomia visual é controlada pelo componente para manter o padrão do TextField. As opções
 * continuam composicionais: forneça filhos como `SelectItem` para preservar a flexibilidade do
 * React Aria.
 */
export type SelectProps<T = object, M extends SelectionMode = "single"> = Omit<
  AriaSelectProps<T, M>,
  | "children"
  | "defaultSelectedKey"
  | "description"
  | "errorMessage"
  | "label"
  | "onSelectionChange"
  | "selectedKey"
> & {
  /** Opções renderizadas dentro da lista. */
  children: ReactNode;
  /** Texto exibido acima do controle. */
  label: string;
  /** Aparência do controle, com uma opção compacta para composições em linha. */
  appearance?: "default" | "compact";
  /** Classes adicionais aplicadas à label do campo. */
  labelClassName?: string;
  /** Texto auxiliar opcional exibido logo abaixo da label. */
  description?: string;
  /** Mensagem de validação exibida na área reservada abaixo do controle. */
  errorMessage?: string;
  /** Mantém uma área reservada para a mensagem de validação quando não houver erro. */
  reserveErrorSpace?: boolean;
  /** Ícone decorativo exibido antes do valor selecionado. */
  leadingIcon?: ReactNode;
  /** Classes adicionais aplicadas ao popover das opções. */
  popoverClassName?: string;
  /** Classes adicionais aplicadas à lista de opções. */
  listBoxClassName?: string;
};

/**
 * Select acessível e estilizado para os formulários do Economize.
 *
 * O componente usa a composição Select + Label + Button + SelectValue + Popover + ListBox do React
 * Aria, compartilhando a altura, tipografia, superfície e estados visuais do TextField.
 */
export function Select<T = object, M extends SelectionMode = "single">({
  children,
  appearance = "default",
  description,
  errorMessage,
  isDisabled = false,
  isInvalid = false,
  label,
  labelClassName,
  leadingIcon,
  listBoxClassName,
  placeholder = "Selecione uma opção",
  popoverClassName,
  reserveErrorSpace = true,
  className,
  ...selectProps
}: SelectProps<T, M>) {
  const hasError = Boolean(errorMessage) || isInvalid;
  const hasVisualError = hasError && !isDisabled;

  return (
    <AriaSelect
      {...selectProps}
      className={composeTailwindRenderProps(className, "flex flex-col min-w-0 gap-1")}
      isDisabled={isDisabled}
      isInvalid={hasError}
      placeholder={placeholder}
    >
      <Label className={labelClassName} isDisabled={isDisabled}>
        {label}
      </Label>
      {description && <Description isDisabled={isDisabled}>{description}</Description>}
      <AriaButton
        className={control({
          appearance,
          disabled: isDisabled,
          invalid: hasVisualError,
        })}
      >
        {leadingIcon && <IconSlot>{leadingIcon}</IconSlot>}
        <SelectValue className={selectValueStyles({ disabled: isDisabled })}>
          {({ selectedText, defaultChildren }) => selectedText || defaultChildren}
        </SelectValue>
        <CaretDownIcon aria-hidden="true" className="size-4 shrink-0 text-subtle" />
      </AriaButton>
      <div className={reserveErrorSpace ? "min-h-4 min-w-0" : "min-w-0"}>
        <FieldError>{errorMessage}</FieldError>
      </div>
      <Popover
        className={cn(
          "z-10 min-w-(--trigger-width) overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-popover",
          popoverClassName,
        )}
      >
        <ListBox
          aria-label={`${label} disponíveis`}
          className={cn(
            "flex max-h-[inherit] flex-col gap-0.5 overflow-auto outline-none",
            listBoxClassName,
          )}
        >
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
