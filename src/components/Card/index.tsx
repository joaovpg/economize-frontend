import { createElement, type ComponentPropsWithRef } from "react";

import { cn } from "tailwind-variants";

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
    "data-slot": "card",
    className: cn(
      "group/card grid w-full min-w-0 content-start gap-3.5 rounded-[1.125rem] border border-border bg-[linear-gradient(180deg,rgb(255_255_255_/_0.78),rgb(255_253_248_/_0.92))] p-[1.375rem] shadow-[0_1px_0_color-mix(in_oklch,white_88%,transparent),0_0.75rem_2.25rem_rgb(15_23_42_/_0.04)]",
      className,
    ),
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

export function CardBody({ className, ...props }: ComponentPropsWithRef<"div">) {
  return <div {...props} data-slot="card-body" className={cn("grid min-w-0 gap-3.5", className)} />;
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
