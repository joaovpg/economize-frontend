import { parseDate } from "@internationalized/date";

/** Converte a data ISO do formulário; campos vazios ou inválidos permanecem sem seleção. */
export function parseFormDate(value: string) {
  try {
    return value ? parseDate(value) : null;
  } catch {
    return null;
  }
}
