import type { CategoryTreeNode } from "../../../../lib/category-tree";
import type { CategoriaResponse } from "../../../../services/categories/contracts";

export type CategoryNode = CategoryTreeNode<CategoriaResponse>;

export type PendingCategoryToggle = {
  category: CategoriaResponse;
  nextActive: boolean;
};
