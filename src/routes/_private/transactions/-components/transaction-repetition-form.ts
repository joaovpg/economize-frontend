import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";

import { isDataIsoValida } from "../../../../lib/date";
import {
  ancoragemRepeticaoSchema,
  frequenciaRepeticaoSchema,
  tipoTerminoSchema,
  type ConsultaTransacaoItem,
  type EscopoEdicaoTransacao,
  type RepeticaoResponse,
  type RepeticaoTransacaoRequest,
} from "../../../../services/transactions/contracts";
import { inteiroPositivoMaximo } from "../../../../services/transactions/shared";
import { getPosicaoOcorrenciaNoSegmento } from "./transaction-repetition";

type OpcaoRepeticao<T extends string> = {
  label: string;
  value: T;
};

const mensagemInteiroPositivo = "Informe um número inteiro maior que zero.";
const diaUtilLimiteAncoragem = 20;

/** Repetição lida de uma ocorrência; a conversão usa somente estes campos. */
export type RepeticaoLida = Pick<
  RepeticaoResponse,
  "ancoragem" | "frequencia" | "intervalo" | "termino"
>;

/** Campos de repetição digitados como texto; a validação e a conversão ficam nesta camada. */
export const repeticaoFormSchema = z.object({
  ancoragem: ancoragemRepeticaoSchema,
  ativa: z.boolean(),
  frequencia: frequenciaRepeticaoSchema,
  intervalo: z.string(),
  termino: z.object({
    data: z.string(),
    numeroPrimeiraParcela: z.string(),
    quantidade: z.string(),
    tipo: tipoTerminoSchema,
    totalParcelas: z.string(),
  }),
});

export type RepeticaoFormulario = z.infer<typeof repeticaoFormSchema>;

export const frequenciaRepeticaoOptions = [
  { label: "Dias", value: "DIARIA" },
  { label: "Semanas", value: "SEMANAL" },
  { label: "Meses", value: "MENSAL" },
  { label: "Anos", value: "ANUAL" },
] satisfies readonly OpcaoRepeticao<RepeticaoFormulario["frequencia"]>[];

export const terminoRepeticaoOptions = [
  { label: "Nunca", value: "INDEFINIDO" },
  { label: "Em uma data", value: "EM_DATA" },
  { label: "Após N ocorrências", value: "APOS_OCORRENCIAS" },
  { label: "Em parcelas", value: "PARCELAS" },
] satisfies readonly OpcaoRepeticao<RepeticaoFormulario["termino"]["tipo"]>[];

/** Inteiro entre 1 e o máximo do contrato, ou null quando o texto não representa esse valor. */
export function parseInteiroPositivo(value: string): number | null {
  const normalizedValue = value.trim();

  if (!/^\d+$/.test(normalizedValue)) {
    return null;
  }

  const numericValue = Number(normalizedValue);

  return numericValue >= 1 && numericValue <= inteiroPositivoMaximo ? numericValue : null;
}

/**
 * Posição da data entre os dias de segunda a sexta do seu mês, sem feriados. Retorna null quando a
 * data cai em fim de semana. É usada somente para o rótulo e para a validação do dia útil.
 */
export function getPosicaoDiaUtilNoMes(value: string): number | null {
  if (!isDataIsoValida(value)) {
    return null;
  }

  const data = Temporal.PlainDate.from(value);

  if (data.dayOfWeek > 5) {
    return null;
  }

  let posicao = 0;

  for (let dia = 1; dia <= data.day; dia += 1) {
    if (data.with({ day: dia }).dayOfWeek <= 5) {
      posicao += 1;
    }
  }

  return posicao;
}

/** Ancoragem "No Nº dia útil" só é válida com data de segunda a sexta e N menor ou igual a 20. */
export function isDiaUtilAncoravel(value: string) {
  const posicao = getPosicaoDiaUtilNoMes(value);

  return posicao !== null && posicao <= diaUtilLimiteAncoragem;
}

function addRepeticaoIssue(
  contexto: z.RefinementCtx,
  caminho: readonly string[],
  mensagem: string,
) {
  contexto.addIssue({ code: "custom", message: mensagem, path: ["repeticao", ...caminho] });
}

function validateTerminoRepeticao(
  termino: RepeticaoFormulario["termino"],
  dataFinanceira: string,
  contexto: z.RefinementCtx,
) {
  switch (termino.tipo) {
    case "INDEFINIDO":
      return;
    case "EM_DATA":
      if (!isDataIsoValida(termino.data)) {
        addRepeticaoIssue(contexto, ["termino", "data"], "Informe uma data final válida.");
      } else if (isDataIsoValida(dataFinanceira) && termino.data < dataFinanceira) {
        addRepeticaoIssue(
          contexto,
          ["termino", "data"],
          "A data final não pode ser anterior à data financeira.",
        );
      }
      return;
    case "APOS_OCORRENCIAS":
      if (parseInteiroPositivo(termino.quantidade) === null) {
        addRepeticaoIssue(contexto, ["termino", "quantidade"], mensagemInteiroPositivo);
      }
      return;
    case "PARCELAS": {
      const numeroPrimeiraParcela = parseInteiroPositivo(termino.numeroPrimeiraParcela);
      const totalParcelas = parseInteiroPositivo(termino.totalParcelas);

      if (numeroPrimeiraParcela === null) {
        addRepeticaoIssue(contexto, ["termino", "numeroPrimeiraParcela"], mensagemInteiroPositivo);
      }

      if (totalParcelas === null) {
        addRepeticaoIssue(contexto, ["termino", "totalParcelas"], mensagemInteiroPositivo);
      }

      if (
        numeroPrimeiraParcela !== null &&
        totalParcelas !== null &&
        numeroPrimeiraParcela > totalParcelas
      ) {
        addRepeticaoIssue(
          contexto,
          ["termino", "numeroPrimeiraParcela"],
          "A parcela inicial não pode ser maior que o total de parcelas.",
        );
      }
      return;
    }
  }
}

/**
 * Regras da repetição no cliente, com a Data financeira como início. O servidor continua sendo a
 * autoridade; estas mensagens só dão resposta imediata.
 */
export function validateRepeticaoFormulario(
  repeticao: RepeticaoFormulario,
  dataFinanceira: string,
  contexto: z.RefinementCtx,
) {
  if (parseInteiroPositivo(repeticao.intervalo) === null) {
    addRepeticaoIssue(contexto, ["intervalo"], mensagemInteiroPositivo);
  }

  // A ancoragem só existe na frequência mensal; em outras frequências ela nunca é enviada.
  if (
    repeticao.frequencia === "MENSAL" &&
    repeticao.ancoragem === "DIA_UTIL" &&
    !isDiaUtilAncoravel(dataFinanceira)
  ) {
    addRepeticaoIssue(
      contexto,
      ["ancoragem"],
      "O dia útil exige uma data de segunda a sexta-feira até o 20º dia útil do mês.",
    );
  }

  validateTerminoRepeticao(repeticao.termino, dataFinanceira, contexto);
}

/**
 * Valores iniciais da seção Repetir. Ligada, a repetição começa mensal, a cada 1, no mesmo dia do
 * mês e sem término; a parcela inicial padrão é 1.
 */
export function createRepeticaoFormValues(ativa = false): RepeticaoFormulario {
  return {
    ancoragem: "DIA_DO_MES",
    ativa,
    frequencia: "MENSAL",
    intervalo: "1",
    termino: {
      data: "",
      numeroPrimeiraParcela: "1",
      quantidade: "",
      tipo: "INDEFINIDO",
      totalParcelas: "",
    },
  };
}

/** Converte a repetição lida (ou ausente) nos valores do formulário. */
export function toRepeticaoFormValues(repeticao: RepeticaoLida | null): RepeticaoFormulario {
  if (!repeticao) {
    return createRepeticaoFormValues(false);
  }

  const { termino } = repeticao;

  return {
    ancoragem: repeticao.ancoragem,
    ativa: true,
    frequencia: repeticao.frequencia,
    intervalo: String(repeticao.intervalo),
    termino: {
      data: termino.data ?? "",
      numeroPrimeiraParcela: String(termino.numeroPrimeiraParcela ?? 1),
      quantidade:
        termino.quantidade === null || termino.quantidade === undefined
          ? ""
          : String(termino.quantidade),
      tipo: termino.tipo,
      totalParcelas:
        termino.totalParcelas === null || termino.totalParcelas === undefined
          ? ""
          : String(termino.totalParcelas),
    },
  };
}

/**
 * Valores iniciais da seção Repetir conforme o escopo da edição. Em "Esta e as próximas", a
 * repetição lida passa a começar na ocorrência selecionada: - parcelamento: a parcela inicial vira
 * o número da ocorrência; o total não muda; - término por quantidade: as ocorrências anteriores do
 * segmento saem da contagem.
 *
 * Os demais casos seguem a leitura. Fora de "Esta e as próximas", a seção começa desligada, porque
 * "Somente esta" reenvia a repetição lida sem passar por este formulário.
 */
export function createRepeticaoFormValuesParaEscopo(
  item: Pick<ConsultaTransacaoItem, "repeticao" | "serie">,
  escopo: EscopoEdicaoTransacao | undefined,
): RepeticaoFormulario {
  const { repeticao, serie } = item;

  if (escopo !== "ESTA_E_AS_PROXIMAS" || !repeticao) {
    return createRepeticaoFormValues(false);
  }

  const valores = toRepeticaoFormValues(repeticao);
  const { termino } = repeticao;

  switch (termino.tipo) {
    case "PARCELAS":
      return {
        ...valores,
        termino: {
          ...valores.termino,
          numeroPrimeiraParcela: String(serie?.numeroParcela ?? termino.numeroPrimeiraParcela),
        },
      };
    case "APOS_OCORRENCIAS": {
      if (!serie || termino.quantidade === null || termino.quantidade === undefined) {
        return valores;
      }

      const posicao = getPosicaoOcorrenciaNoSegmento(serie, repeticao);

      return {
        ...valores,
        termino: { ...valores.termino, quantidade: String(termino.quantidade - (posicao - 1)) },
      };
    }
    case "EM_DATA":
    case "INDEFINIDO":
      return valores;
    default: {
      const exhaustive: never = termino.tipo;
      return exhaustive;
    }
  }
}

function requireInteiroPositivo(value: string, campo: string) {
  const numericValue = parseInteiroPositivo(value);

  if (numericValue === null) {
    throw new Error(`O campo ${campo} não é um inteiro positivo após a validação.`);
  }

  return numericValue;
}

// Cada tipo de término envia somente os próprios campos.
function toTerminoRequest(
  termino: RepeticaoFormulario["termino"],
): RepeticaoTransacaoRequest["termino"] {
  switch (termino.tipo) {
    case "INDEFINIDO":
      return { tipo: "INDEFINIDO" };
    case "EM_DATA":
      return { data: termino.data, tipo: "EM_DATA" };
    case "APOS_OCORRENCIAS":
      return {
        quantidade: requireInteiroPositivo(termino.quantidade, "quantidade"),
        tipo: "APOS_OCORRENCIAS",
      };
    case "PARCELAS":
      return {
        numeroPrimeiraParcela: requireInteiroPositivo(
          termino.numeroPrimeiraParcela,
          "parcela inicial",
        ),
        tipo: "PARCELAS",
        totalParcelas: requireInteiroPositivo(termino.totalParcelas, "total de parcelas"),
      };
    default: {
      const exhaustive: never = termino.tipo;
      return exhaustive;
    }
  }
}

/**
 * Converte os valores do formulário na `repeticao` do contrato. Retorna null quando Repetir está
 * desligado. A ancoragem só é enviada como dia útil na frequência mensal; o número do dia útil
 * nunca é enviado. Chamar somente com valores já validados.
 *
 * Também serve para reenviar a repetição lida (`toRepeticaoFormValues`), sem alterar a regra.
 */
export function toRepeticaoRequestFromForm(
  repeticao: RepeticaoFormulario,
): RepeticaoTransacaoRequest | null {
  if (!repeticao.ativa) {
    return null;
  }

  return {
    ancoragem: repeticao.frequencia === "MENSAL" ? repeticao.ancoragem : "DIA_DO_MES",
    frequencia: repeticao.frequencia,
    intervalo: requireInteiroPositivo(repeticao.intervalo, "intervalo"),
    termino: toTerminoRequest(repeticao.termino),
  };
}

/** Dia do mês da Data financeira, usado no rótulo "No dia D". */
export function getDiaDoMes(dataFinanceira: string): number | null {
  return isDataIsoValida(dataFinanceira) ? Temporal.PlainDate.from(dataFinanceira).day : null;
}

/**
 * Opções de ancoragem mensal. "No Nº dia útil" aparece só quando a Data financeira permite (segunda
 * a sexta e N ≤ 20). O N serve apenas para o rótulo.
 */
export function getAncoragemRepeticaoOptions(
  dataFinanceira: string,
): OpcaoRepeticao<RepeticaoFormulario["ancoragem"]>[] {
  const diaDoMes = getDiaDoMes(dataFinanceira);
  const options: OpcaoRepeticao<RepeticaoFormulario["ancoragem"]>[] = [
    {
      label: diaDoMes === null ? "No dia do mês" : `No dia ${diaDoMes}`,
      value: "DIA_DO_MES",
    },
  ];

  if (isDiaUtilAncoravel(dataFinanceira)) {
    const posicao = getPosicaoDiaUtilNoMes(dataFinanceira);

    options.push({ label: `No ${posicao}º dia útil`, value: "DIA_UTIL" });
  }

  return options;
}
