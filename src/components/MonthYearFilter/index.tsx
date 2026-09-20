import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";

import {
  formatYear,
  isYearMonthWithinApiFormat,
  monthOptions,
  type TransactionMonth,
} from "../../lib/transaction-month";
import { Button } from "../Button";
import { Select, SelectItem } from "../Select";

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
    <fieldset
      className={[
        "flex min-w-0 items-center gap-0.5 rounded-2xl border border-border card-background p-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <legend className="sr-only">Selecionar mês e ano</legend>
      <Button
        aria-label="Mês anterior"
        className="rounded-full! text-subtle!"
        isDisabled={!canGoToPreviousMonth}
        isIconOnly
        onPress={() => onChange(previousMonth)}
        size="sm"
        variant="ghost"
      >
        <CaretLeftIcon aria-hidden="true" />
      </Button>
      <Select
        appearance="compact"
        className="min-w-0 flex-1 gap-0"
        label="Mês"
        labelClassName="sr-only"
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
        value={String(value.month)}
      >
        {monthOptions.map((month) => (
          <SelectItem id={String(month.value)} key={month.value} textValue={month.label}>
            {month.label}
          </SelectItem>
        ))}
      </Select>
      <span aria-hidden="true" className="h-4 w-px bg-border" />
      <Select
        appearance="compact"
        className="w-24 shrink-0 gap-0"
        label="Ano"
        labelClassName="sr-only"
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
        className="rounded-full! text-subtle!"
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
