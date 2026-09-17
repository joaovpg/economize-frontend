import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../../../../components/Button";
import { Checkbox } from "../../../../components/Checkbox";
import { Select, SelectItem } from "../../../../components/Select";
import { TextArea } from "../../../../components/TextArea";
import { TextField } from "../../../../components/TextField";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { postRecorrencia } from "../../../../services/transactions/api";
import { type DayOfWeek } from "../../../../services/transactions/contracts";
import { applyFormError, getServerFieldName } from "./form-errors";
import {
  dayOfWeekOptions,
  formatFormDate,
  formatMoneyForSummary,
  getDayOfWeekForDate,
  getDayOfWeekOrder,
  getInitialEntryDate,
  getMonthDayForDate,
  getRecurrenceEndTypeLabel,
  isValidFormDate,
  recurrenceEndOptions,
  recurrenceFrequencyOptions,
  toCreateRecurrenceRequest,
  type RecurrenceFormData,
  type TransactionEntryMode,
  recurrenceFormSchema,
} from "./transaction-form";
import { AccountSelect, CategorySelect, TransactionTypeField } from "./TransactionFormFields";
import { TransactionFormShell } from "./TransactionFormShell";

type RecurrenceFormProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  mode: TransactionEntryMode;
  onClose: () => void;
  onFormStateChange: (state: { isDirty: boolean; isSubmitting: boolean }) => void;
  onModeChange: (mode: TransactionEntryMode) => void;
  onSaved: (message: string) => Promise<void>;
  selectedMonth: Parameters<typeof getInitialEntryDate>[0];
};

function getRecurrenceField(field: string | undefined): keyof RecurrenceFormData | null {
  const fieldName = getServerFieldName(field);

  if (
    fieldName === "ate" ||
    fieldName === "count" ||
    fieldName === "dataFim" ||
    fieldName === "quantidadeOcorrencias"
  ) {
    return "termino";
  }

  if (fieldName === "dataInicio" || fieldName === "dataPrimeiraOcorrencia") {
    return "inicio";
  }

  if (fieldName === "valorPorParcela") {
    return "valor";
  }

  const validFields: readonly (keyof RecurrenceFormData)[] = [
    "categoriaId",
    "contaId",
    "descricao",
    "diasMes",
    "diasSemana",
    "frequencia",
    "inicio",
    "intervalo",
    "observacoes",
    "tipo",
    "termino",
    "valor",
  ];

  return validFields.find((validField) => validField === fieldName) ?? null;
}

function areEqual<T>(first: readonly T[], second: readonly T[]) {
  return first.length === second.length && first.every((value, index) => value === second[index]);
}

function getEndSummary(termination: RecurrenceFormData["termino"]) {
  switch (termination.kind) {
    case "count":
      return `até ${termination.value || "uma quantidade definida"} ocorrência(s)`;
    case "none":
      return "sem término definido";
    case "until":
      return `até ${
        termination.value && isValidFormDate(termination.value)
          ? formatFormDate(termination.value)
          : "uma data definida"
      }`;
    default: {
      const exhaustive: never = termination;
      return exhaustive;
    }
  }
}

function getScheduleSummary(
  frequency: RecurrenceFormData["frequencia"],
  weekDays: readonly DayOfWeek[],
  monthDays: readonly number[],
) {
  if (frequency === "WEEKLY") {
    const labels = dayOfWeekOptions
      .filter((option) => weekDays.includes(option.value))
      .map((option) => option.shortLabel)
      .join(", ");

    return labels ? `às ${labels}` : "nos dias da semana escolhidos";
  }

  if (frequency === "MONTHLY") {
    const labels = monthDays.toSorted((first, second) => first - second).join(", ");

    return labels ? `nos dias ${labels} de cada mês` : "nos dias do mês escolhidos";
  }

  return frequency === "DAILY" ? "todos os dias" : "todos os anos";
}

export function RecurrenceForm({
  accounts,
  categories,
  mode,
  onClose,
  onFormStateChange,
  onModeChange,
  onSaved,
  selectedMonth,
}: RecurrenceFormProps) {
  const initialEntryDate = getInitialEntryDate(selectedMonth);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    setValue,
    setError,
  } = useForm<RecurrenceFormData>({
    defaultValues: {
      categoriaId: null,
      contaId: "",
      descricao: "",
      diasMes: [getMonthDayForDate(initialEntryDate)],
      diasSemana: [],
      frequencia: "MONTHLY",
      inicio: initialEntryDate,
      intervalo: "1",
      observacoes: "",
      termino: { kind: "none" },
      tipo: "DESPESA",
      valor: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(recurrenceFormSchema),
  });
  const frequency = useWatch({ control, name: "frequencia" });
  const startDate = useWatch({ control, name: "inicio" });
  const weekDays = useWatch({ control, name: "diasSemana" });
  const monthDays = useWatch({ control, name: "diasMes" });
  const termination = useWatch({ control, name: "termino" });
  const accountId = useWatch({ control, name: "contaId" });
  const transactionType = useWatch({ control, name: "tipo" });
  const value = useWatch({ control, name: "valor" });
  const interval = useWatch({ control, name: "intervalo" });
  const descriptionField = register("descricao");
  const observationsField = register("observacoes");
  const valueField = register("valor");
  const startDateField = register("inicio");
  const intervalField = register("intervalo");

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

  useEffect(() => {
    onFormStateChange({ isDirty, isSubmitting });
  }, [isDirty, isSubmitting, onFormStateChange]);

  const handleFormSubmit = async (data: RecurrenceFormData) => {
    setSubmitError(null);

    try {
      await postRecorrencia(toCreateRecurrenceRequest(data));
    } catch (error) {
      applyFormError(
        error,
        setError,
        getRecurrenceField,
        setSubmitError,
        "Não foi possível cadastrar a recorrência. Tente novamente.",
      );
      return;
    }

    await onSaved("Recorrência cadastrada com sucesso.");
  };

  const activeAccountCount = accounts.filter((account) => account.ativo).length;
  const noActiveAccounts = activeAccountCount === 0;
  const accountLabel =
    accounts.find((account) => account.id === accountId)?.nome ?? "conta não selecionada";
  const summaryStart = isValidFormDate(startDate)
    ? formatFormDate(startDate)
    : "data não informada";
  const summaryInterval = interval || "1";
  const frequencyLabel =
    recurrenceFrequencyOptions.find((option) => option.value === frequency)?.label ??
    "frequência escolhida";

  return (
    <TransactionFormShell
      formId="recurrence-creation-form"
      isDisabled={noActiveAccounts}
      isSubmitting={isSubmitting}
      mode={mode}
      onClose={onClose}
      onModeChange={onModeChange}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel="Cadastrar recorrência"
    >
      {noActiveAccounts && (
        <output
          aria-live="polite"
          className="m-0 rounded-xl border border-warning/25 bg-warning-soft px-3.5 py-3 text-body-small text-warning"
        >
          Cadastre uma conta ativa antes de registrar uma recorrência.
        </output>
      )}
      {submitError && (
        <p
          aria-live="assertive"
          className="m-0 rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
          role="alert"
        >
          {submitError}
        </p>
      )}
      <div className="grid gap-3.5">
        <Controller
          control={control}
          name="tipo"
          render={({ field }) => (
            <TransactionTypeField
              isDisabled={isSubmitting}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
        <div className="grid min-w-0 gap-3.5 sm:grid-cols-2">
          <TextField
            autoComplete="off"
            errorMessage={errors.valor?.message}
            inputMode="decimal"
            isDisabled={isSubmitting}
            label="Valor de cada ocorrência"
            maxLength={24}
            name={valueField.name}
            onBlur={valueField.onBlur}
            onInput={valueField.onChange}
            inputRef={valueField.ref}
            placeholder="0,00"
          />
          <TextField
            errorMessage={errors.inicio?.message}
            isDisabled={isSubmitting}
            label="Data inicial"
            name={startDateField.name}
            onBlur={startDateField.onBlur}
            onInput={startDateField.onChange}
            inputRef={startDateField.ref}
            type="date"
          />
        </div>
        <div className="grid min-w-0 gap-3.5 sm:grid-cols-2">
          <Select
            errorMessage={errors.frequencia?.message}
            isDisabled={isSubmitting}
            label="Frequência"
            onChange={(nextValue) => {
              const nextFrequency = recurrenceFrequencyOptions.find(
                (option) => option.value === String(nextValue),
              )?.value;

              if (nextFrequency) {
                setValue("frequencia", nextFrequency, { shouldDirty: true, shouldValidate: true });
              }
            }}
            value={frequency}
          >
            {recurrenceFrequencyOptions.map((option) => (
              <SelectItem id={option.value} key={option.value} textValue={option.label}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
          <TextField
            description="Use 1 para repetir no intervalo padrão."
            errorMessage={errors.intervalo?.message}
            inputMode="numeric"
            isDisabled={isSubmitting}
            label="Intervalo"
            maxLength={10}
            name={intervalField.name}
            onBlur={intervalField.onBlur}
            onInput={intervalField.onChange}
            inputRef={intervalField.ref}
            placeholder="1"
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

              const startWeekDay = getDayOfWeekForDate(startDate);
              const startWeekDayOrder = getDayOfWeekOrder(startWeekDay);

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
        <Controller
          control={control}
          name="contaId"
          render={({ field }) => (
            <AccountSelect
              accounts={accounts}
              errorMessage={errors.contaId?.message}
              isDisabled={isSubmitting}
              label="Conta"
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="categoriaId"
          render={({ field }) => (
            <CategorySelect
              categories={categories}
              errorMessage={errors.categoriaId?.message}
              isDisabled={isSubmitting}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="termino"
          render={({ field }) => (
            <div className="grid min-w-0 gap-3.5 sm:grid-cols-2">
              <Select
                errorMessage={errors.termino?.message}
                isDisabled={isSubmitting}
                label="Término"
                onChange={(nextValue) => {
                  const nextType = recurrenceEndOptions.find(
                    (option) => option.value === String(nextValue),
                  )?.value;

                  if (!nextType) {
                    return;
                  }

                  field.onChange(
                    nextType === "none"
                      ? { kind: "none" }
                      : nextType === "count"
                        ? { kind: "count", value: "" }
                        : { kind: "until", value: "" },
                  );
                }}
                value={field.value.kind}
              >
                {recurrenceEndOptions.map((option) => (
                  <SelectItem id={option.value} key={option.value} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              {field.value.kind === "count" ? (
                <TextField
                  errorMessage={errors.termino?.message}
                  inputMode="numeric"
                  isDisabled={isSubmitting}
                  label="Quantidade de ocorrências"
                  maxLength={10}
                  onBlur={field.onBlur}
                  onChange={(nextValue) => field.onChange({ kind: "count", value: nextValue })}
                  value={field.value.value}
                  placeholder="Ex.: 12"
                />
              ) : field.value.kind === "until" ? (
                <TextField
                  errorMessage={errors.termino?.message}
                  isDisabled={isSubmitting}
                  label="Data final"
                  onBlur={field.onBlur}
                  onChange={(nextValue) => field.onChange({ kind: "until", value: nextValue })}
                  type="date"
                  value={field.value.value}
                />
              ) : (
                <p className="m-0 self-end pb-4 text-caption text-muted">
                  A recorrência continuará ativa até ser encerrada.
                </p>
              )}
            </div>
          )}
        />
        <TextField
          autoComplete="off"
          errorMessage={errors.descricao?.message}
          isDisabled={isSubmitting}
          inputRef={descriptionField.ref}
          label="Descrição"
          maxLength={255}
          name={descriptionField.name}
          onBlur={descriptionField.onBlur}
          onInput={descriptionField.onChange}
          placeholder="Ex.: Mensalidade da academia"
        />
        <TextArea
          errorMessage={errors.observacoes?.message}
          isDisabled={isSubmitting}
          label="Observações"
          maxLength={2000}
          name={observationsField.name}
          onBlur={observationsField.onBlur}
          onInput={observationsField.onChange}
          placeholder="Adicione uma observação opcional"
          textAreaRef={observationsField.ref}
        />
        <output
          aria-live="polite"
          className="rounded-xl border border-border bg-surface-muted px-3.5 py-3 text-body-small text-muted"
        >
          Resumo: {getRecurrenceEndTypeLabel(termination.kind).toLocaleLowerCase("pt-BR")} de{" "}
          {getTransactionTypeLabel(transactionType)} de {formatMoneyForSummary(value)} na conta{" "}
          {accountLabel}, começando em {summaryStart}, {frequencyLabel.toLocaleLowerCase("pt-BR")} a
          cada {summaryInterval} intervalo(s), {getScheduleSummary(frequency, weekDays, monthDays)},{" "}
          {getEndSummary(termination)}.
        </output>
      </div>
    </TransactionFormShell>
  );
}

function getTransactionTypeLabel(value: RecurrenceFormData["tipo"]) {
  return value === "RECEITA" ? "receita" : "despesa";
}
