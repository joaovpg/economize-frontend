import { type Ref } from "react";
import {
  Button,
  DateInput,
  DatePicker as AriaDatePicker,
  DateSegment,
  Dialog,
  Group,
  I18nProvider,
  Popover,
  type DatePickerProps as AriaDatePickerProps,
} from "react-aria-components";

import { today, getLocalTimeZone, type CalendarDate } from "@internationalized/date";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

import { Description } from "../Description";
import { FieldError } from "../FieldError";
import { Label } from "../Label";
import { Calendar } from "./Calendar";
import { SyncDateSegments, useDateSegments } from "./date-segments";

const control = tv({
  base: "flex h-12 min-h-12 min-w-0 items-center gap-2.5 rounded-xl border bg-surface px-3.5 font-ui transition-colors motion-reduce:transition-none",
  variants: {
    disabled: {
      false: "",
      true: "cursor-not-allowed border-border bg-surface-muted text-subtle hover:border-border! focus-within:border-border! focus-within:outline-none!",
    },
    invalid: {
      false:
        "border-border hover:border-border-strong focus-within:border-brand! focus-within:outline-2 focus-within:outline-solid focus-within:outline-brand",
      true: "border-danger focus-within:border-danger! focus-within:outline-2 focus-within:outline-solid focus-within:outline-danger",
    },
  },
});

/** Campo de data sem horário. Converta CalendarDate para ISO na integração com o formulário. */
export type DatePickerProps = Omit<
  AriaDatePickerProps<CalendarDate>,
  "children" | "className" | "granularity"
> & {
  /** Data de referência do atalho. O formulário pode fornecer seu fuso de negócio. */
  todayValue?: CalendarDate;
  /** Permite ao formulário desabilitar a navegação até hoje. */
  isTodayDisabled?: boolean;
  /** Explicação opcional fornecida pelo formulário para o atalho desabilitado. */
  todayDisabledReason?: string;
  label: string;
  description?: string;
  errorMessage?: string;
  reserveErrorSpace?: boolean;
  inputRef?: Ref<HTMLSpanElement>;
  className?: string;
};

/** DateField e calendário em popover conforme https://react-aria.adobe.com/DatePicker. */
export function DatePicker({
  todayValue = today(getLocalTimeZone()),
  isTodayDisabled = false,
  todayDisabledReason,
  label,
  description,
  errorMessage,
  reserveErrorSpace = true,
  inputRef,
  className,
  isDisabled = false,
  isInvalid = false,
  ...props
}: DatePickerProps) {
  const hasError = Boolean(errorMessage) || isInvalid;
  const { pickerValue, clearVersion, handleEdit, dayRef, clear } = useDateSegments(props);

  return (
    <I18nProvider locale="pt-BR">
      <AriaDatePicker
        {...props}
        value={pickerValue}
        onChange={(value) => handleEdit(value, value === null)}
        granularity="day"
        shouldForceLeadingZeros
        shouldCloseOnSelect
        firstDayOfWeek="sun"
        validationBehavior="aria"
        isDisabled={isDisabled}
        isInvalid={hasError}
        className={twMerge("grid min-w-0 gap-1", className)}
      >
        {({ state }) => (
          <>
            <Label isDisabled={isDisabled}>{label}</Label>
            {description && <Description isDisabled={isDisabled}>{description}</Description>}
            <Group className={control({ disabled: isDisabled, invalid: hasError && !isDisabled })}>
              <DateInput
                key={clearVersion}
                className="flex min-w-0 flex-1 overflow-x-auto text-body-small text-foreground outline-none data-disabled:text-subtle"
              >
                {(segment) =>
                  segment.type === "day" ? (
                    <SyncDateSegments onEdit={handleEdit} pickerValue={pickerValue}>
                      <DateSegment
                        ref={(element) => {
                          dayRef.current = element;
                          if (typeof inputRef === "function") inputRef(element);
                          else if (inputRef) inputRef.current = element;
                        }}
                        segment={segment}
                        className="rounded-sm px-0.5 tabular-nums caret-brand outline-none data-disabled:text-subtle data-focused:bg-brand data-focused:text-brand-foreground data-placeholder:not-data-focused:text-subtle"
                      />
                    </SyncDateSegments>
                  ) : (
                    <DateSegment
                      segment={segment}
                      className="rounded-sm px-0.5 tabular-nums caret-brand outline-none data-disabled:text-subtle data-focused:bg-brand data-focused:text-brand-foreground data-placeholder:not-data-focused:text-subtle"
                    />
                  )
                }
              </DateInput>
              <Button
                aria-label={`Abrir calendário para ${label}`}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-subtle outline-none data-disabled:cursor-not-allowed data-focus-visible:outline-2 data-focus-visible:outline-brand data-hovered:bg-surface-muted"
              >
                <CalendarBlankIcon aria-hidden="true" className="size-5" />
              </Button>
            </Group>
            <div className={reserveErrorSpace ? "min-h-4 min-w-0" : "min-w-0"}>
              <FieldError>{errorMessage}</FieldError>
            </div>
            <Popover
              placement="bottom start"
              className="z-10 max-w-[calc(100vw-1rem)] overflow-auto rounded-xl border border-border bg-surface p-3 text-foreground shadow-popover"
            >
              <Dialog aria-label={`Calendário para ${label}`} className="outline-none">
                <Calendar
                  todayValue={todayValue}
                  isTodayDisabled={isTodayDisabled}
                  todayDisabledReason={todayDisabledReason}
                  minValue={props.minValue}
                  maxValue={props.maxValue}
                  isReadOnly={props.isReadOnly}
                  onClear={() => {
                    clear();
                    state.close();
                  }}
                />
              </Dialog>
            </Popover>
          </>
        )}
      </AriaDatePicker>
    </I18nProvider>
  );
}
