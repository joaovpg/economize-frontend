import type { ReactNode } from "react";

type IconSlotProps = {
  children: ReactNode;
};

export function IconSlot({ children }: IconSlotProps) {
  if (children === null || children === undefined || children === false) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="grid size-4.5 shrink-0 place-items-center [&>svg]:size-full"
    >
      {children}
    </span>
  );
}
