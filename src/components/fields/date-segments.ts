import { useCallback, useContext, useEffect, useRef, useState, type ReactElement } from "react";
import {
  DateFieldStateContext,
  type DatePickerProps as AriaDatePickerProps,
} from "react-aria-components";

import { toCalendarDate, type CalendarDate } from "@internationalized/date";

type DateSegmentsOptions = Pick<
  AriaDatePickerProps<CalendarDate>,
  "value" | "defaultValue" | "onChange"
>;

export function SyncDateSegments({
  children,
  onEdit,
  pickerValue,
}: {
  children: ReactElement;
  onEdit: (value: CalendarDate | null, isEmpty: boolean) => void;
  pickerValue: CalendarDate | null;
}) {
  const state = useContext(DateFieldStateContext);
  const isIncomplete = state?.segments.some((segment) => segment.isPlaceholder);
  const isEmpty =
    state?.segments
      .filter((segment) => segment.isEditable)
      .every((segment) => segment.isPlaceholder) ?? true;
  const value = state?.value;

  // O DateField mantém o último valor completo durante a edição parcial,
  // inclusive quando o usuário volta a preencher exatamente a mesma data.
  useEffect(() => {
    if (value?.toString() !== pickerValue?.toString()) return;
    onEdit(!isIncomplete && value ? toCalendarDate(value) : null, isEmpty);
  }, [isIncomplete, isEmpty, onEdit, pickerValue, value]);

  return children;
}

export function useDateSegments({
  value: sourceValue,
  defaultValue,
  onChange,
}: DateSegmentsOptions) {
  const dayRef = useRef<HTMLSpanElement>(null);
  const [clearVersion, setClearVersion] = useState(0);
  const source = sourceValue?.toString() ?? null;
  const [draft, setDraft] = useState(() => ({
    source: (sourceValue === undefined ? defaultValue : sourceValue)?.toString() ?? null,
    value: sourceValue ?? defaultValue ?? null,
  }));

  // Aceita alterações externas sem tratar o retorno de uma edição parcial
  // ao formulário como um pedido para apagar os outros segmentos.
  if (sourceValue !== undefined && source !== draft.source) {
    setDraft({ source, value: sourceValue });
  }

  const handleEdit = useCallback(
    (value: CalendarDate | null, isEmpty = false) => {
      const nextSource = value?.toString() ?? null;
      if (nextSource === draft.source) {
        if (isEmpty && draft.value) setDraft({ source: nextSource, value: null });
        return;
      }

      setDraft({ source: nextSource, value: value ?? (isEmpty ? null : draft.value) });
      onChange?.(value);
    },
    [draft, onChange],
  );

  const clear = () => {
    setDraft({ source: null, value: null });
    setClearVersion((version) => version + 1);
    onChange?.(null);
    requestAnimationFrame(() => dayRef.current?.focus());
  };

  return { pickerValue: draft.value, clearVersion, handleEdit, dayRef, clear };
}
