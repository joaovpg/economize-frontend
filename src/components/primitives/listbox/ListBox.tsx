import {
  ListBox as AriaListBox,
  type ListBoxProps as AriaListBoxProps,
} from "react-aria-components";

/** Lista de opções com rolagem interna e estado vazio. Usada pelo Select. */
export function ListBox<T extends object>(props: AriaListBoxProps<T>) {
  return (
    <AriaListBox
      {...props}
      className="flex max-h-[calc(var(--spacing-24)*3)] min-h-0 flex-col gap-px overflow-auto outline-none"
      renderEmptyState={() => (
        <span className="block px-3 py-2 text-body text-muted">Nenhuma opção encontrada</span>
      )}
    />
  );
}
