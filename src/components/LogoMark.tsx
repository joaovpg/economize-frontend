import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";

export default function LogoMark() {
  return (
    <span
      className="grid size-7 place-items-center rounded-[9px] bg-brand text-brand-foreground"
      aria-hidden="true"
    >
      <TrendUpIcon size={16} weight="bold" />
    </span>
  );
}
