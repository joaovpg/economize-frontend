import type { ReactNode } from "react";

import { Description } from "./Description";
import { Label } from "./Label";

export type FieldHeaderProps = {
  /** Rótulo visível. Sem ele, o campo precisa de aria-label. */
  label?: ReactNode;
  /** Texto auxiliar colado abaixo do rótulo. */
  description?: string;
  /** Marca "(obrigatório)" no rótulo. */
  isRequired?: boolean;
};

/**
 * Cabeçalho do campo: rótulo e descrição colados. O bloco existe mesmo sem conteúdo, para que o
 * campo ocupe a mesma linha da grade que os vizinhos (pilha do campo em `fields/`).
 */
export function FieldHeader({ label, description, isRequired = false }: FieldHeaderProps) {
  return (
    <div className="grid min-w-0 self-end">
      {label && <Label isRequired={isRequired}>{label}</Label>}
      {description && <Description>{description}</Description>}
    </div>
  );
}
