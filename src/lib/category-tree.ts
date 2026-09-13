export type CategoryTreeItem = {
  categoriaPaiId: string | null;
  id: string;
};

export type CategoryTreeNode<TCategory extends CategoryTreeItem> = TCategory & {
  children: CategoryTreeNode<TCategory>[];
};

export function buildCategoryTree<TCategory extends CategoryTreeItem>(
  categories: readonly TCategory[],
): CategoryTreeNode<TCategory>[] {
  const categoryById = new Map(
    categories.map((category): [string, TCategory] => [category.id, category]),
  );
  const childrenByParentId = new Map<string, TCategory[]>();

  for (const category of categories) {
    if (category.categoriaPaiId === null) {
      continue;
    }

    const children = childrenByParentId.get(category.categoriaPaiId) ?? [];
    children.push(category);
    childrenByParentId.set(category.categoriaPaiId, children);
  }

  const builtIds = new Set<string>();

  const buildNode = (
    category: TCategory,
    ancestorIds: ReadonlySet<string>,
  ): CategoryTreeNode<TCategory> | null => {
    if (builtIds.has(category.id)) {
      return null;
    }

    builtIds.add(category.id);
    const nextAncestorIds = new Set(ancestorIds);
    nextAncestorIds.add(category.id);

    return {
      ...category,
      children: (childrenByParentId.get(category.id) ?? [])
        .filter((child) => !ancestorIds.has(child.id))
        .map((child) => buildNode(child, nextAncestorIds))
        .filter((child): child is CategoryTreeNode<TCategory> => child !== null),
    };
  };

  const rootCategories = categories.filter(
    (category) => category.categoriaPaiId === null || !categoryById.has(category.categoriaPaiId),
  );

  const tree: CategoryTreeNode<TCategory>[] = [];

  for (const category of rootCategories) {
    const node = buildNode(category, new Set());

    if (node) {
      tree.push(node);
    }
  }

  for (const category of categories) {
    if (builtIds.has(category.id)) {
      continue;
    }

    const node = buildNode(category, new Set());

    if (node) {
      tree.push(node);
    }
  }

  return tree;
}
