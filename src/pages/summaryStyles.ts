import { tv } from "tailwind-variants";

export const summaryStyles = {
  page: "min-w-0",
  layout: "grid min-w-0 grid-cols-[18.25rem_minmax(0,1fr)] items-start max-[48rem]:block",
  filtersHeader: "flex items-start justify-between gap-4",
  filterCount: "m-0 text-subtle",
  filterClose: "!hidden max-[48rem]:!inline-flex",
  filterForm: "mt-5 grid gap-5.5",
  filterGroup: "grid gap-2.5",
  filterFieldset: "min-w-0 border-0 p-0",
  filterLabel: "m-0 text-caption font-bold uppercase tracking-[0.04em] text-muted",
  filterControl:
    "flex min-h-[2.625rem] min-w-0 items-center gap-2.5 rounded-xl border border-border bg-[color-mix(in_oklch,var(--color-surface)_70%,transparent)] px-3 text-subtle transition-[background-color,border-color] duration-150 ease-out motion-reduce:transition-none hover:border-border-strong hover:bg-surface-muted focus-within:border-brand focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand [&>svg]:size-4 [&>svg]:shrink-0",
  filterInput:
    "min-w-0 flex-1 border-0 bg-transparent text-body-small text-foreground caret-brand outline-none placeholder:text-subtle",
  filterTree: "grid gap-1.75",
  filterChildren: "mt-0.5 mb-0.5 ml-[1.625rem] grid gap-1.75",
  filterOption:
    "flex min-h-[1.625rem] cursor-pointer items-center gap-2 text-caption text-muted max-[48rem]:min-h-11",
  filterOptionGroup: "font-medium",
  filterBox:
    "grid size-4 shrink-0 place-items-center rounded-[0.3125rem] border border-border-strong bg-[color-mix(in_oklch,var(--color-surface)_70%,transparent)] text-brand data-[partial=true]:border-brand data-[partial=true]:bg-brand-soft [&>svg]:size-2.75",
  filterCaret: "ml-auto size-3.5 shrink-0 text-subtle",
  filterFooter: "mt-0.5 grid grid-cols-2 gap-2",
  main: "min-w-0 p-[2rem_1.75rem_2.5rem] max-[48rem]:p-[1.5rem_1rem_2rem]",
  pageHead:
    "mb-5.5 flex items-end justify-between gap-4 max-[48rem]:mb-4 max-[48rem]:grid max-[48rem]:items-start max-[48rem]:gap-4",
  pageDescription: "m-0 mt-2.5 text-body-small text-muted",
  pageActions: "flex flex-wrap items-center justify-between gap-4",
  filterTrigger: "!hidden max-[48rem]:!inline-flex",
  activeFilters: "mb-3.5 hidden gap-2.5 max-[48rem]:grid",
  activeFilterLabel: "text-subtle uppercase",
  filterChips: "flex flex-wrap gap-2",
  filterChip:
    "rounded-full border border-border bg-[color-mix(in_oklch,var(--color-surface)_60%,transparent)] px-2.5 py-1.5 text-caption text-muted",
  ledgerCard:
    "mb-4 min-w-0 overflow-visible rounded-2xl border border-border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_78%,transparent),color-mix(in_oklch,var(--color-canvas)_92%,transparent))] shadow-card",
  card: "min-w-0 rounded-2xl border border-border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_78%,transparent),color-mix(in_oklch,var(--color-canvas)_92%,transparent))] p-4.5 shadow-card",
  ledgerHeader:
    "flex min-h-[3.375rem] items-center justify-between gap-4 rounded-t-2xl border-b border-border bg-[color-mix(in_oklch,var(--color-surface-muted)_74%,transparent)] px-4 py-3",
  cardTitle: "m-0 text-title-compact font-bold text-foreground",
  ledgerTools: "flex items-center gap-1",
  ledgerHelp: "relative",
  ledgerHelpTrigger:
    "grid size-9 cursor-pointer list-none place-items-center rounded-lg text-subtle hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&>svg]:size-4.5 [&::-webkit-details-marker]:hidden",
  ledgerHelpCopy:
    "absolute top-[calc(100%+0.5rem)] right-0 z-2 m-0 w-[min(16rem,70vw)] rounded-xl border border-border bg-surface p-3 text-caption text-muted shadow-popover",
  ledgerBody: "grid gap-1.5 p-4",
  ledgerRow:
    "flex min-h-8 items-center justify-between gap-4 text-body-small text-muted max-[28rem]:gap-3",
  ledgerValue: "whitespace-nowrap text-subtle font-semibold tabular-nums",
  ledgerExpense: "text-danger",
  ledgerDivider: "my-1.5 mb-2 h-px bg-border-strong",
  ledgerTotal:
    "flex items-baseline justify-between gap-4 text-caption text-muted max-[28rem]:gap-3",
  ledgerTotalValue:
    "whitespace-nowrap font-ui text-3xl font-bold leading-none tracking-[-0.045em] text-foreground tabular-nums",
  contentGrid:
    "grid grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] gap-4 max-[48rem]:grid-cols-1",
  cardHeading: "flex items-baseline justify-between gap-4",
  cardPeriod: "text-subtle",
  cardAction: "text-caption",
  categoryChart: "mt-5 grid list-none gap-3.5 p-0",
  emptyState: "rounded-xl border border-dashed border-border-strong p-3.5 text-caption text-muted",
  categoryRow: "grid gap-1.75",
  categoryLabel: "flex items-center justify-between gap-4 text-caption text-muted",
  categoryValue: "whitespace-nowrap text-subtle font-semibold tabular-nums",
  categoryTrack: "h-2.25 overflow-hidden rounded-full bg-surface-muted",
  categoryBar: "block h-full w-(--category-share) rounded-[inherit] bg-brand",
  movementList: "mt-4 grid list-none gap-2.5 p-0",
  movementItem:
    "flex min-w-0 items-center justify-between gap-4 rounded-[0.875rem] border border-border bg-[color-mix(in_oklch,var(--color-surface)_48%,transparent)] px-3 py-[0.6875rem] max-[28rem]:items-start max-[28rem]:flex-col",
  movementCopy: "min-w-0",
  movementPrimary: "block truncate font-ui text-caption font-bold text-foreground",
  movementSecondary: "mt-0.75 block truncate font-ui text-xs text-subtle",
  demoNote: "m-0 mt-4 text-caption text-subtle",
  selectRoot: "min-w-0",
  selectValue: "min-w-0 flex-1 truncate",
  selectPopover:
    "z-10 min-w-[12rem] overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-popover",
  selectList: "grid max-h-60 gap-0.5 overflow-auto p-0 outline-none",
  selectOption:
    "cursor-pointer rounded-lg px-3 py-2 text-body-small text-foreground outline-none data-[focused]:bg-surface-muted data-[selected]:bg-brand-soft data-[selected]:text-brand-hover",
} as const;

export const summaryFiltersStyles = tv({
  base: "sticky top-6 self-start m-[1.5rem_0_1.5rem_1.5rem] max-h-[calc(100svh-3rem)] overflow-auto rounded-2xl border border-border bg-[linear-gradient(180deg,color-mix(in_oklch,var(--color-surface)_78%,transparent),color-mix(in_oklch,var(--color-canvas)_94%,transparent))] p-5 shadow-card max-[48rem]:static max-[48rem]:m-[0_1rem_1rem] max-[48rem]:max-h-none max-[48rem]:hidden",
  variants: {
    open: {
      false: "",
      true: "max-[48rem]:!block",
    },
  },
});

export const summaryCheckboxStyles = tv({
  base: "flex min-h-[1.625rem] cursor-pointer items-center gap-2 text-caption text-muted data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-brand max-[48rem]:min-h-11",
  variants: {
    placement: {
      filter: "",
      ledger: "mb-1 min-h-8 gap-2.25",
    },
  },
  defaultVariants: {
    placement: "filter",
  },
});

export const summaryCheckboxIndicatorStyles = tv({
  base: "grid size-4 shrink-0 place-items-center rounded-[0.3125rem] border border-border-strong bg-[color-mix(in_oklch,var(--color-surface)_70%,transparent)] text-brand [&>svg]:size-2.75",
  variants: {
    selected: {
      false: "",
      true: "border-brand bg-brand-soft",
    },
  },
});

export const summarySelectTriggerStyles = tv({
  base: "flex min-w-0 cursor-pointer items-center gap-2 border border-border text-muted transition-[background-color,border-color] duration-150 ease-out motion-reduce:transition-none hover:border-border-strong hover:bg-surface-muted focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&>svg]:size-4 [&>svg]:shrink-0",
  variants: {
    placement: {
      filter:
        "min-h-[2.625rem] w-full rounded-xl bg-[color-mix(in_oklch,var(--color-surface)_70%,transparent)] px-3",
      header:
        "min-h-[2.625rem] rounded-full bg-[color-mix(in_oklch,var(--color-surface)_68%,transparent)] px-3.5 font-ui text-xs leading-4 font-semibold max-[48rem]:flex-1 max-[48rem]:justify-center",
    },
  },
});

export const summaryStatusStyles = tv({
  base: "inline-flex flex-none items-center rounded-full border px-2 py-1 font-ui text-xs leading-4 font-semibold tabular-nums whitespace-nowrap",
  variants: {
    kind: {
      income:
        "border-[color-mix(in_oklch,var(--color-success)_24%,var(--color-border))] bg-success-soft text-success",
      expense:
        "border-[color-mix(in_oklch,var(--color-danger)_24%,var(--color-border))] bg-danger-soft text-danger",
    },
  },
});
