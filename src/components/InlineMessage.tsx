import { type ComponentPropsWithoutRef, type ReactNode } from "react";

import { tv, twMerge } from "../utils/tailwind";

import type { VariantProps } from "tailwind-variants";

const inlineMessageStyles = tv(
  {
    base: "m-0 block rounded-control border px-3 py-3 text-body",
    defaultVariants: {
      tone: "success",
    },
    variants: {
      tone: {
        danger: "border-danger bg-danger-soft text-danger",
        success: "border-success bg-success-soft text-success",
        warning: "border-warning bg-warning-soft text-warning",
      },
    },
  },
  { twMerge: false },
);

export type InlineMessageProps = Omit<ComponentPropsWithoutRef<"p">, "children" | "className"> &
  VariantProps<typeof inlineMessageStyles> & {
    /** Conteúdo textual da mensagem. */
    children: ReactNode;
    /** Classes adicionais aplicadas à mensagem. */
    className?: string;
  };

/** Mensagem de feedback para operações concluídas ou falhas recuperáveis. */
export function InlineMessage({
  children,
  className,
  role,
  tone = "success",
  "aria-live": ariaLive,
  ...props
}: InlineMessageProps) {
  const isDanger = tone === "danger";

  return (
    <p
      {...props}
      aria-live={ariaLive ?? (isDanger ? "assertive" : "polite")}
      className={twMerge(inlineMessageStyles({ tone }), className)}
      role={role ?? (isDanger ? "alert" : "status")}
    >
      {children}
    </p>
  );
}
