import { SearchField } from "react-aria-components";

import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

import { FieldGroup } from "../field/FieldGroup";
import { FieldIcon } from "../field/FieldIcon";
import { Input } from "../field/Input";

export type SearchInputProps = {
  /** Nome acessível da busca. */
  "aria-label"?: string;
  /** Texto exibido quando a busca está vazia. */
  placeholder?: string;
};

/** Busca no topo do popover do Select quando `isSearchable`. Recebe o foco ao abrir. */
export function SearchInput({
  "aria-label": ariaLabel = "Buscar opção",
  placeholder = "Buscar",
}: SearchInputProps) {
  return (
    <SearchField
      aria-label={ariaLabel}
      // oxlint-disable-next-line jsx-a11y/no-autofocus -- Autocomplete: a busca precisa receber o foco ao abrir o popover do Select.
      autoFocus
      className="group/field mb-1 min-w-0"
    >
      <FieldGroup size="sm">
        <FieldIcon>
          <MagnifyingGlassIcon />
        </FieldIcon>
        <Input placeholder={placeholder} />
      </FieldGroup>
    </SearchField>
  );
}
