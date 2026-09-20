import { tv } from "tailwind-variants";

import type { VariantProps } from "tailwind-variants";

export const buttonStyles = tv(
  {
    base: "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border border-transparent py-0 text-button no-underline shadow-none outline-none transition-[background-color] duration-150 ease-out data-disabled:cursor-not-allowed data-pending:cursor-wait data-focus-visible:outline-solid data-focus-visible:outline-2 data-focus-visible:outline-offset-2 motion-reduce:transition-none [&>svg]:size-4.5 [&>svg]:shrink-0",
    compoundVariants: [
      {
        class: "!h-auto !min-h-5",
        isIconOnly: false,
        variant: "link",
      },
    ],
    defaultVariants: {
      emphasis: "default",
      isIconOnly: false,
      size: "md",
      variant: "primary",
    },
    variants: {
      emphasis: {
        default: "",
        strong: "font-bold",
      },
      isIconOnly: {
        false: "h-[var(--button-height)] min-w-max px-[var(--button-padding-x)]",
        true: "size-[var(--button-height)] min-w-0 flex-none px-0",
      },
      size: {
        lg: "[--button-height:3rem] [--button-padding-x:1.375rem]",
        md: "[--button-height:2.875rem] [--button-padding-x:1.125rem]",
        sm: "[--button-height:2.25rem] [--button-padding-x:0.875rem]",
      },
      variant: {
        danger:
          "border-danger bg-danger text-brand-foreground data-hovered:border-danger-hover data-hovered:bg-danger-hover data-pressed:border-danger-pressed data-pressed:bg-danger-pressed data-disabled:opacity-[0.42] data-pending:opacity-[0.42] data-focus-visible:outline-danger",
        ghost:
          "border-transparent bg-transparent text-muted data-hovered:bg-surface-muted data-hovered:text-foreground data-pressed:bg-surface-strong data-pressed:text-foreground data-disabled:opacity-[0.42] data-pending:opacity-[0.42] data-focus-visible:outline-brand",
        link: "!rounded !border-0 !bg-transparent !px-0 text-brand data-hovered:text-brand-hover data-hovered:underline data-hovered:underline-offset-3 data-pressed:text-brand-pressed data-pressed:underline data-pressed:underline-offset-3 data-focus-visible:outline-brand data-disabled:text-muted data-disabled:no-underline data-disabled:opacity-100 data-pending:text-muted data-pending:no-underline data-pending:opacity-100",
        primary:
          "border-brand bg-brand text-brand-foreground data-hovered:border-brand-hover data-hovered:bg-brand-hover data-pressed:border-brand-pressed data-pressed:bg-brand-pressed data-disabled:opacity-[0.42] data-pending:opacity-[0.42] data-focus-visible:outline-brand",
        secondary:
          "border-border bg-surface text-foreground data-hovered:border-border-strong data-hovered:bg-surface-muted data-pressed:border-border-strong data-pressed:bg-surface-strong data-disabled:opacity-[0.42] data-pending:opacity-[0.42] data-focus-visible:outline-brand",
      },
    },
  },
  { twMerge: false },
);

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;
