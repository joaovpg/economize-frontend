import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";

export default function LogoMark() {
  return (
    <span
      className="grid size-8 place-items-center rounded-control bg-brand text-brand-foreground"
      aria-hidden="true"
    >
      <TrendUpIcon size={16} weight="bold" />
    </span>
  );
}
