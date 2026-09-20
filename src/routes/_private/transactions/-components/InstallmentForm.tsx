import { useState, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TextArea } from "../../../../components/TextArea";
import { TextField } from "../../../../components/TextField";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { postRecorrencia } from "../../../../services/recurrences/api";
import { transactionsQueryKey } from "../../../../services/transactions/queries";
import { applyFormError, getServerFieldName } from "./form-errors";
import {
  formatFormDate,
  formatMoneyForSummary,
  getInitialEntryDate,
  getTransactionTypeLabel,
  installmentFormSchema,
  isValidFormDate,
  toCreateInstallmentRequest,
  type InstallmentFormData,
  type TransactionEntryMode,
} from "./transaction-form";
import { AccountSelect, CategorySelect, TransactionTypeField } from "./TransactionFormFields";
import { TransactionFormShell } from "./TransactionFormShell";

type InstallmentFormProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  mode: TransactionEntryMode;
  onClose: () => void;
  onFormStateChange: (state: { isDirty: boolean; isSubmitting: boolean }) => void;
  onModeChange: (mode: TransactionEntryMode) => void;
  onSaved: (message: string) => Promise<void>;
  selectedMonth: Parameters<typeof getInitialEntryDate>[0];
};

function getInstallmentField(field: string | undefined): keyof InstallmentFormData | null {
  const fieldName = getServerFieldName(field);
  const validFields: readonly (keyof InstallmentFormData)[] = [
    "categoriaId",
    "contaId",
    "descricao",
    "inicio",
    "intervalo",
    "numeroPrimeiraParcela",
    "observacoes",
    "quantidadeTotalOriginal",
    "tipo",
    "valor",
  ];

  return validFields.find((validField) => validField === fieldName) ?? null;
}

export function InstallmentForm({
  accounts,
  categories,
  mode,
  onClose,
  onFormStateChange,
  onModeChange,
  onSaved,
  selectedMonth,
}: InstallmentFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createInstallmentMutation = useMutation({
    mutationFn: (input: Parameters<typeof postRecorrencia>[0]) => postRecorrencia(input),
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
  } = useForm<InstallmentFormData>({
    defaultValues: {
      categoriaId: null,
      contaId: "",
      descricao: "",
      inicio: getInitialEntryDate(selectedMonth),
      intervalo: "1",
      numeroPrimeiraParcela: "1",
      observacoes: "",
      quantidadeTotalOriginal: "",
      tipo: "DESPESA",
      valor: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(installmentFormSchema),
  });
  const accountId = useWatch({ control, name: "contaId" });
  const transactionType = useWatch({ control, name: "tipo" });
  const value = useWatch({ control, name: "valor" });
  const startDate = useWatch({ control, name: "inicio" });
  const interval = useWatch({ control, name: "intervalo" });
  const firstInstallment = useWatch({ control, name: "numeroPrimeiraParcela" });
  const totalInstallments = useWatch({ control, name: "quantidadeTotalOriginal" });
  const descriptionField = register("descricao");
  const observationsField = register("observacoes");
  const valueField = register("valor");
  const startDateField = register("inicio");
  const intervalField = register("intervalo");
  const firstInstallmentField = register("numeroPrimeiraParcela");
  const totalInstallmentsField = register("quantidadeTotalOriginal");

  useEffect(() => {
    onFormStateChange({ isDirty, isSubmitting });
  }, [isDirty, isSubmitting, onFormStateChange]);

  const handleFormSubmit = async (data: InstallmentFormData) => {
    setSubmitError(null);

    try {
      await createInstallmentMutation.mutateAsync(toCreateInstallmentRequest(data));
    } catch (error) {
      applyFormError(
        error,
        setError,
        getInstallmentField,
        setSubmitError,
        "Não foi possível cadastrar o parcelamento. Tente novamente.",
      );
      return;
    }

    await onSaved("Parcelamento cadastrado com sucesso.");
  };

  const activeAccountCount = accounts.filter((account) => account.ativo).length;
  const noActiveAccounts = activeAccountCount === 0;
  const accountLabel =
    accounts.find((account) => account.id === accountId)?.nome ?? "conta não selecionada";
  const summaryStart = isValidFormDate(startDate)
    ? formatFormDate(startDate)
    : "data não informada";

  return (
    <TransactionFormShell
      formId="installment-creation-form"
      isDisabled={noActiveAccounts}
      isSubmitting={isSubmitting}
      mode={mode}
      onClose={onClose}
      onModeChange={onModeChange}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel="Cadastrar parcelamento"
    >
      {noActiveAccounts && (
        <output
          aria-live="polite"
          className="m-0 rounded-xl border border-warning/25 bg-warning-soft px-3.5 py-3 text-body-small text-warning"
        >
          Cadastre uma conta ativa antes de registrar um parcelamento.
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
            label="Valor de cada parcela"
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
            label="Data da primeira parcela"
            name={startDateField.name}
            onBlur={startDateField.onBlur}
            onInput={startDateField.onChange}
            inputRef={startDateField.ref}
            type="date"
          />
        </div>
        <div className="grid min-w-0 gap-3.5 sm:grid-cols-3">
          <TextField
            errorMessage={errors.numeroPrimeiraParcela?.message}
            inputMode="numeric"
            isDisabled={isSubmitting}
            label="Número inicial"
            maxLength={10}
            name={firstInstallmentField.name}
            onBlur={firstInstallmentField.onBlur}
            onInput={firstInstallmentField.onChange}
            inputRef={firstInstallmentField.ref}
            placeholder="1"
          />
          <TextField
            errorMessage={errors.quantidadeTotalOriginal?.message}
            inputMode="numeric"
            isDisabled={isSubmitting}
            label="Total de parcelas"
            maxLength={10}
            name={totalInstallmentsField.name}
            onBlur={totalInstallmentsField.onBlur}
            onInput={totalInstallmentsField.onChange}
            inputRef={totalInstallmentsField.ref}
            placeholder="Ex.: 12"
          />
          <TextField
            description="Mensal"
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
        <output
          aria-live="polite"
          className="rounded-xl border border-border bg-surface-muted px-3.5 py-3 text-body-small text-muted"
        >
          O backend ajustará automaticamente os meses sem o dia escolhido para o último dia do mês.
        </output>
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
          placeholder="Ex.: Compra parcelada"
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
          Resumo: {getTransactionTypeLabel(transactionType).toLocaleLowerCase("pt-BR")} de{" "}
          {formatMoneyForSummary(value)} por parcela, da parcela {firstInstallment || "—"} de{" "}
          {totalInstallments || "—"}, na conta {accountLabel}, começando em {summaryStart}, a cada{" "}
          {interval || "1"} mês(es).
        </output>
      </div>
    </TransactionFormShell>
  );
}
