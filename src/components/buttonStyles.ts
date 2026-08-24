import { tv } from "tailwind-variants";

export const buttonStyles = tv({
  base: "inline-flex h-[var(--button-height)] min-w-max cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent px-[var(--button-padding-x)] py-0 font-ui text-[0.875rem] leading-5 font-[650] no-underline outline-none transition-[background-color] duration-150 ease-out data-disabled:cursor-not-allowed data-pending:cursor-wait data-focus-visible:outline-solid data-focus-visible:outline-2 data-focus-visible:outline-offset-2 motion-reduce:transition-none [&>svg]:size-[18px] [&>svg]:shrink-0",
  variants: {
    size: {
      sm: "[--button-height:2.25rem] [--button-padding-x:0.875rem] text-[0.8125rem] leading-[1.125rem]",
      md: "[--button-height:2.75rem] [--button-padding-x:1.125rem]",
      lg: "[--button-height:3rem] [--button-padding-x:1.375rem] text-[0.9375rem] leading-[1.375rem]",
    },
    variant: {
      primary:
        "border-brand bg-brand text-brand-foreground data-hovered:border-brand-hover data-hovered:bg-brand-hover data-pressed:border-brand-pressed data-pressed:bg-brand-pressed data-disabled:opacity-[0.42] data-pending:opacity-[0.42] data-focus-visible:outline-brand",
      secondary:
        "border-border bg-surface text-foreground data-hovered:border-border-strong data-hovered:bg-surface-muted data-pressed:border-border-strong data-pressed:bg-surface-strong data-disabled:opacity-[0.42] data-pending:opacity-[0.42] data-focus-visible:outline-brand",
      ghost:
        "border-transparent bg-transparent text-muted data-hovered:bg-surface-muted data-hovered:text-foreground data-pressed:bg-surface-strong data-pressed:text-foreground data-disabled:opacity-[0.42] data-pending:opacity-[0.42] data-focus-visible:outline-brand",
      danger:
        "border-danger bg-danger text-brand-foreground data-hovered:border-danger-hover data-hovered:bg-danger-hover data-pressed:border-danger-pressed data-pressed:bg-danger-pressed data-disabled:opacity-[0.42] data-pending:opacity-[0.42] data-focus-visible:outline-danger",
      link: "!h-auto !min-h-5 !rounded-[4px] !border-0 !bg-transparent !px-0 font-semibold leading-[1.6] text-brand data-hovered:text-brand-hover data-hovered:underline data-hovered:underline-offset-3 data-pressed:text-brand-pressed data-pressed:underline data-pressed:underline-offset-3 data-focus-visible:outline-brand data-disabled:text-muted data-disabled:no-underline data-disabled:opacity-100 data-pending:text-muted data-pending:no-underline data-pending:opacity-100",
    },
    isIconOnly: {
      true: "!h-[var(--button-height)] !min-h-[var(--button-height)] w-[var(--button-height)] min-w-[var(--button-height)] px-0",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "primary",
    isIconOnly: false,
  },
});

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonStyleProps = {
  /** Variante visual compartilhada por Button e Link. */
  variant?: ButtonVariant;
  /** Tamanho do controle. */
  size?: ButtonSize;
  /** Troca o padding por um quadrado com a altura do tamanho escolhido. */
  isIconOnly?: boolean;
};
