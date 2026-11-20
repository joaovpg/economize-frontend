import type { ReactNode } from "react";
import {
  ListBoxItem as AriaListBoxItem,
  type ListBoxItemProps as AriaListBoxItemProps,
} from "react-aria-components";

import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";

/** Opção da lista. Mostra um check à direita quando selecionada; a seleção não tem fundo. */
export function ListBoxItem<T extends object>({
  children,
  ...itemProps
}: Omit<AriaListBoxItemProps<T>, "children" | "className"> & { children: ReactNode }) {
  return (
    <AriaListBoxItem
      {...itemProps}
      className="flex min-h-10 cursor-pointer items-center gap-3 rounded-control px-3 text-body text-foreground transition-colors outline-none data-disabled:cursor-not-allowed data-disabled:text-muted data-focused:bg-surface-muted data-hovered:bg-surface-muted motion-reduce:transition-none max-md:min-h-touch"
    >
      {({ isSelected }) => (
        <>
          <span className="min-w-0 flex-1 truncate">{children}</span>
          {isSelected && (
            <CheckIcon aria-hidden="true" weight="bold" className="size-4 shrink-0 text-brand" />
          )}
        </>
      )}
    </AriaListBoxItem>
  );
}
