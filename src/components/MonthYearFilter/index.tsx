import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";

import {
  formatYear,
  isYearMonthWithinApiFormat,
  monthOptions,
  type TransactionMonth,
} from "../../lib/transaction-month";
import { cn } from "../../utils/tailwind";
import { Button } from "../Button";
import { Select, SelectItem } from "../fields/Select";
import { Legend } from "../primitives/Legend";

const yearWindowRadius = 10;

function getYearOptions(year: number) {
  const firstYear = Math.max(0, year - yearWindowRadius);
  const lastYear = Math.min(9999, year + yearWindowRadius);

  return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);
}

export type MonthYearFilterProps = {
  /** Classes adicionais aplicadas ao grupo de seleção. */
  className?: string;
  /** Recebe o período escolhido pelo usuário. */
  onChange: (value: TransactionMonth) => void;
  /** Período atualmente selecionado. */
  value: TransactionMonth;
};

export function MonthYearFilter({ className, onChange, value }: MonthYearFilterProps) {
  const previousMonth = value.subtract({ months: 1 });
  const nextMonth = value.add({ months: 1 });
  const yearOptions = getYearOptions(value.year);
  const canGoToPreviousMonth = isYearMonthWithinApiFormat(previousMonth);
  const canGoToNextMonth = isYearMonthWithinApiFormat(nextMonth);

  return (
    <fieldset className={cn("flex min-w-0 items-center gap-1 border-0 p-0", className)}>
      <Legend className="sr-only">Selecionar mês e ano</Legend>
      <Button
        aria-label="Mês anterior"
        className="text-muted!"
        isDisabled={!canGoToPreviousMonth}
        isIconOnly
        onPress={() => onChange(previousMonth)}
        size="sm"
        variant="ghost"
      >
        <CaretLeftIcon aria-hidden="true" />
      </Button>
      <Select
        aria-label="Mês"
        className="min-w-0 flex-1 gap-0"
        onChange={(nextValue) => {
          if (typeof nextValue !== "string") {
            return;
          }

          const monthOption = monthOptions.find((option) => String(option.value) === nextValue);

          if (monthOption) {
            onChange(value.with({ month: monthOption.value }));
          }
        }}
        reserveErrorSpace={false}
        size="sm"
        value={String(value.month)}
      >
        {monthOptions.map((month) => (
          <SelectItem id={String(month.value)} key={month.value} textValue={month.label}>
            {month.label}
          </SelectItem>
        ))}
      </Select>
      <Select
        aria-label="Ano"
        className="w-24 shrink-0 gap-0"
        onChange={(nextValue) => {
          if (typeof nextValue !== "string") {
            return;
          }

          const year = yearOptions.find((option) => String(option) === nextValue);

          if (year !== undefined) {
            onChange(value.with({ year }));
          }
        }}
        reserveErrorSpace={false}
        size="sm"
        value={String(value.year)}
      >
        {yearOptions.map((year) => (
          <SelectItem id={String(year)} key={year} textValue={formatYear(year)}>
            {formatYear(year)}
          </SelectItem>
        ))}
      </Select>
      <Button
        aria-label="Próximo mês"
        className="text-muted!"
        isDisabled={!canGoToNextMonth}
        isIconOnly
        onPress={() => onChange(nextMonth)}
        size="sm"
        variant="ghost"
      >
        <CaretRightIcon aria-hidden="true" />
      </Button>
    </fieldset>
  );
}
