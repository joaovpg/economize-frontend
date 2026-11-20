/** Tamanho dos campos com caixa: `md` (40px, 44px no celular) ou `sm` (32px) para filtros e buscas. */
export type FieldSize = "md" | "sm";

/**
 * Props comuns a todo campo do Economize. Os campos são montados só com primitivos e expõem este
 * contrato; a validação (Zod) fica no formulário, e `errorMessage` é a mensagem exibida.
 */
export type FieldBaseProps = {
  /** Rótulo visível. Sem ele, use `aria-label`. */
  label?: string;
  /** Texto auxiliar colado abaixo do rótulo. */
  description?: string;
  /** Mensagem de validação. Também marca o campo como inválido. */
  errorMessage?: string;
  /** Marca o campo como inválido sem exibir mensagem (`errorMessage` já faz isso). */
  isInvalid?: boolean;
  /** Reserva uma linha para o erro, evitando deslocamento do layout. Padrão: true. */
  reserveErrorSpace?: boolean;
  /** Marca "(obrigatório)" no rótulo e envia aria-required. */
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  /** Tamanho da caixa. Padrão: `md`. */
  size?: FieldSize;
  /** Classes adicionais aplicadas à raiz do campo. */
  className?: string;
};

/**
 * Raiz de cada campo. `group/field` expõe os estados de caixa (`group-data-<estado>/field`) aos
 * primitivos. Em uma grade com colunas, o campo ocupa três linhas e herda as da grade (subgrid),
 * alinhando cabeçalho, caixa e erro com os vizinhos; fora de grade, comporta-se como um grid
 * comum.
 */
export const fieldRootClassName =
  "group/field row-span-3 grid min-w-0 grid-rows-subgrid content-start gap-1";

/** Erro efetivo do campo: a mensagem ou o estado inválido explícito. */
export function isFieldInvalid({
  errorMessage,
  isInvalid,
}: Pick<FieldBaseProps, "errorMessage" | "isInvalid">) {
  return Boolean(errorMessage) || Boolean(isInvalid);
}
