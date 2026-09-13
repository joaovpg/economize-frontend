import { Switch } from "react-aria-components";

import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { cn } from "tailwind-variants";

import { Button } from "../../../../components/Button";

import type { CategoriaResponse } from "../../../../services/categories/contracts";
import type { CategoryNode } from "./category-types";

type CategoryTreeNodeProps = {
  node: CategoryNode;
  onEdit: (category: CategoriaResponse) => void;
  onToggle: (category: CategoriaResponse, nextActive: boolean) => void;
  pendingCategoryId: string | null;
};

export function CategoryTreeNode({
  node,
  onEdit,
  onToggle,
  pendingCategoryId,
}: CategoryTreeNodeProps) {
  const isPending = pendingCategoryId === node.id;

  return (
    <li className="flex min-w-0 flex-col gap-2">
      <div
        className={cn(
          "flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-[color-mix(in_oklch,var(--color-surface)_58%,transparent)] px-3 py-2.5",
          !node.ativo && "bg-surface-muted/55",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              "size-2.5 shrink-0 rounded-full bg-brand",
              !node.ativo && "bg-border-strong",
            )}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-label text-foreground">{node.nome}</span>
            <span className="flex flex-wrap items-center gap-2 text-caption text-subtle">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-caption-strong",
                  node.ativo
                    ? "border-success/25 bg-success-soft text-success"
                    : "border-border bg-surface text-muted",
                )}
              >
                {node.ativo ? "Ativa" : "Inativa"}
              </span>
              {node.children.length > 0 && (
                <span>
                  {node.children.length} {node.children.length === 1 ? "filha" : "filhas"}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            aria-label={`Editar categoria ${node.nome}`}
            isDisabled={pendingCategoryId !== null}
            isIconOnly
            onPress={() => onEdit(node)}
            size="sm"
            variant="ghost"
          >
            <PencilSimpleIcon aria-hidden="true" />
          </Button>
          <Switch
            aria-label={`${node.ativo ? "Inativar" : "Ativar"} categoria ${node.nome}`}
            className="group inline-flex min-h-9 cursor-pointer items-center rounded-lg p-1 transition-[background-color] outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-visible:bg-surface-muted"
            isDisabled={pendingCategoryId !== null}
            isSelected={node.ativo}
            onChange={(nextActive) => onToggle(node, nextActive)}
          >
            <span className="relative block h-5 w-9 rounded-full bg-border-strong transition-[background-color] duration-150 ease-out group-data-selected:bg-brand motion-reduce:transition-none">
              <span className="absolute top-0.5 left-0.5 block size-4 rounded-full bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.18)] transition-transform duration-150 ease-out group-data-selected:translate-x-4 motion-reduce:transition-none" />
            </span>
          </Switch>
          {isPending && <span className="sr-only">Salvando alteração</span>}
        </div>
      </div>
      {node.children.length > 0 && (
        <ul className="ml-4 flex list-none flex-col gap-2 border-l border-border pl-3">
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              onEdit={onEdit}
              onToggle={onToggle}
              pendingCategoryId={pendingCategoryId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
