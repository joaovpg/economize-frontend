import { useState, type ReactNode } from "react";
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  Group,
  Input,
  ListBox,
  ListBoxItem as AriaListBoxItem,
  Popover,
  composeRenderProps,
  type ComboBoxProps as AriaComboBoxProps,
  type ListBoxItemProps as AriaListBoxItemProps,
  type Key,
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
  base: "flex w-full min-w-0 cursor-text items-center gap-3 border font-ui text-subtle transition-[background-color,border-color,outline-color] motion-reduce:transition-none",
  variants: {
    appearance: {
      compact:
        "h-9 min-h-9 rounded-lg border-transparent! bg-transparent px-2.5 data-hovered:bg-surface-muted data-pressed:bg-surface-strong",
      default: "h-12 min-h-12 rounded-xl bg-surface px-3.5",
    },
    disabled: {
      false: "",
      true: "cursor-not-allowed border-border bg-surface-muted text-subtle hover:border-border! focus-within:border-border! focus-within:outline-none!",
    },
    invalid: {
      false:
        "border-border hover:border-border-strong focus-within:border-brand! focus-within:outline-brand focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-0",
      true: "border-danger! focus-within:border-danger! focus-within:outline-danger focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-0",
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

const itemStyles = tv({
  base: "group flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-body-small text-foreground outline-none transition-colors duration-150 ease-out data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focused:bg-surface-muted data-selected:bg-brand-soft data-selected:text-brand-hover motion-reduce:transition-none",
});

const itemIndicatorStyles = tv({
  base: "size-4 shrink-0 text-brand opacity-0 transition-opacity duration-150 ease-out group-data-disabled:text-subtle group-data-selected:opacity-100 motion-reduce:transition-none",
});

type SelectionMode = "single" | "multiple";

type SelectionInputState = {
  inputValue: string;
  selectedKey: Key | null;
  selectedText: string;
};

function getSelectedKey(value: unknown): Key | null {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return null;
}

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
  AriaComboBoxProps<T, M>,
  | "allowsCustomValue"
  | "children"
  | "defaultFilter"
  | "defaultInputValue"
  | "description"
  | "errorMessage"
  | "inputValue"
  | "label"
  | "onInputChange"
> & {
  /** Opções renderizadas dentro da lista. */
  children: ReactNode;
  /** Texto exibido acima do controle. */
  label: string;
  /** Aparência do controle, com uma opção compacta para composições em linha. */
  appearance?: "default" | "compact";
  /** Classes adicionais aplicadas à label do campo. */
  labelClassName?: string;
  /** Texto exibido no input quando não há seleção nem busca ativa. */
  placeholder?: string;
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
  /** Texto curto exibido depois da seleção, sem alterar o texto usado para filtrar opções. */
  selectedText?: (key: Key | null) => string;
  /** Chamado quando o texto de busca é apagado em um Select com `selectedText`. */
  onSearchClear?: () => void;
};

/**
 * Select acessível e estilizado para os formulários do Economize.
 *
 * O componente usa a composição ComboBox + Label + Group + Input + Button + Popover + ListBox do
 * React Aria. O texto digitado filtra as opções localmente sem aceitar valores fora da lista.
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
  onSearchClear,
  selectedText,
  ...selectProps
}: SelectProps<T, M>) {
  const hasError = Boolean(errorMessage) || isInvalid;
  const hasVisualError = hasError && !isDisabled;
  const [selectionInputState, setSelectionInputState] = useState<SelectionInputState | null>(null);
  const selectedKey = getSelectedKey(selectProps.value);
  const currentSelectedText = selectedText?.(selectedKey) ?? "";
  const matchesCurrentSelection =
    selectionInputState?.selectedKey === selectedKey &&
    selectionInputState.selectedText === currentSelectedText;
  const selectionInputValue = matchesCurrentSelection
    ? selectionInputState.inputValue
    : currentSelectedText;
  const inputValue = selectedText ? selectionInputValue : undefined;

  function handleInputChange(nextInputValue: string) {
    if (!selectedText) {
      return;
    }

    setSelectionInputState({
      inputValue: nextInputValue,
      selectedKey,
      selectedText: currentSelectedText,
    });

    if (nextInputValue === "") {
      onSearchClear?.();
    }
  }

  const handleChange: NonNullable<SelectProps<T, M>["onChange"]> = (nextValue) => {
    selectProps.onChange?.(nextValue);

    if (selectedText) {
      const nextSelectedKey = getSelectedKey(nextValue);
      const nextSelectedText = selectedText(nextSelectedKey);

      setSelectionInputState({
        inputValue: nextSelectedText,
        selectedKey: nextSelectedKey,
        selectedText: nextSelectedText,
      });
    }
  };

  return (
    <AriaComboBox
      {...selectProps}
      allowsCustomValue={false}
      className={composeTailwindRenderProps(className, "flex flex-col min-w-0 gap-1")}
      isDisabled={isDisabled}
      isInvalid={hasError}
      inputValue={inputValue}
      onChange={handleChange}
      onInputChange={selectedText ? handleInputChange : undefined}
    >
      <Label className={labelClassName} isDisabled={isDisabled}>
        {label}
      </Label>
      {description && <Description isDisabled={isDisabled}>{description}</Description>}
      <Group
        className={control({
          appearance,
          disabled: isDisabled,
          invalid: hasVisualError,
        })}
        isDisabled={isDisabled}
        isInvalid={hasVisualError}
      >
        {leadingIcon && <IconSlot>{leadingIcon}</IconSlot>}
        <Input className={inputStyles({ disabled: isDisabled })} placeholder={placeholder} />
        <AriaButton
          aria-label={`Mostrar opções para ${label}`}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-subtle transition-colors outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-0 data-focus-visible:outline-brand data-focus-visible:outline-solid data-hovered:bg-surface-muted data-pressed:bg-surface-strong motion-reduce:transition-none"
        >
          <CaretDownIcon aria-hidden="true" className="size-4" />
        </AriaButton>
      </Group>
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
          renderEmptyState={() => (
            <span className="px-3 py-2 text-body-small text-subtle">Nenhuma opção encontrada</span>
          )}
        >
          {children}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}
