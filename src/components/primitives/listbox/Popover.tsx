import {
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
} from "react-aria-components";

import { cn } from "../../../utils/tailwind";

export type PopoverProps = Omit<AriaPopoverProps, "className"> & {
  /** Classes adicionais aplicadas à superfície flutuante. */
  className?: string;
};

/** Superfície flutuante de Select e DatePicker: largura mínima do gatilho, borda e sombra. */
export function Popover({ className, ...popoverProps }: PopoverProps) {
  return (
    <AriaPopover
      offset={4}
      {...popoverProps}
      className={cn(
        "z-10 flex min-w-(--trigger-width) flex-col overflow-hidden rounded-surface border border-border bg-surface p-1 text-foreground shadow-popover outline-none",
        className,
      )}
    />
  );
}
