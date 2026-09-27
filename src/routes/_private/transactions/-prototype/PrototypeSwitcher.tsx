import { useEffect } from "react";

import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";

import { Button } from "../../../../components/Button";

import type { PrototypeVariant } from "./prototype-variants";

const prototypeVariants = [
  { id: "reference", label: "Referência" },
  { id: "ledger", label: "Livro" },
  { id: "focus", label: "Foco" },
] as const satisfies readonly { id: PrototypeVariant; label: string }[];

type PrototypeSwitcherProps = {
  current: PrototypeVariant;
  onChange: (variant: PrototypeVariant) => void;
};

function getNextVariant(current: PrototypeVariant, direction: -1 | 1) {
  const currentIndex = prototypeVariants.findIndex((variant) => variant.id === current);
  const nextIndex =
    (currentIndex + direction + prototypeVariants.length) % prototypeVariants.length;

  return prototypeVariants[nextIndex].id;
}

export function PrototypeSwitcher({ current, onChange }: PrototypeSwitcherProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        onChange(getNextVariant(current, event.key === "ArrowLeft" ? -1 : 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, onChange]);

  const currentLabel =
    prototypeVariants.find((variant) => variant.id === current)?.label ?? "Referência";

  return (
    <aside
      aria-label="Seletor de protótipo descartável"
      className="fixed inset-x-0 bottom-4 z-30 mx-auto flex w-max max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-2 py-2 text-slate-50 shadow-dialog"
    >
      <Button
        aria-label="Variante anterior"
        isIconOnly
        onPress={() => onChange(getNextVariant(current, -1))}
        size="sm"
        variant="primary"
      >
        <CaretLeftIcon aria-hidden="true" />
      </Button>
      <span className="px-2 text-caption-strong whitespace-nowrap">Protótipo · {currentLabel}</span>
      <Button
        aria-label="Próxima variante"
        isIconOnly
        onPress={() => onChange(getNextVariant(current, 1))}
        size="sm"
        variant="primary"
      >
        <CaretRightIcon aria-hidden="true" />
      </Button>
    </aside>
  );
}
