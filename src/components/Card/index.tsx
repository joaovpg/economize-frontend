import { createElement, type ComponentPropsWithRef } from "react";

import { cn, tv, type VariantProps } from "tailwind-variants";

type CardElement = "div" | "section" | "aside" | "form" | "output";
export type CardProps<T extends CardElement = "div"> = ComponentPropsWithRef<T> & { as?: T };

/**
 * Superfície compartilhada. Header e Footer são opcionais; use as para preservar a semântica HTML.
 * O grupo detecta as partes por data-slot: Header recebe uma divisória quando há Body, e Footer
 * quando há Header ou Body. Partes isoladas não recebem divisórias.
 */
export function Card<T extends CardElement = "div">({ as, className, ...props }: CardProps<T>) {
  return createElement(as ?? "div", {
    ...props,
    className: cn(
      "group/card grid w-full min-w-0 content-start gap-3.5 rounded-[1.125rem] border border-border p-[1.375rem] shadow-[0_1px_0_color-mix(in_oklch,white_88%,transparent),0_0.75rem_2.25rem_rgb(15_23_42_/_0.04)] card-background",
      className,
    ),
    "data-slot": "card",
  });
}

export function CardHeader({ className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div
      {...props}
      data-slot="card-header"
      className={cn(
        "flex min-w-0 items-start justify-between gap-4 border-border group-has-data-[slot=card-body]/card:border-b group-has-data-[slot=card-body]/card:pb-3.5",
        className,
      )}
    />
  );
}

const cardBodyStyles = tv(
  {
    base: "grid min-w-0",
    defaultVariants: {
      spacing: "default",
    },
    variants: {
      spacing: {
        compact: "gap-2",
        default: "gap-3.5",
        none: "gap-0",
      },
    },
  },
  { twMerge: false },
);

export type CardBodyProps = ComponentPropsWithRef<"div"> & VariantProps<typeof cardBodyStyles>;

export function CardBody({ className, spacing = "default", ...props }: CardBodyProps) {
  return (
    <div {...props} data-slot="card-body" className={cardBodyStyles({ className, spacing })} />
  );
}

export function CardFooter({ className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div
      {...props}
      data-slot="card-footer"
      className={cn(
        "grid min-w-0 gap-3.5 border-border group-has-[[data-slot=card-body],[data-slot=card-header]]/card:border-t group-has-[[data-slot=card-body],[data-slot=card-header]]/card:pt-3.5 md:flex md:flex-wrap md:justify-end",
        className,
      )}
    />
  );
}
