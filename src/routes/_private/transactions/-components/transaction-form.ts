import { z } from "zod";

import { getCurrentTransactionDate, isDataIsoValida } from "../../../../lib/date";
import {
  getCurrentTransactionMonth,
  type TransactionMonth,
} from "../../../../lib/transaction-month";
import {
  type AlterarTransacaoRequest,
  type ConsultaTransacaoItem,
  type CriarTransacaoRequest,
  type EscopoEdicaoTransacao,
  type RepeticaoTransacaoRequest,
} from "../../../../services/transactions/contracts";
import {
  transactionSituationSchema,
  transactionTypeSchema,
} from "../../../../services/transactions/shared";
import {
  type AlterarTransferenciaRequest,
  type CriarTransferenciaRequest,
} from "../../../../services/transfers/contracts";
import {
  repeticaoFormSchema,
  toRepeticaoRequestFromForm,
  validateRepeticaoFormulario,
} from "./transaction-repetition-form";

export const escopoEdicaoOptions = [
  {
    description: "Altera somente esta ocorrência.",
    label: "Somente esta",
    value: "SOMENTE_ESTA",
  },
  {
    description: "Altera esta ocorrência e as seguintes.",
    label: "Esta e as próximas",
    value: "ESTA_E_AS_PROXIMAS",
  },
] satisfies readonly {
  description: string;
  label: string;
  value: EscopoEdicaoTransacao;
}[];

/**
 * Opções de escopo de uma ocorrência de série, limitadas a `escoposDisponiveis`. "Esta e as
 * próximas" fica desabilitado quando a própria ocorrência está efetivada, porque a API sempre
 * recusa esse caso.
 */
export function getEscopoEdicaoOptions(
  item: Pick<ConsultaTransacaoItem, "escoposDisponiveis" | "situacao">,
) {
  return escopoEdicaoOptions
    .filter((option) => item.escoposDisponiveis.includes(option.value))
    .map((option) => ({
      description: option.description,
      isDisabled: option.value === "ESTA_E_AS_PROXIMAS" && item.situacao === "EFETIVADA",
      label: option.label,
      value: option.value,
    }));
}

export function getInitialEntryDate(selectedMonth: TransactionMonth) {
  const currentMonth = getCurrentTransactionMonth();

  return currentMonth.equals(selectedMonth)
    ? getCurrentTransactionDate()
    : selectedMonth.toPlainDate({ day: 1 }).toString();
}

/** Valor de identificação vindo do item consultado; ausente indica dado fora do contrato. */
export function getRequiredTargetId(value: string | null | undefined, fieldName: string) {
  if (!value) {
    throw new Error(`O ${fieldName} da operação não foi encontrado.`);
  }

  return value;
}

export function normalizeOptionalText(value: string): string | null {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

export function formatFormDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function normalizeMoneyInput(value: string) {
  const compactValue = value.trim().replace(/\s/g, "");

  if (compactValue.includes(",") && compactValue.includes(".")) {
    return compactValue.lastIndexOf(",") > compactValue.lastIndexOf(".")
      ? compactValue.replace(/\./g, "").replace(",", ".")
      : compactValue.replace(/,/g, "");
  }

  return compactValue.replace(",", ".");
}

/** Converte o texto digitado em valor monetário positivo com até quatro casas, ou null. */
export function parseMoneyInput(value: string): number | null {
  const normalizedValue = normalizeMoneyInput(value);

  if (!/^\d+(\.\d{1,4})?$/.test(normalizedValue)) {
    return null;
  }

  const numericValue = Number(normalizedValue);

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
}

export function formatMoneyForSummary(value: string) {
  const numericValue = parseMoneyInput(value);

  return numericValue === null
    ? "valor não informado"
    : new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 4,
        minimumFractionDigits: 2,
      }).format(numericValue);
}

function parseValidatedMoney(value: string) {
  const numericValue = parseMoneyInput(value);

  if (numericValue === null) {
    throw new Error("Valor financeiro inválido após a validação do formulário.");
  }

  return numericValue;
}

function requireFormValue<T>(value: T | null | undefined, fieldName: string): T {
  if (value === undefined || value === null || value === "") {
    throw new Error(`O campo ${fieldName} não foi preenchido após a validação.`);
  }

  return value;
}

const moneyInputSchema = z
  .string()
  .trim()
  .min(1, "Informe o valor.")
  .refine(
    (value) => parseMoneyInput(value) !== null,
    "Informe um valor positivo com até quatro casas decimais.",
  );

const formDateSchema = z
  .string()
  .min(1, "Informe uma data.")
  .refine(isDataIsoValida, "Informe uma data válida.");

const formularioTipoOperacaoSchema = z.enum(["TRANSACAO", "TRANSFERENCIA"]);

export type FormularioTipoOperacao = z.infer<typeof formularioTipoOperacaoSchema>;

const formularioOperacaoFinanceiraBaseSchema = z.object({
  categoriaId: z.uuid().nullable(),
  contaDestinoId: z.string(),
  contaId: z.string(),
  contaOrigemId: z.string(),
  data: formDateSchema,
  descricao: z.string().trim().min(1, "Informe a descrição.").max(255),
  observacoes: z.string().max(2000),
  repeticao: repeticaoFormSchema,
  situacao: transactionSituationSchema,
  tipo: transactionTypeSchema,
  tipoOperacao: formularioTipoOperacaoSchema,
  valor: moneyInputSchema,
});

type FormularioOperacaoFinanceiraBase = z.infer<typeof formularioOperacaoFinanceiraBaseSchema>;

function addRequiredOperationFieldIssue(
  contexto: z.RefinementCtx,
  campo: string,
  valor: unknown,
  mensagem: string,
) {
  if (valor === undefined || valor === null || valor === "") {
    contexto.addIssue({ code: "custom", message: mensagem, path: [campo] });
  }
}

function validateOperationBase(
  formulario: FormularioOperacaoFinanceiraBase,
  contexto: z.RefinementCtx,
) {
  if (formulario.tipoOperacao === "TRANSFERENCIA") {
    addRequiredOperationFieldIssue(
      contexto,
      "contaOrigemId",
      formulario.contaOrigemId,
      "Selecione a conta de origem.",
    );
    addRequiredOperationFieldIssue(
      contexto,
      "contaDestinoId",
      formulario.contaDestinoId,
      "Selecione a conta de destino.",
    );

    if (
      formulario.contaOrigemId &&
      formulario.contaDestinoId &&
      formulario.contaOrigemId === formulario.contaDestinoId
    ) {
      contexto.addIssue({
        code: "custom",
        message: "Escolha contas diferentes.",
        path: ["contaDestinoId"],
      });
    }
  } else {
    addRequiredOperationFieldIssue(contexto, "contaId", formulario.contaId, "Selecione uma conta.");
  }

  if (formulario.situacao === "EFETIVADA" && formulario.data > getCurrentTransactionDate()) {
    contexto.addIssue({
      code: "custom",
      message: "Uma transação efetivada não pode ter data futura.",
      path: ["data"],
    });
  }

  if (formulario.tipoOperacao === "TRANSACAO" && formulario.repeticao.ativa) {
    validateRepeticaoFormulario(formulario.repeticao, formulario.data, contexto);
  }
}

/** Schema único do formulário de criação e de edição de transação ou transferência. */
export const formularioOperacaoFinanceiraSchema =
  formularioOperacaoFinanceiraBaseSchema.superRefine(validateOperationBase);

export type FormularioOperacaoFinanceira = z.infer<typeof formularioOperacaoFinanceiraSchema>;

export function toCreateTransactionRequest(
  data: FormularioOperacaoFinanceira,
): CriarTransacaoRequest {
  if (data.tipoOperacao !== "TRANSACAO") {
    throw new Error("O formulário não representa uma transação.");
  }

  return {
    categoriaId: data.categoriaId,
    contaId: requireFormValue(data.contaId, "contaId"),
    dataFinanceira: data.data,
    descricao: data.descricao.trim(),
    observacoes: normalizeOptionalText(data.observacoes),
    repeticao: toRepeticaoRequestFromForm(data.repeticao),
    situacao: data.situacao,
    tipo: data.tipo,
    valor: parseValidatedMoney(data.valor),
  };
}

export function toCreateTransferRequest(
  data: FormularioOperacaoFinanceira,
): CriarTransferenciaRequest {
  if (data.tipoOperacao !== "TRANSFERENCIA") {
    throw new Error("O formulário não representa uma transferência.");
  }

  return {
    contaDestinoId: requireFormValue(data.contaDestinoId, "contaDestinoId"),
    contaOrigemId: requireFormValue(data.contaOrigemId, "contaOrigemId"),
    dataFinanceira: data.data,
    descricao: data.descricao.trim(),
    observacoes: normalizeOptionalText(data.observacoes),
    situacao: data.situacao,
    valor: parseValidatedMoney(data.valor),
  };
}

export type EdicaoTransacaoContexto = {
  /** Somente para ocorrência de série; omitido em transação simples. */
  escopo?: EscopoEdicaoTransacao;
  /** Repetição a reenviar; null mantém (ou torna) a transação simples. */
  repeticao: RepeticaoTransacaoRequest | null;
  versaoEdicao: string;
};

export function toEditTransactionRequest(
  data: FormularioOperacaoFinanceira,
  { escopo, repeticao, versaoEdicao }: EdicaoTransacaoContexto,
): AlterarTransacaoRequest {
  const request = { ...toCreateTransactionRequest(data), repeticao, versaoEdicao };

  // Transação simples não envia escopo; o campo só existe para ocorrência de série.
  return escopo === undefined ? request : { ...request, escopo };
}

export function toEditTransferRequest(
  data: FormularioOperacaoFinanceira,
  versaoEdicao: string,
): AlterarTransferenciaRequest {
  return { ...toCreateTransferRequest(data), versaoEdicao };
}
