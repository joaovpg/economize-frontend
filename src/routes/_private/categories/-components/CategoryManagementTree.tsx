import { buildCategoryTree } from "../../../../lib/category-tree";
import { CategoryTreeNode } from "./CategoryTreeNode";

import type { CategoriaResponse } from "../../../../services/categories/contracts";
import type { CategoryNode } from "./category-types";

function normalizeCategorySearch(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function filterCategoryTree(tree: readonly CategoryNode[], query: string): CategoryNode[] {
  const normalizedQuery = normalizeCategorySearch(query);

  if (normalizedQuery.length === 0) {
    return [...tree];
  }

  const filterNode = (node: CategoryNode): CategoryNode | null => {
    const children = node.children
      .map(filterNode)
      .filter((child): child is CategoryNode => child !== null);
    const matches = normalizeCategorySearch(node.nome).includes(normalizedQuery);

    if (!matches && children.length === 0) {
      return null;
    }

    return { ...node, children };
  };

  return tree.map(filterNode).filter((node): node is CategoryNode => node !== null);
}

function countCategoryTreeNodes(tree: readonly CategoryNode[]): number {
  return tree.reduce((count, node) => count + 1 + countCategoryTreeNodes(node.children), 0);
}

type CategoryManagementTreeProps = {
  categories: readonly CategoriaResponse[];
  onEdit: (category: CategoriaResponse) => void;
  onToggle: (category: CategoriaResponse, nextActive: boolean) => void;
  pendingCategoryId: string | null;
  searchQuery: string;
};

export function CategoryManagementTree({
  categories,
  onEdit,
  onToggle,
  pendingCategoryId,
  searchQuery,
}: CategoryManagementTreeProps) {
  const tree = filterCategoryTree(buildCategoryTree(categories), searchQuery);
  const filteredCategoryCount = countCategoryTreeNodes(tree);
  const hasSearch = normalizeCategorySearch(searchQuery).length > 0;
  const resultMessage = hasSearch
    ? `${filteredCategoryCount} ${filteredCategoryCount === 1 ? "categoria encontrada" : "categorias encontradas"}.`
    : `${filteredCategoryCount} ${filteredCategoryCount === 1 ? "categoria exibida" : "categorias exibidas"}.`;

  return (
    <>
      <output aria-live="polite" className="sr-only">
        {resultMessage}
      </output>
      {tree.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-strong p-4 text-body-small text-muted">
          {hasSearch ? "Nenhuma categoria encontrada." : "Nenhuma categoria cadastrada."}
        </p>
      ) : (
        <ul aria-label="Categorias cadastradas" className="flex list-none flex-col gap-2 p-0">
          {tree.map((node) => (
            <CategoryTreeNode
              key={node.id}
              node={node}
              onEdit={onEdit}
              onToggle={onToggle}
              pendingCategoryId={pendingCategoryId}
            />
          ))}
        </ul>
      )}
    </>
  );
}
