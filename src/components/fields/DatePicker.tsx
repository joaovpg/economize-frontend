import type { Ref } from "react";
import {
  DateInput,
  DatePicker as AriaDatePicker,
  DateSegment,
  Dialog,
  I18nProvider,
  type DatePickerProps as AriaDatePickerProps,
} from "react-aria-components";

import { today, getLocalTimeZone, type CalendarDate } from "@internationalized/date";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";

import { cn } from "../../utils/tailwind";
import { FieldButton } from "../primitives/field/FieldButton";
import { FieldError } from "../primitives/field/FieldError";
import { FieldGroup } from "../primitives/field/FieldGroup";
import { FieldHeader } from "../primitives/field/FieldHeader";
import { Popover } from "../primitives/listbox/Popover";
import { Calendar } from "./Calendar";
import { SyncDateSegments, useDateSegments } from "./date-segments";
import { fieldRootClassName, isFieldInvalid, type FieldBaseProps } from "./field-props";

const segmentClassName =
  "rounded-sm px-px tabular-nums caret-brand outline-none data-disabled:text-muted data-focused:bg-brand-soft data-focused:text-foreground data-placeholder:text-muted";

/** Campo de data sem horário. Converta CalendarDate para ISO na integração com o formulário. */
export type DatePickerProps = FieldBaseProps &
  Omit<
    AriaDatePickerProps<CalendarDate>,
    | keyof FieldBaseProps
    | "children"
    | "className"
    | "granularity"
    | "validationBehavior"
    | "isInvalid"
  > & {
    /** Referência do segmento do dia, usada pelo React Hook Form para foco em erros. */
    ref?: Ref<HTMLSpanElement>;
    /** Data de referência do atalho. O formulário pode fornecer seu fuso de negócio. */
    todayValue?: CalendarDate;
    /** Permite ao formulário desabilitar a navegação até hoje. */
    isTodayDisabled?: boolean;
    /** Explicação opcional fornecida pelo formulário para o atalho desabilitado. */
    todayDisabledReason?: string;
  };

/**
 * Campo de data em pt-BR: segmentos digitáveis e calendário em popover. Estados de caixa vêm do
 * Group do React Aria, como nos demais campos.
 */
export function DatePicker({
  todayValue = today(getLocalTimeZone()),
  isTodayDisabled = false,
  todayDisabledReason,
  label,
  description,
  errorMessage,
  isInvalid,
  reserveErrorSpace = true,
  isRequired,
  isDisabled,
  size,
  className,
  ref,
  ...props
}: DatePickerProps) {
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
        isInvalid={isFieldInvalid({ errorMessage, isInvalid })}
        isRequired={isRequired}
        className={cn(fieldRootClassName, className)}
      >
        {({ state }) => (
          <>
            <FieldHeader description={description} isRequired={isRequired} label={label} />
            <FieldGroup size={size}>
              <DateInput
                key={clearVersion}
                className="flex min-w-0 flex-1 overflow-x-auto text-body text-foreground outline-none data-disabled:text-muted max-md:text-md"
              >
                {(segment) =>
                  segment.type === "day" ? (
                    <SyncDateSegments onEdit={handleEdit} pickerValue={pickerValue}>
                      <DateSegment
                        ref={(element) => {
                          dayRef.current = element;
                          if (typeof ref === "function") ref(element);
                          else if (ref) ref.current = element;
                        }}
                        className={segmentClassName}
                        segment={segment}
                      />
                    </SyncDateSegments>
                  ) : (
                    <DateSegment className={segmentClassName} segment={segment} />
                  )
                }
              </DateInput>
              <FieldButton aria-label={`Abrir calendário para ${label ?? "data"}`}>
                <CalendarBlankIcon aria-hidden="true" />
              </FieldButton>
            </FieldGroup>
            <FieldError reserveSpace={reserveErrorSpace}>{errorMessage}</FieldError>
            <Popover
              className="max-w-[calc(100vw-1rem)] overflow-auto p-3"
              placement="bottom start"
            >
              <Dialog aria-label={`Calendário para ${label ?? "data"}`} className="outline-none">
                <Calendar
                  isReadOnly={props.isReadOnly}
                  isTodayDisabled={isTodayDisabled}
                  maxValue={props.maxValue}
                  minValue={props.minValue}
                  onClear={() => {
                    clear();
                    state.close();
                  }}
                  todayDisabledReason={todayDisabledReason}
                  todayValue={todayValue}
                />
              </Dialog>
            </Popover>
          </>
        )}
      </AriaDatePicker>
    </I18nProvider>
  );
}
