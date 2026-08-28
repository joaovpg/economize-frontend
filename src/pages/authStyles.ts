import { tv } from "tailwind-variants";

export const authGridStyles = tv({
  base: "grid min-h-[26.875rem] grid-cols-[minmax(0,1fr)_22.5rem] items-end gap-[6.5rem] max-[56.25rem]:min-h-0 max-[56.25rem]:grid-cols-1 max-[56.25rem]:gap-[2.125rem]",
  variants: {
    align: {
      end: "",
      start: "items-start",
    },
  },
  defaultVariants: {
    align: "end",
  },
});

export const authCopyStyles = tv({
  base: "flex flex-col gap-5 pb-[1.375rem] max-[56.25rem]:pb-0",
  variants: {
    registration: {
      false: "",
      true: "pt-[1.375rem] max-[56.25rem]:pt-0",
    },
  },
  defaultVariants: {
    registration: false,
  },
});

export const authCardStyles = tv({
  base: "grid w-full gap-3.5 rounded-[1.125rem] border p-[1.375rem]",
  variants: {
    state: {
      form: "border-border bg-[linear-gradient(180deg,rgb(255_255_255_/_0.78),rgb(255_253_248_/_0.92))] shadow-[0_1px_0_color-mix(in_oklch,white_88%,transparent),0_0.75rem_2.25rem_rgb(15_23_42_/_0.04)]",
      success:
        "grid-cols-[auto_1fr] border-success bg-success-soft shadow-[0_0.625rem_1.875rem_color-mix(in_oklch,var(--color-success)_8%,transparent)]",
    },
  },
});
