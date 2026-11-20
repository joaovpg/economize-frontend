import type { ReactNode } from "react";
import { Group, type GroupProps } from "react-aria-components";

import { cn } from "../../../utils/tailwind";
import { fieldBoxStyles } from "./fieldStyles";

export type FieldGroupProps = Omit<GroupProps, "children" | "className"> & {
  /** Conteúdo da caixa: Input, botões e ícones. */
  children: ReactNode;
  /** Classes adicionais aplicadas à caixa. */
  className?: string;
  /** Altura e preenchimento da caixa: `md` (40px) ou `sm` (32px). */
  size?: "md" | "sm";
};

/** Caixa do campo (Group do React Aria). Foco, hover e erro vêm de `data-*` do próprio Group. */
export function FieldGroup({ children, className, size = "md", ...groupProps }: FieldGroupProps) {
  return (
    <Group
      {...groupProps}
      className={cn(
        "flex items-center gap-2",
        fieldBoxStyles({ focus: "within", size }),
        className,
      )}
    >
      {children}
    </Group>
  );
}
