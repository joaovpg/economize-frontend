import { createElement, type ComponentPropsWithRef } from "react";

import { tv, twMerge } from "../../utils/tailwind";

import type { VariantProps } from "tailwind-variants";

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
    className: twMerge(
      "group/card grid w-full min-w-0 content-start gap-0 overflow-hidden rounded-surface border border-border bg-surface",
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
      className={twMerge(
        "flex min-w-0 items-start justify-between gap-4 border-border p-4 md:p-6 group-has-data-[slot=card-body]/card:border-b group-has-data-[slot=card-body]/card:pb-4",
        className,
      )}
    />
  );
}

const cardBodyStyles = tv(
  {
    base: "grid min-w-0 p-4 md:p-6",
    defaultVariants: {
      spacing: "default",
    },
    variants: {
      spacing: {
        compact: "gap-2",
        default: "gap-4",
        none: "gap-0 p-0!",
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
      className={twMerge(
        "grid min-w-0 gap-4 border-border px-4 pb-4 md:px-6 md:pb-6 group-has-[[data-slot=card-body],[data-slot=card-header]]/card:border-t group-has-[[data-slot=card-body],[data-slot=card-header]]/card:pt-4 md:flex md:flex-wrap md:justify-end",
        className,
      )}
    />
  );
}
