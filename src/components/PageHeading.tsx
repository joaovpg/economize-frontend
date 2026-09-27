import { type ReactNode } from "react";

import { twMerge } from "tailwind-merge";

export type PageHeadingProps = {
  /** Texto auxiliar opcional exibido antes do título. */
  eyebrow?: ReactNode;
  /** Classes adicionais aplicadas ao agrupamento da hierarquia. */
  className?: string;
  /** Descrição curta da tela. */
  description: ReactNode;
  /** Identificador associado ao `aria-labelledby` da seção da página. */
  id: string;
  /** Escala opcional para cabeçalhos que compartilham espaço com ações. */
  size?: "compact" | "default";
  /** Título principal da tela. */
  title: ReactNode;
};

/** Hierarquia editorial compartilhada pelas telas principais do Economize. */
export function PageHeading({
  className,
  description,
  eyebrow,
  id,
  size = "default",
  title,
}: PageHeadingProps) {
  return (
    <div className={twMerge("flex min-w-0 flex-col gap-2.5", className)}>
      {eyebrow && <span className="text-meta text-brand uppercase">{eyebrow}</span>}
      <h1
        className={`m-0 ${size === "compact" ? "font-display text-4xl leading-[0.98] font-semibold tracking-display max-[48rem]:text-3xl" : "text-page-title"}`}
        id={id}
      >
        {title}
      </h1>
      <p className="m-0 max-w-[48ch] text-body-small text-muted">{description}</p>
    </div>
  );
}
