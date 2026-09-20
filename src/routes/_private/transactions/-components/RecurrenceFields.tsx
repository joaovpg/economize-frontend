import { useEffect, useState } from "react";
import {
  Controller,
  useFormState,
  useWatch,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";

import { Button } from "../../../../components/Button";
import { Checkbox } from "../../../../components/Checkbox";
import { Select, SelectItem } from "../../../../components/Select";
import { TextField } from "../../../../components/TextField";
import { type FormularioOperacaoFinanceira } from "../../../../services/transactions/contracts";
import {
  dayOfWeekOptions,
  getDayOfWeekForDate,
  getDayOfWeekOrder,
  getMonthDayForDate,
  isValidFormDate,
  recurrenceEndOptions,
  recurrenceFrequencyOptions,
} from "./transaction-form";

type RecurrenceEndType = (typeof recurrenceEndOptions)[number]["value"];

interface RecurrenceFieldsProps {
  control: Control<FormularioOperacaoFinanceira>;
  setValue: UseFormSetValue<FormularioOperacaoFinanceira>;
}

function areEqual<T>(first: readonly T[], second: readonly T[]) {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

export function RecurrenceFields({ control, setValue }: RecurrenceFieldsProps) {
  const { errors, isSubmitting } = useFormState({ control });
  const frequency = useWatch({ control, name: "frequencia" });
  const startDate = useWatch({ control, name: "data" });
  const weekDays = useWatch({ control, name: "diasSemana" });
  const monthDays = useWatch({ control, name: "diasMes" });
  const semTermino = useWatch({ control, name: "semTermino" });
  const occurrenceCount = useWatch({ control, name: "quantidadeOcorrencias" });
  const [terminationType, setTerminationType] = useState<RecurrenceEndType>(
    semTermino ? "none" : occurrenceCount !== "" ? "count" : "until",
  );

  useEffect(() => {
    if (!isValidFormDate(startDate)) {
      return;
    }

    const nextWeekDays =
      frequency === "WEEKLY"
        ? Array.from(
            new Set([
              ...weekDays.filter(
                (day) =>
                  getDayOfWeekOrder(day) >= getDayOfWeekOrder(getDayOfWeekForDate(startDate)),
              ),
              getDayOfWeekForDate(startDate),
            ]),
          )
        : [];
    const nextMonthDays =
      frequency === "MONTHLY"
        ? Array.from(
            new Set([
              ...monthDays.filter((day) => day >= getMonthDayForDate(startDate)),
              getMonthDayForDate(startDate),
            ]),
          )
        : [];

    if (!areEqual(weekDays, nextWeekDays)) {
      setValue("diasSemana", nextWeekDays, { shouldDirty: true, shouldValidate: false });
    }
    if (!areEqual(monthDays, nextMonthDays)) {
      setValue("diasMes", nextMonthDays, { shouldDirty: true, shouldValidate: false });
    }
  }, [frequency, monthDays, setValue, startDate, weekDays]);

  const handleTerminationChange = (nextValue: string) => {
    const nextType = recurrenceEndOptions.find((option) => option.value === nextValue)?.value;

    if (!nextType) {
      return;
    }

    setTerminationType(nextType);
    setValue("semTermino", nextType === "none", { shouldDirty: true, shouldValidate: true });
    setValue("quantidadeOcorrencias", "", { shouldDirty: true, shouldValidate: false });
    setValue("ate", "", { shouldDirty: true, shouldValidate: false });
  };

  return (
    <fieldset className="grid min-w-0 gap-3.5 border-0 p-0">
      <legend className="text-label text-foreground">Recorrência</legend>
      <div className="grid min-w-0 gap-3.5 sm:grid-cols-2">
        <Controller
          control={control}
          name="frequencia"
          render={({ field }) => (
            <Select
              errorMessage={errors.frequencia?.message}
              isDisabled={isSubmitting}
              label="Frequência"
              name={field.name}
              onBlur={field.onBlur}
              onChange={(nextValue) => {
                const nextFrequency = recurrenceFrequencyOptions.find(
                  (option) => option.value === String(nextValue),
                )?.value;

                if (nextFrequency) {
                  field.onChange(nextFrequency);
                }
              }}
              value={field.value ?? null}
            >
              {recurrenceFrequencyOptions.map((option) => (
                <SelectItem id={option.value} key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          )}
        />
        <Controller
          control={control}
          name="intervalo"
          render={({ field }) => (
            <TextField
              description="Use 1 para repetir no intervalo padrão."
              errorMessage={errors.intervalo?.message}
              inputMode="numeric"
              isDisabled={isSubmitting}
              label="Intervalo"
              maxLength={10}
              name={field.name}
              onBlur={field.onBlur}
              onInput={field.onChange}
              inputRef={field.ref}
              placeholder="1"
              value={field.value}
            />
          )}
        />
      </div>
      {frequency === "WEEKLY" && (
        <Controller
          control={control}
          name="diasSemana"
          render={({ field }) => {
            if (!isValidFormDate(startDate)) {
              return (
                <fieldset className="grid min-w-0 gap-2 border-0 p-0">
                  <legend className="text-label text-foreground">Dias da semana</legend>
                  <p className="m-0 text-caption text-danger">
                    Informe uma data inicial válida para escolher os dias.
                  </p>
                </fieldset>
              );
            }

            const startWeekDayOrder = getDayOfWeekOrder(getDayOfWeekForDate(startDate));

            return (
              <fieldset className="grid min-w-0 gap-2 border-0 p-0">
                <legend className="text-label text-foreground">Dias da semana</legend>
                <p className="m-0 text-caption text-muted">
                  O dia da data inicial é mantido como a primeira ocorrência.
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                  {dayOfWeekOptions.map((option) => (
                    <Checkbox
                      isDisabled={
                        isSubmitting || getDayOfWeekOrder(option.value) < startWeekDayOrder
                      }
                      isSelected={field.value.includes(option.value)}
                      key={option.value}
                      onChange={(isSelected) => {
                        const nextValue = isSelected
                          ? [...field.value, option.value]
                          : field.value.filter((day) => day !== option.value);

                        field.onChange(nextValue);
                      }}
                      size="compact"
                    >
                      {option.shortLabel}
                    </Checkbox>
                  ))}
                </div>
                {errors.diasSemana?.message && (
                  <p className="m-0 text-validation text-danger">{errors.diasSemana.message}</p>
                )}
              </fieldset>
            );
          }}
        />
      )}
      {frequency === "MONTHLY" && (
        <Controller
          control={control}
          name="diasMes"
          render={({ field }) => {
            if (!isValidFormDate(startDate)) {
              return (
                <fieldset className="grid min-w-0 gap-2 border-0 p-0">
                  <legend className="text-label text-foreground">Dias do mês</legend>
                  <p className="m-0 text-caption text-danger">
                    Informe uma data inicial válida para escolher os dias.
                  </p>
                </fieldset>
              );
            }

            const startMonthDay = getMonthDayForDate(startDate);

            return (
              <fieldset className="grid min-w-0 gap-2 border-0 p-0">
                <legend className="text-label text-foreground">Dias do mês</legend>
                <p className="m-0 text-caption text-muted">
                  Dias que não existem em um mês são omitidos conforme a regra padrão do backend.
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => {
                    const selected = field.value.includes(day);

                    return (
                      <Button
                        aria-label={`Dia ${day}`}
                        aria-pressed={selected}
                        className="min-w-0!"
                        isDisabled={isSubmitting || day < startMonthDay}
                        key={day}
                        onPress={() => {
                          const nextValue = selected
                            ? field.value.filter((selectedDay) => selectedDay !== day)
                            : [...field.value, day];

                          field.onChange(nextValue);
                        }}
                        size="sm"
                        type="button"
                        variant={selected ? "primary" : "secondary"}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </div>
                {errors.diasMes?.message && (
                  <p className="m-0 text-validation text-danger">{errors.diasMes.message}</p>
                )}
              </fieldset>
            );
          }}
        />
      )}
      <div className="grid min-w-0 gap-3.5 sm:grid-cols-2">
        <Select
          errorMessage={errors.ate?.message ?? errors.quantidadeOcorrencias?.message}
          isDisabled={isSubmitting}
          label="Término"
          onChange={(nextValue) => handleTerminationChange(String(nextValue))}
          value={terminationType}
        >
          {recurrenceEndOptions.map((option) => (
            <SelectItem id={option.value} key={option.value} textValue={option.label}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
        {terminationType === "count" ? (
          <Controller
            control={control}
            name="quantidadeOcorrencias"
            render={({ field }) => (
              <TextField
                errorMessage={errors.quantidadeOcorrencias?.message ?? errors.ate?.message}
                inputMode="numeric"
                isDisabled={isSubmitting}
                label="Quantidade de ocorrências"
                maxLength={10}
                name={field.name}
                onBlur={field.onBlur}
                onInput={field.onChange}
                inputRef={field.ref}
                placeholder="Ex.: 12"
                value={field.value}
              />
            )}
          />
        ) : terminationType === "until" ? (
          <Controller
            control={control}
            name="ate"
            render={({ field }) => (
              <TextField
                errorMessage={errors.ate?.message}
                isDisabled={isSubmitting}
                label="Data final"
                name={field.name}
                onBlur={field.onBlur}
                onInput={field.onChange}
                inputRef={field.ref}
                type="date"
                value={field.value}
              />
            )}
          />
        ) : (
          <p className="m-0 self-end pb-4 text-caption text-muted">
            A recorrência continuará ativa até ser encerrada.
          </p>
        )}
      </div>
    </fieldset>
  );
}
