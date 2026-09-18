import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TextArea } from "../../../../components/TextArea";
import { TextField } from "../../../../components/TextField";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { postTransacao } from "../../../../services/transactions/api";
import { transactionsQueryKey } from "../../../../services/transactions/queries";
import { applyFormError, getServerFieldName } from "./form-errors";
import {
  formatFormDate,
  formatMoneyForSummary,
  getFormSubmitLabel,
  getInitialEntryDate,
  getTransactionTypeLabel,
  isValidFormDate,
  toCreateTransactionRequest,
  transactionFormSchema,
  type TransactionFormData,
  type TransactionEntryMode,
} from "./transaction-form";
import {
  AccountSelect,
  CategorySelect,
  TransactionSituationField,
  TransactionTypeField,
} from "./TransactionFormFields";
import { TransactionFormShell } from "./TransactionFormShell";

type TransactionFormProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  mode: TransactionEntryMode;
  onClose: () => void;
  onFormStateChange: (state: { isDirty: boolean; isSubmitting: boolean }) => void;
  onModeChange: (mode: TransactionEntryMode) => void;
  onSaved: (message: string) => Promise<void>;
  selectedMonth: Parameters<typeof getInitialEntryDate>[0];
};

function getTransactionField(field: string | undefined): keyof TransactionFormData | null {
  const fieldName = getServerFieldName(field);
  const validFields: readonly (keyof TransactionFormData)[] = [
    "categoriaId",
    "contaId",
    "dataFinanceira",
    "descricao",
    "observacoes",
    "situacao",
    "tipo",
    "valor",
  ];

  return validFields.find((validField) => validField === fieldName) ?? null;
}

export function TransactionForm({
  accounts,
  categories,
  mode,
  onClose,
  onFormStateChange,
  onModeChange,
  onSaved,
  selectedMonth,
}: TransactionFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createTransactionMutation = useMutation({
    mutationFn: (input: Parameters<typeof postTransacao>[0]) => postTransacao(input),
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
  } = useForm<TransactionFormData>({
    defaultValues: {
      categoriaId: null,
      contaId: "",
      dataFinanceira: getInitialEntryDate(selectedMonth),
      descricao: "",
      observacoes: "",
      situacao: "EFETIVADA",
      tipo: "DESPESA",
      valor: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(transactionFormSchema),
  });
  const descriptionField = register("descricao");
  const observationsField = register("observacoes");
  const valueField = register("valor");
  const dateField = register("dataFinanceira");
  const accountId = useWatch({ control, name: "contaId" });
  const transactionType = useWatch({ control, name: "tipo" });
  const transactionSituation = useWatch({ control, name: "situacao" });
  const summaryDate = useWatch({ control, name: "dataFinanceira" });
  const summaryValue = useWatch({ control, name: "valor" });

  useEffect(() => {
    onFormStateChange({ isDirty, isSubmitting });
  }, [isDirty, isSubmitting, onFormStateChange]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    setSubmitError(null);

    try {
      await createTransactionMutation.mutateAsync(toCreateTransactionRequest(data));
    } catch (error) {
      applyFormError(
        error,
        setError,
        getTransactionField,
        setSubmitError,
        "Não foi possível cadastrar a transação. Tente novamente.",
      );
      return;
    }

    await onSaved("Transação cadastrada com sucesso.");
  };

  const activeAccountCount = accounts.filter((account) => account.ativo).length;
  const noActiveAccounts = activeAccountCount === 0;

  return (
    <TransactionFormShell
      formId="transaction-creation-form"
      isDisabled={noActiveAccounts}
      isSubmitting={isSubmitting}
      mode={mode}
      onClose={onClose}
      onModeChange={onModeChange}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel={getFormSubmitLabel(mode)}
    >
      {noActiveAccounts && (
        <output
          aria-live="polite"
          className="m-0 rounded-xl border border-warning/25 bg-warning-soft px-3.5 py-3 text-body-small text-warning"
        >
          Cadastre uma conta ativa antes de registrar uma transação.
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
          name="situacao"
          render={({ field }) => (
            <TransactionSituationField
              isDisabled={isSubmitting}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
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
          Resumo: {getTransactionTypeLabel(transactionType)} de{" "}
          {formatMoneyForSummary(summaryValue)}
          na conta{" "}
          {accounts.find((account) => account.id === accountId)?.nome ??
            "conta não selecionada"},{" "}
          {transactionSituation.toLocaleLowerCase("pt-BR")} em{" "}
          {isValidFormDate(summaryDate) ? formatFormDate(summaryDate) : "data não informada"}.
        </output>
      </div>
    </TransactionFormShell>
  );
}
