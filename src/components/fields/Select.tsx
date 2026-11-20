import type { ReactNode, Ref } from "react";
import {
  Autocomplete,
  Button as AriaButton,
  type Key,
  Select as AriaSelect,
  SelectValue,
  useFilter,
} from "react-aria-components";

import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";

import { cn } from "../../utils/tailwind";
import { FieldError } from "../primitives/field/FieldError";
import { FieldHeader } from "../primitives/field/FieldHeader";
import { FieldIcon } from "../primitives/field/FieldIcon";
import { fieldBoxStyles } from "../primitives/field/fieldStyles";
import { ListBox } from "../primitives/listbox/ListBox";
import { Popover } from "../primitives/listbox/Popover";
import { SearchInput } from "../primitives/listbox/SearchInput";
import { fieldRootClassName, isFieldInvalid, type FieldBaseProps } from "./field-props";

export { ListBoxItem as SelectItem } from "../primitives/listbox/ListBoxItem";

export type SelectProps = Omit<FieldBaseProps, "isReadOnly"> & {
  /** Opções criadas com `SelectItem`. */
  children: ReactNode;
  /** Chave da opção selecionada. `null` deixa o campo sem seleção. */
  value?: Key | null;
  /** Recebe a chave escolhida, ou `null` quando não há seleção. */
  onChange?: (value: Key | null) => void;
  /** Nome do campo para formulários nativos. */
  name?: string;
  onBlur?: () => void;
  /** Referência do botão do campo, usada pelo React Hook Form para foco em erros. */
  ref?: Ref<HTMLButtonElement>;
  /** Texto exibido quando não há seleção. */
  placeholder?: string;
  /** Mostra uma busca no topo da lista e filtra as opções pelo texto. Padrão: false. */
  isSearchable?: boolean;
  /** Ícone decorativo antes do valor selecionado. */
  leadingIcon?: ReactNode;
  /** Nome acessível quando não há rótulo visível. */
  "aria-label"?: string;
};

/**
 * Seleção de uma opção entre uma lista. Com `isSearchable`, a lista ganha uma busca que filtra pelo
 * texto das opções. O botão mostra o `textValue` do item escolhido, não o conteúdo visual dele.
 */
export function Select({
  children,
  label,
  description,
  errorMessage,
  isInvalid,
  reserveErrorSpace = true,
  isRequired,
  isDisabled,
  size = "md",
  className,
  placeholder = "Selecione",
  isSearchable = false,
  leadingIcon,
  ref,
  "aria-label": ariaLabel,
  ...selectProps
}: SelectProps) {
  const { contains } = useFilter({ sensitivity: "base" });
  const listBox = <ListBox aria-label={label ?? ariaLabel}>{children}</ListBox>;

  return (
    <AriaSelect
      {...selectProps}
      aria-label={ariaLabel}
      className={cn(fieldRootClassName, className)}
      isDisabled={isDisabled}
      isInvalid={isFieldInvalid({ errorMessage, isInvalid })}
      isRequired={isRequired}
      validationBehavior="aria"
    >
      <FieldHeader description={description} isRequired={isRequired} label={label} />
      <AriaButton
        className={cn(
          "flex w-full min-w-0 cursor-pointer items-center gap-2 text-left outline-none",
          fieldBoxStyles({ focus: "trigger", size }),
        )}
        ref={ref}
      >
        {leadingIcon && <FieldIcon>{leadingIcon}</FieldIcon>}
        <SelectValue className="min-w-0 flex-1 truncate text-body data-placeholder:text-muted max-md:text-md">
          {({ isPlaceholder, selectedText }) => (isPlaceholder ? placeholder : selectedText)}
        </SelectValue>
        <FieldIcon>
          <CaretDownIcon />
        </FieldIcon>
      </AriaButton>
      <FieldError reserveSpace={reserveErrorSpace}>{errorMessage}</FieldError>
      <Popover placement="bottom start">
        {isSearchable ? (
          <Autocomplete filter={contains}>
            <SearchInput />
            {listBox}
          </Autocomplete>
        ) : (
          listBox
        )}
      </Popover>
    </AriaSelect>
  );
}
