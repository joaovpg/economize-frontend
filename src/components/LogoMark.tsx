import { TrendUpIcon } from "@phosphor-icons/react/dist/icons/TrendUp";

export default function LogoMark() {
  return (
    <span
      className="grid size-7.75 place-items-center rounded-[10px] bg-brand text-brand-foreground shadow-[0_12px_28px_color-mix(in_oklch,var(--color-brand)_18%,transparent)]"
      aria-hidden="true"
    >
      <TrendUpIcon size={18} weight="bold" />
    </span>
  );
}
