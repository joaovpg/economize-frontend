import { Temporal } from "@js-temporal/polyfill";

import {
  type ConsultaTransacaoItem,
  type RepeticaoResponse,
  type SerieResponse,
} from "../../../../services/transactions/contracts";

type UnidadeFrequencia = {
  plural: string;
  todo: string;
};

const unidadesFrequencia: Record<RepeticaoResponse["frequencia"], UnidadeFrequencia> = {
  ANUAL: { plural: "anos", todo: "Todo ano" },
  DIARIA: { plural: "dias", todo: "Todo dia" },
  MENSAL: { plural: "meses", todo: "Todo mês" },
  SEMANAL: { plural: "semanas", todo: "Toda semana" },
};

function getFrequenciaTexto(repeticao: RepeticaoResponse) {
  const unidade = unidadesFrequencia[repeticao.frequencia];

  return repeticao.intervalo === 1
    ? unidade.todo
    : `A cada ${repeticao.intervalo} ${unidade.plural}`;
}

/**
 * Ancoragem só existe na frequência mensal. O dia do mês vem do início do segmento, que é a
 * primeira ocorrência da regra atual.
 */
function getAncoragemTexto(repeticao: RepeticaoResponse, serie: SerieResponse | null | undefined) {
  if (repeticao.frequencia !== "MENSAL") {
    return null;
  }

  if (repeticao.ancoragem === "DIA_UTIL") {
    return repeticao.numeroDiaUtil ? `no ${repeticao.numeroDiaUtil}º dia útil` : "no dia útil";
  }

  if (!serie) {
    return null;
  }

  return `dia ${Temporal.PlainDate.from(serie.inicioSegmento).day}`;
}

/**
 * Posição, começando em 1, da ocorrência dentro do seu segmento. O motor do backend numera as
 * ocorrências a partir do início do segmento, com um número por período da frequência: a cada
 * intervalo de dias, semanas, meses ou anos. No mensal, dia útil incluso, cada mês tem exatamente
 * uma ocorrência, então a conta é por mês.
 */
export function getPosicaoOcorrenciaNoSegmento(
  serie: Pick<SerieResponse, "dataOriginal" | "inicioSegmento">,
  repeticao: Pick<RepeticaoResponse, "frequencia" | "intervalo">,
): number {
  const inicio = Temporal.PlainDate.from(serie.inicioSegmento);
  const original = Temporal.PlainDate.from(serie.dataOriginal);
  const { frequencia, intervalo } = repeticao;
  const diasDesdeInicio = inicio.until(original, { largestUnit: "days" }).days;
  let periodos: number;

  switch (frequencia) {
    case "DIARIA":
      periodos = Math.floor(diasDesdeInicio / intervalo);
      break;
    case "SEMANAL":
      periodos = Math.floor(diasDesdeInicio / (7 * intervalo));
      break;
    case "MENSAL":
      periodos = Math.floor(
        ((original.year - inicio.year) * 12 + original.month - inicio.month) / intervalo,
      );
      break;
    case "ANUAL":
      periodos = Math.floor((original.year - inicio.year) / intervalo);
      break;
    default: {
      const exhaustive: never = frequencia;
      return exhaustive;
    }
  }

  return periodos + 1;
}

function getParcelaTexto(serie: SerieResponse | null | undefined) {
  const numeroParcela = serie?.numeroParcela;
  const totalParcelas = serie?.totalParcelas;

  return numeroParcela && totalParcelas ? `parcela ${numeroParcela} de ${totalParcelas}` : null;
}

/**
 * Resumo somente leitura da repetição de uma ocorrência, por exemplo "Todo mês, dia 10 · parcela 3
 * de 12". Retorna null quando a ocorrência não tem repetição.
 */
export function getRepeticaoResumo(
  item: Pick<ConsultaTransacaoItem, "repeticao" | "serie">,
): string | null {
  const { repeticao, serie } = item;

  if (!repeticao) {
    return null;
  }

  const recorrencia = [getFrequenciaTexto(repeticao), getAncoragemTexto(repeticao, serie)]
    .filter((parte): parte is string => parte !== null)
    .join(", ");
  const parcela = getParcelaTexto(serie);

  return parcela ? `${recorrencia} · ${parcela}` : recorrencia;
}
