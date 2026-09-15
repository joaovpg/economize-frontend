import { Controller, type Control } from "react-hook-form";

import { Select, SelectItem } from "../../../../components/Select";
import { buildCategoryTree } from "../../../../lib/category-tree";

import type { CategoriaResponse } from "../../../../services/categories/contracts";
import type { CategoryFormData } from "./category-form";
import type { CategoryNode } from "./category-types";

const ROOT_CATEGORY_KEY = "__root__";

function getCategoryDescendantIds(categories: readonly CategoriaResponse[], categoryId: string) {
  const childrenByParentId = new Map<string, string[]>();

  for (const category of categories) {
    if (category.categoriaPaiId === null) {
      continue;
    }

    const children = childrenByParentId.get(category.categoriaPaiId) ?? [];
    children.push(category.id);
    childrenByParentId.set(category.categoriaPaiId, children);
  }

  const descendants = new Set<string>();
  const pendingIds = [categoryId];

  while (pendingIds.length > 0) {
    const parentId = pendingIds.pop();

    if (!parentId) {
      continue;
    }

    for (const childId of childrenByParentId.get(parentId) ?? []) {
      if (descendants.has(childId)) {
        continue;
      }

      descendants.add(childId);
      pendingIds.push(childId);
    }
  }

  return descendants;
}

function getCategoryParentOptions(
  categories: readonly CategoriaResponse[],
  editingCategory: CategoriaResponse | null,
) {
  const excludedIds = new Set<string>();
  const currentParentId = editingCategory?.categoriaPaiId ?? null;

  if (editingCategory) {
    excludedIds.add(editingCategory.id);

    for (const descendantId of getCategoryDescendantIds(categories, editingCategory.id)) {
      excludedIds.add(descendantId);
    }
  }

  const options: { id: string; isDisabled: boolean; label: string }[] = [];
  const appendOptions = (nodes: readonly CategoryNode[], depth: number) => {
    for (const node of nodes) {
      if (!excludedIds.has(node.id) && (node.ativo || node.id === currentParentId)) {
        options.push({
          id: node.id,
          isDisabled: !node.ativo,
          label: `${"— ".repeat(depth)}${node.nome}${node.ativo ? "" : " (inativa)"}`,
        });
      }

      appendOptions(node.children, depth + 1);
    }
  };

  appendOptions(buildCategoryTree(categories), 0);

  return options;
}

type CategoryParentFieldProps = {
  categories: readonly CategoriaResponse[];
  control: Control<CategoryFormData>;
  editingCategory: CategoriaResponse | null;
  errorMessage?: string;
  isDisabled: boolean;
};

export function CategoryParentField({
  categories,
  control,
  editingCategory,
  errorMessage,
  isDisabled,
}: CategoryParentFieldProps) {
  const options = getCategoryParentOptions(categories, editingCategory);

  return (
    <Controller
      control={control}
      name="categoriaPaiId"
      render={({ field }) => (
        <Select
          aria-label="Categoria-pai"
          className="min-w-0"
          errorMessage={errorMessage}
          isDisabled={isDisabled}
          label="Categoria-pai"
          onBlur={field.onBlur}
          onChange={(nextValue) => {
            if (nextValue === null || nextValue === ROOT_CATEGORY_KEY) {
              field.onChange(null);
              return;
            }

            field.onChange(String(nextValue));
          }}
          value={field.value ?? ROOT_CATEGORY_KEY}
        >
          <SelectItem id={ROOT_CATEGORY_KEY} textValue="Categoria raiz">
            Categoria raiz
          </SelectItem>
          {options.map((option) => (
            <SelectItem
              id={option.id}
              isDisabled={option.isDisabled}
              key={option.id}
              textValue={option.label}
            >
              {option.label}
            </SelectItem>
          ))}
        </Select>
      )}
    />
  );
}
