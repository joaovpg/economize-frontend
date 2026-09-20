import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { RadioGroup, RadioItem } from "../../../../components/RadioGroup";
import { TextArea } from "../../../../components/TextArea";
import { TextField } from "../../../../components/TextField";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { putOcorrenciaRecorrente } from "../../../../services/recurrences/api";
import { type RecurrenceScope } from "../../../../services/recurrences/contracts";
import { transactionsQueryKey } from "../../../../services/transactions/queries";
import { applyFormError, getServerFieldName } from "./form-errors";
import {
  formatFormDate,
  formatMoneyForSummary,
  isValidFormDate,
  recurrenceOccurrenceFormSchema,
  recurrenceScopeOptions,
  toEditRecurrenceOccurrenceRequest,
  type RecurrenceOccurrenceFormData,
} from "./transaction-form";
import { AccountSelect, CategorySelect, TransactionTypeField } from "./TransactionFormFields";
import { TransactionFormShell } from "./TransactionFormShell";

type RecurrenceOccurrenceFormProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  dataOriginal: string;
  entryLabel: "parcelamento" | "recorrência";
  initialValues: RecurrenceOccurrenceFormData;
  onClose: () => void;
  onFormStateChange: (state: { isDirty: boolean; isSubmitting: boolean }) => void;
  onSaved: (message: string) => Promise<void>;
  segmentoId: string;
};

function getRecurrenceOccurrenceField(
  field: string | undefined,
): keyof RecurrenceOccurrenceFormData | null {
  const fieldName = getServerFieldName(field);
  const validFields: readonly (keyof RecurrenceOccurrenceFormData)[] = [
    "categoriaId",
    "contaId",
    "dataFinanceira",
    "descricao",
    "observacoes",
    "tipo",
    "valor",
  ];

  return validFields.find((validField) => validField === fieldName) ?? null;
}

export function RecurrenceOccurrenceForm({
  accounts,
  categories,
  dataOriginal,
  entryLabel,
  initialValues,
  onClose,
  onFormStateChange,
  onSaved,
  segmentoId,
}: RecurrenceOccurrenceFormProps) {
  const [scope, setScope] = useState<RecurrenceScope>("ONLY_THIS");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const editRecurrenceMutation = useMutation({
    mutationFn: ({
      dataOriginal: mutationDataOriginal,
      input,
      segmentoId: mutationSegmentoId,
    }: {
      dataOriginal: string;
      input: Parameters<typeof putOcorrenciaRecorrente>[2];
      segmentoId: string;
    }) => putOcorrenciaRecorrente(mutationSegmentoId, mutationDataOriginal, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionsQueryKey }).catch(() => undefined);
    },
  });
  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<RecurrenceOccurrenceFormData>({
    defaultValues: initialValues,
    mode: "onSubmit",
    resolver: zodResolver(recurrenceOccurrenceFormSchema),
  });
  const accountId = useWatch({ control, name: "contaId" });
  const transactionType = useWatch({ control, name: "tipo" });
  const value = useWatch({ control, name: "valor" });
  const date = useWatch({ control, name: "dataFinanceira" });
  const descriptionField = register("descricao");
  const observationsField = register("observacoes");
  const valueField = register("valor");
  const dateField = register("dataFinanceira");

  useEffect(() => {
    onFormStateChange({ isDirty, isSubmitting });
  }, [isDirty, isSubmitting, onFormStateChange]);

  const handleFormSubmit = async (data: RecurrenceOccurrenceFormData) => {
    setSubmitError(null);

    try {
      await editRecurrenceMutation.mutateAsync({
        dataOriginal,
        input: toEditRecurrenceOccurrenceRequest(data, scope),
        segmentoId,
      });
    } catch (error) {
      applyFormError(
        error,
        setError,
        getRecurrenceOccurrenceField,
        setSubmitError,
        `Não foi possível atualizar o ${entryLabel}. Tente novamente.`,
      );
      return;
    }

    await onSaved(
      `${entryLabel.charAt(0).toLocaleUpperCase("pt-BR") + entryLabel.slice(1)} atualizado com sucesso.`,
    );
  };

  const accountLabel =
    accounts.find((account) => account.id === accountId)?.nome ?? "conta não selecionada";

  return (
    <TransactionFormShell
      formId="recurrence-occurrence-edit-form"
      isSubmitting={isSubmitting}
      mode="recurrence"
      onClose={onClose}
      onModeChange={() => undefined}
      onSubmit={handleSubmit(handleFormSubmit)}
      showModeSelector={false}
      submitLabel={`Salvar ${entryLabel}`}
    >
      <RadioGroup
        description="Escolha quais ocorrências devem receber esta alteração."
        isDisabled={isSubmitting}
        label="Aplicar alteração"
        onChange={(nextValue) => {
          const nextScope = recurrenceScopeOptions.find(
            (option) => option.value === nextValue,
          )?.value;

          if (nextScope) {
            setScope(nextScope);
          }
        }}
        value={scope}
      >
        {recurrenceScopeOptions.map((option) => (
          <RadioItem description={option.description} key={option.value} value={option.value}>
            {option.label}
          </RadioItem>
        ))}
      </RadioGroup>
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
            label="Valor"
            maxLength={24}
            name={valueField.name}
            onBlur={valueField.onBlur}
            onInput={valueField.onChange}
            inputRef={valueField.ref}
            placeholder="0,00"
          />
          <TextField
            errorMessage={errors.dataFinanceira?.message}
            isDisabled={isSubmitting}
            label="Data financeira"
            name={dateField.name}
            onBlur={dateField.onBlur}
            onInput={dateField.onChange}
            inputRef={dateField.ref}
            type="date"
          />
        </div>
        <Controller
          control={control}
          name="contaId"
          render={({ field }) => (
            <AccountSelect
              accounts={accounts}
              errorMessage={errors.contaId?.message}
              includeSelectedInactive
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
              includeSelectedInactive
              isDisabled={isSubmitting}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
            />
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
          placeholder="Ex.: Supermercado"
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
          Resumo: {transactionType === "RECEITA" ? "receita" : "despesa"} de{" "}
          {formatMoneyForSummary(value)} na conta {accountLabel}, em{" "}
          {isValidFormDate(date) ? formatFormDate(date) : "data não informada"}.
        </output>
      </div>
    </TransactionFormShell>
  );
}
