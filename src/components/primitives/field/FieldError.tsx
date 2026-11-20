import type { ReactNode } from "react";
import { FieldError as AriaFieldError } from "react-aria-components";

import { cn } from "../../../utils/tailwind";

export type FieldErrorProps = {
  /** Mensagem de erro. Sem ela, o React Aria mostra a mensagem de validação nativa do campo. */
  children?: ReactNode;
  /** Reserva a altura de uma linha para o erro, evitando deslocamento do layout. */
  reserveSpace?: boolean;
};

/** Linha de erro do campo, com espaço reservado (`min-h-4`) para evitar salto de layout. */
export function FieldError({ children, reserveSpace = true }: FieldErrorProps) {
  return (
    <div className={cn("min-w-0", reserveSpace && "min-h-4")}>
      <AriaFieldError className="block text-caption wrap-break-word text-danger">
        {children}
      </AriaFieldError>
    </div>
  );
}
