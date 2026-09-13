import {
  Button as AriaButton,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";
import { Controller, type Control } from "react-hook-form";

import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";

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
          className="flex min-w-0 flex-col gap-1"
          isDisabled={isDisabled}
          isInvalid={Boolean(errorMessage)}
          onBlur={field.onBlur}
          onSelectionChange={(key) => {
            field.onChange(key === ROOT_CATEGORY_KEY ? null : String(key));
          }}
          selectedKey={field.value ?? ROOT_CATEGORY_KEY}
        >
          <Label className="text-label text-foreground">Categoria-pai</Label>
          <AriaButton className="flex min-h-12 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 text-body-small text-foreground transition-[background-color,border-color,outline-color] duration-150 ease-out outline-none hover:border-border-strong focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-brand data-disabled:cursor-not-allowed data-disabled:bg-surface-muted data-disabled:text-subtle">
            <SelectValue className="min-w-0 flex-1 truncate text-left" />
            <CaretDownIcon aria-hidden="true" className="size-4 shrink-0 text-subtle" />
          </AriaButton>
          <div className="min-h-4">
            {errorMessage && (
              <FieldError className="block min-h-4 text-validation text-danger">
                {errorMessage}
              </FieldError>
            )}
          </div>
          <Popover className="z-10 min-w-60 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-popover">
            <ListBox
              aria-label="Categorias-pai disponíveis"
              className="flex max-h-60 flex-col gap-0.5 overflow-auto p-0 outline-none"
            >
              <ListBoxItem
                className="cursor-pointer rounded-lg px-3 py-2 text-body-small text-foreground outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focused:bg-surface-muted data-selected:bg-brand-soft data-selected:text-brand-hover"
                id={ROOT_CATEGORY_KEY}
                textValue="Categoria raiz"
              >
                Categoria raiz
              </ListBoxItem>
              {options.map((option) => (
                <ListBoxItem
                  className="cursor-pointer rounded-lg px-3 py-2 text-body-small text-foreground outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focused:bg-surface-muted data-selected:bg-brand-soft data-selected:text-brand-hover"
                  id={option.id}
                  isDisabled={option.isDisabled}
                  key={option.id}
                  textValue={option.label}
                >
                  {option.label}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
        </Select>
      )}
    />
  );
}
