import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";

import { Button } from "../../../../components/Button";
import { Switch } from "../../../../components/Switch";
import { cn } from "../../../../utils/tailwind";

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
          "flex min-w-0 items-center justify-between gap-3 rounded-control border border-border bg-surface px-3 py-2",
          !node.ativo && "bg-surface-muted",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              "size-2 shrink-0 rounded-full bg-success",
              !node.ativo && "bg-border-strong",
            )}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-body-strong text-foreground">{node.nome}</span>
            <span className="flex flex-wrap items-center gap-2 text-caption text-muted">
              <span
                className={cn(
                  "rounded-full border px-2 py-px text-caption",
                  node.ativo
                    ? "border-success bg-success-soft text-success"
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
            isDisabled={pendingCategoryId !== null}
            isSelected={node.ativo}
            onChange={(nextActive) => onToggle(node, nextActive)}
          />
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
