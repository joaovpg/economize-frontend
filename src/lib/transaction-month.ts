import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";

const yearMonthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const transactionTimeZone = "America/Sao_Paulo";

export const yearMonthSchema = z.string().regex(yearMonthPattern, "Use o formato yyyy-MM.");

export type YearMonth = z.infer<typeof yearMonthSchema>;
export type TransactionMonth = Temporal.PlainYearMonth;

export const monthOptions = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;

  return { label: getMonthName(month), value: month };
});

export function getCurrentTransactionMonth(): TransactionMonth {
  return Temporal.Now.zonedDateTimeISO(transactionTimeZone).toPlainDate().toPlainYearMonth();
}

export function getCurrentYearMonth(): YearMonth {
  return toYearMonth(getCurrentTransactionMonth());
}

export function parseTransactionMonth(value: string): TransactionMonth {
  return Temporal.PlainYearMonth.from(yearMonthSchema.parse(value));
}

export function toYearMonth(value: TransactionMonth): YearMonth {
  if (value.year < 0 || value.year > 9999) {
    throw new RangeError("O ano precisa estar entre 0000 e 9999.");
  }

  return yearMonthSchema.parse(`${formatYear(value.year)}-${formatMonth(value.month)}`);
}

export function isYearMonthWithinApiFormat(value: TransactionMonth) {
  return value.year >= 0 && value.year <= 9999;
}

export function formatYear(year: number) {
  return year.toString().padStart(4, "0");
}

export function getMonthName(month: number) {
  const date = Temporal.PlainYearMonth.from({ month, year: 2020 }).toPlainDate({ day: 1 });
  const label = date.toLocaleString("pt-BR", { month: "long" });

  return `${label.slice(0, 1).toLocaleUpperCase("pt-BR")}${label.slice(1)}`;
}

export function getMonthLabel(month: string) {
  const parsedMonth = yearMonthSchema.safeParse(month);

  if (!parsedMonth.success) {
    return month;
  }

  const value = Temporal.PlainYearMonth.from(parsedMonth.data);

  return `${getMonthName(value.month)} ${formatYear(value.year)}`;
}

function formatMonth(month: number) {
  return month.toString().padStart(2, "0");
}
