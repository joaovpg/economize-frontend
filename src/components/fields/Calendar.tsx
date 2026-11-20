import { useContext, useEffect, useId, useRef, useState } from "react";
import {
  Button,
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  type CalendarProps as AriaCalendarProps,
} from "react-aria-components";

import { type CalendarDate } from "@internationalized/date";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";

import { Button as FieldButton } from "../Button";

type CalendarContentProps = Pick<
  AriaCalendarProps<CalendarDate>,
  "minValue" | "maxValue" | "isReadOnly"
> & {
  todayValue: CalendarDate;
  isTodayDisabled?: boolean;
  todayDisabledReason?: string;
  onClear: () => void;
};

/** Calendário interno; seleção, limites e ações são definidos pelo DatePicker hospedeiro. */
export function Calendar(props: CalendarContentProps) {
  return (
    <AriaCalendar
      className="w-calendar max-w-full font-ui"
      firstDayOfWeek="sun"
      minValue={props.minValue}
      maxValue={props.maxValue}
      isReadOnly={props.isReadOnly}
    >
      <CalendarContent {...props} />
    </AriaCalendar>
  );
}

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" });
const calendarMonths = Array.from({ length: 12 }, (_, index) => ({
  month: index + 1,
  label: monthFormatter.format(new Date(Date.UTC(2000, index, 1))).replace(".", ""),
}));

function CalendarContent({
  todayValue,
  isTodayDisabled,
  todayDisabledReason,
  minValue,
  maxValue,
  isReadOnly,
  onClear,
}: CalendarContentProps) {
  const calendar = useContext(CalendarStateContext);
  const [view, setView] = useState<"days" | "months" | "years">("days");
  const [yearPage, setYearPage] = useState<number | null>(null);
  const todayDescriptionId = useId();
  const monthButtonRef = useRef<HTMLButtonElement>(null);
  const yearButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (view === "months") monthButtonRef.current?.focus();
    if (view === "years") yearButtonRef.current?.focus();
  }, [view]);
  if (!calendar) return null;

  const focused = calendar.focusedDate;
  const firstYear = yearPage ?? Math.max(1, Math.min(9988, Math.floor(focused.year / 12) * 12));
  const monthLabel = calendarMonths.find(({ month }) => month === focused.month)?.label;

  function showDays() {
    setView("days");
    calendar?.setFocused(true);
  }

  return (
    <>
      <header className="mb-3 flex items-center justify-between gap-1">
        {view === "days" ? (
          <>
            <div className="flex gap-1">
              <FieldButton
                slot={null}
                size="sm"
                variant="ghost"
                aria-label={`Escolher mês, ${monthLabel}`}
                onPress={() => setView("months")}
              >
                {monthLabel}
              </FieldButton>
              <FieldButton
                slot={null}
                size="sm"
                variant="ghost"
                aria-label={`Escolher ano, ${focused.year}`}
                onPress={() => {
                  setYearPage(null);
                  setView("years");
                }}
              >
                {focused.year}
              </FieldButton>
            </div>
            <div className="flex">
              <FieldButton
                slot="previous"
                size="sm"
                variant="ghost"
                isIconOnly
                aria-label="Mês anterior"
              >
                <CaretLeftIcon aria-hidden="true" />
              </FieldButton>
              <FieldButton
                slot="next"
                size="sm"
                variant="ghost"
                isIconOnly
                aria-label="Próximo mês"
              >
                <CaretRightIcon aria-hidden="true" />
              </FieldButton>
            </div>
          </>
        ) : (
          <>
            <FieldButton slot={null} size="sm" variant="ghost" onPress={showDays}>
              Voltar aos dias
            </FieldButton>
            <span className="text-caption text-muted" aria-live="polite">
              {view === "years" ? `${firstYear}–${firstYear + 11}` : focused.year}
            </span>
          </>
        )}
      </header>
      {/* Mantém a coleção de dias do React Aria montada durante a navegação por mês e ano. */}
      <div hidden={view !== "days"}>
        <CalendarGrid weekdayStyle="short" className="w-full border-separate border-spacing-0">
          <CalendarGridHeader>
            {(day) => (
              <CalendarHeaderCell className="pb-2 text-caption text-muted">
                {day}
              </CalendarHeaderCell>
            )}
          </CalendarGridHeader>
          <CalendarGridBody>
            {(date) => (
              <CalendarCell
                date={date}
                data-current-day={date.compare(todayValue) === 0 || undefined}
                className="flex size-10 items-center justify-center rounded-control text-body text-foreground tabular-nums outline-none data-current-day:font-semibold data-disabled:text-muted data-disabled:opacity-40 data-focus-visible:outline-2 data-focus-visible:outline-brand data-hovered:bg-surface-muted data-outside-month:text-muted data-outside-month:opacity-40 data-selected:bg-brand data-selected:text-brand-foreground data-unavailable:text-muted data-unavailable:opacity-40"
              />
            )}
          </CalendarGridBody>
        </CalendarGrid>
      </div>
      {view === "months" && (
        <fieldset
          aria-label={`Escolha o mês de ${focused.year}`}
          className="m-0 grid grid-cols-3 gap-2 border-0 px-0 py-2"
        >
          {calendarMonths.map(({ month, label }) => {
            const monthStart = focused.set({ month, day: 1 });
            const monthEnd = monthStart.add({ months: 1 }).subtract({ days: 1 });
            const isDisabled = Boolean(
              (minValue && monthEnd.compare(minValue) < 0) ||
              (maxValue && monthStart.compare(maxValue) > 0),
            );
            return (
              <FieldButton
                slot={null}
                key={month}
                size="sm"
                variant={month === focused.month ? "primary" : "ghost"}
                ref={month === focused.month ? monthButtonRef : undefined}
                isDisabled={isDisabled}
                onPress={() => {
                  calendar.setFocusedDate(focused.set({ month }));
                  showDays();
                }}
              >
                {label}
              </FieldButton>
            );
          })}
        </fieldset>
      )}
      {view === "years" && (
        <>
          <fieldset
            aria-label="Escolha o ano"
            className="m-0 grid grid-cols-3 gap-2 border-0 px-0 py-2"
          >
            {Array.from({ length: 12 }, (_, index) => firstYear + index).map((year) => (
              <FieldButton
                slot={null}
                key={year}
                size="sm"
                variant={year === focused.year ? "primary" : "ghost"}
                ref={year === focused.year ? yearButtonRef : undefined}
                isDisabled={Boolean(
                  (minValue && year < minValue.year) || (maxValue && year > maxValue.year),
                )}
                onPress={() => {
                  calendar.setFocusedDate(focused.set({ year }));
                  setView("months");
                }}
              >
                {year}
              </FieldButton>
            ))}
          </fieldset>
          <div className="flex justify-between">
            <FieldButton
              slot={null}
              size="sm"
              variant="ghost"
              isIconOnly
              aria-label="Anos anteriores"
              isDisabled={firstYear <= (minValue?.year ?? 1)}
              onPress={() => setYearPage(Math.max(1, firstYear - 12))}
            >
              <CaretLeftIcon aria-hidden="true" />
            </FieldButton>
            <FieldButton
              slot={null}
              size="sm"
              variant="ghost"
              isIconOnly
              aria-label="Próximos anos"
              isDisabled={firstYear + 11 >= (maxValue?.year ?? 9999)}
              onPress={() => setYearPage(Math.min(9988, firstYear + 12))}
            >
              <CaretRightIcon aria-hidden="true" />
            </FieldButton>
          </div>
        </>
      )}
      <footer className="mt-3 grid gap-2 border-t border-border pt-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            slot={null}
            isDisabled={isTodayDisabled}
            aria-describedby={
              isTodayDisabled && todayDisabledReason ? todayDescriptionId : undefined
            }
            onPress={() => {
              calendar.setFocusedDate(todayValue);
              showDays();
            }}
            className="h-10 cursor-pointer rounded-control px-2 text-body-strong text-brand outline-none data-disabled:cursor-not-allowed data-disabled:text-muted data-focus-visible:outline-2 data-focus-visible:outline-brand data-hovered:bg-brand-soft"
          >
            Ir para hoje
          </Button>
          <FieldButton
            slot={null}
            size="sm"
            variant="ghost"
            isDisabled={isReadOnly}
            onPress={() => {
              onClear();
            }}
          >
            Limpar
          </FieldButton>
        </div>
        {isTodayDisabled && todayDisabledReason && (
          <p id={todayDescriptionId} className="m-0 max-w-xs text-caption text-muted">
            {todayDisabledReason}
          </p>
        )}
      </footer>
    </>
  );
}
