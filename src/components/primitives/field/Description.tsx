import type { ReactNode } from "react";
import { Text as AriaText } from "react-aria-components";

import { cn } from "../../../utils/tailwind";

export type DescriptionProps = {
  /** Texto auxiliar do campo. */
  children: ReactNode;
  /** Classes adicionais aplicadas ao texto auxiliar. */
  className?: string;
};

/** Texto auxiliar associado ao campo pelo slot `description` do React Aria. */
export function Description({ children, className }: DescriptionProps) {
  return (
    <AriaText slot="description" className={cn("text-caption text-muted", className)}>
      {children}
    </AriaText>
  );
}
