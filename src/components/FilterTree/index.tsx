import type { ReactNode } from "react";
import { Tree, TreeItem, TreeItemContent, type Selection } from "react-aria-components";

import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";

import { Button } from "../Button";
import { Checkbox } from "../Checkbox";

const filterTreeStyles = {
  tree: "grid gap-1.75 outline-none",
  item: "min-w-0 outline-none",
  content:
    "flex min-h-[1.625rem] min-w-0 items-center gap-2 rounded-lg pl-[calc((var(--tree-item-level)-1)*1rem)] text-caption text-muted max-[48rem]:min-h-11",
  contentFocus: "outline-2 outline-offset-2 outline-solid outline-brand",
  contentGroup: "font-medium",
  checkbox: "flex-1",
  label: "min-w-0 truncate ",
  chevron: "ml-auto size-[1.125rem]! shrink-0 rounded-[0.3125rem]!",
} as const;

export type FilterTreeItem<TSelectionKey extends string = string> =
  | {
      id: TSelectionKey;
      label: string;
    }
  | {
      children: readonly FilterTreeItem<TSelectionKey>[];
      id: string;
      label: string;
    };

type FilterTreeProps<TSelectionKey extends string> = {
  ariaLabel: string;
  items: readonly FilterTreeItem<TSelectionKey>[];
  onSelectionChange: (selection: TSelectionKey[]) => void;
  selectedKeys: readonly TSelectionKey[];
};

function hasChildren<TSelectionKey extends string>(
  item: FilterTreeItem<TSelectionKey>,
): item is Extract<
  FilterTreeItem<TSelectionKey>,
  { children: readonly FilterTreeItem<TSelectionKey>[] }
> {
  return "children" in item && item.children.length > 0;
}

function getLeafKeys<TSelectionKey extends string>(
  item: FilterTreeItem<TSelectionKey>,
): TSelectionKey[] {
  return hasChildren(item) ? item.children.flatMap(getLeafKeys) : [item.id];
}

function getAllLeafKeys<TSelectionKey extends string>(
  items: readonly FilterTreeItem<TSelectionKey>[],
) {
  return items.flatMap(getLeafKeys);
}

function getAllTreeItems<TSelectionKey extends string>(
  items: readonly FilterTreeItem<TSelectionKey>[],
): FilterTreeItem<TSelectionKey>[] {
  return items.flatMap<FilterTreeItem<TSelectionKey>>((item) => {
    if (hasChildren(item)) {
      return [item, ...getAllTreeItems(item.children)];
    }

    return [item];
  });
}

function getBranchKeys<TSelectionKey extends string>(
  items: readonly FilterTreeItem<TSelectionKey>[],
): string[] {
  return items.flatMap<string>((item) => {
    if (hasChildren(item)) {
      return [item.id, ...getBranchKeys(item.children)];
    }

    return [];
  });
}

function getTreeSelectionKeys<TSelectionKey extends string>(
  items: readonly FilterTreeItem<TSelectionKey>[],
  selectedKeys: ReadonlySet<TSelectionKey>,
) {
  const selectedTreeKeys = new Set<string>();

  for (const item of items) {
    const leafKeys = getLeafKeys(item);

    if (leafKeys.every((key) => selectedKeys.has(key))) {
      selectedTreeKeys.add(item.id);
    }

    if (hasChildren(item)) {
      for (const key of getTreeSelectionKeys(item.children, selectedKeys)) {
        selectedTreeKeys.add(key);
      }
    }
  }

  return selectedTreeKeys;
}

function getSelectionState<TSelectionKey extends string>(
  item: FilterTreeItem<TSelectionKey>,
  selectedKeys: ReadonlySet<TSelectionKey>,
) {
  const leafKeys = getLeafKeys(item);
  const selectedLeafCount = leafKeys.filter((key) => selectedKeys.has(key)).length;

  return {
    isIndeterminate: selectedLeafCount > 0 && selectedLeafCount < leafKeys.length,
    isSelected: leafKeys.length > 0 && selectedLeafCount === leafKeys.length,
  };
}

export function FilterTree<TSelectionKey extends string>({
  ariaLabel,
  items,
  onSelectionChange,
  selectedKeys,
}: FilterTreeProps<TSelectionKey>) {
  const selectedLeafKeys = new Set(selectedKeys);
  const treeItems: FilterTreeItem<TSelectionKey>[] = getAllTreeItems(items);
  const currentTreeSelection = getTreeSelectionKeys(items, selectedLeafKeys);
  const allLeafKeys = getAllLeafKeys(items);
  const itemById = new Map<string, FilterTreeItem<TSelectionKey>>(
    treeItems.map((item): [string, FilterTreeItem<TSelectionKey>] => [item.id, item]),
  );

  const handleSelectionChange = (selection: Selection) => {
    if (selection === "all") {
      onSelectionChange(allLeafKeys);
      return;
    }

    const nextTreeSelection = new Set(Array.from(selection, (key) => String(key)));
    const changedKeys = new Set<string>();

    for (const key of currentTreeSelection) {
      if (!nextTreeSelection.has(key)) {
        changedKeys.add(key);
      }
    }

    for (const key of nextTreeSelection) {
      if (!currentTreeSelection.has(key)) {
        changedKeys.add(key);
      }
    }

    const nextSelectedLeafKeys = new Set(selectedKeys);

    for (const key of changedKeys) {
      const item = itemById.get(key);

      if (!item) {
        continue;
      }

      const leafKeys = getLeafKeys(item);

      if (nextTreeSelection.has(key)) {
        for (const leafKey of leafKeys) {
          nextSelectedLeafKeys.add(leafKey);
        }
      } else {
        for (const leafKey of leafKeys) {
          nextSelectedLeafKeys.delete(leafKey);
        }
      }
    }

    onSelectionChange(allLeafKeys.filter((key) => nextSelectedLeafKeys.has(key)));
  };

  const renderItem = (item: FilterTreeItem<TSelectionKey>): ReactNode => {
    const selectionState = getSelectionState(item, selectedLeafKeys);

    return (
      <TreeItem
        className={filterTreeStyles.item}
        focusMode="row"
        id={item.id}
        key={item.id}
        textValue={item.label}
      >
        <TreeItemContent>
          {({ hasChildItems, isExpanded, isFocusVisible }) => (
            <div
              className={[
                filterTreeStyles.content,
                hasChildren(item) ? filterTreeStyles.contentGroup : "",
                isFocusVisible ? filterTreeStyles.contentFocus : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Checkbox
                className={filterTreeStyles.checkbox}
                focusRing="none"
                isIndeterminate={selectionState.isIndeterminate}
                labelClassName={filterTreeStyles.label}
                slot="selection"
              >
                {item.label}
              </Checkbox>
              {hasChildItems && (
                <Button
                  aria-label={isExpanded ? `Recolher ${item.label}` : `Expandir ${item.label}`}
                  className={filterTreeStyles.chevron}
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  slot="chevron"
                >
                  <CaretDownIcon aria-hidden="true" className={isExpanded ? "" : "-rotate-90"} />
                </Button>
              )}
            </div>
          )}
        </TreeItemContent>
        {hasChildren(item) && item.children.map(renderItem)}
      </TreeItem>
    );
  };

  return (
    <Tree
      aria-label={ariaLabel}
      className={filterTreeStyles.tree}
      defaultExpandedKeys={getBranchKeys(items)}
      onSelectionChange={handleSelectionChange}
      selectedKeys={currentTreeSelection}
      selectionBehavior="toggle"
      selectionMode="multiple"
    >
      {items.map(renderItem)}
    </Tree>
  );
}
