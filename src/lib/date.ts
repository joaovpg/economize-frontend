import { parseDate } from "@internationalized/date";
import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";

/** Fuso das datas financeiras e do "hoje" usado pelos formulários. */
export const transactionTimeZone = "America/Sao_Paulo";

/** Converte a data ISO do formulário; campos vazios ou inválidos permanecem sem seleção. */
export function parseFormDate(value: string) {
  try {
    return value ? parseDate(value) : null;
  } catch {
    return null;
  }
}

/** Verdadeiro quando o texto é uma data `yyyy-MM-dd` existente no calendário. */
export function isDataIsoValida(value: string) {
  return z.iso.date().safeParse(value).success;
}

/** Data de hoje no fuso das transações, em formato ISO. */
export function getCurrentTransactionDate() {
  return Temporal.Now.zonedDateTimeISO(transactionTimeZone).toPlainDate().toString();
}
