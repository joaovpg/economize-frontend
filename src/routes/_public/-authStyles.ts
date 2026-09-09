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
