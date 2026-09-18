import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TextArea } from "../../../../components/TextArea";
import { TextField } from "../../../../components/TextField";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { postTransferencia, putTransferencia } from "../../../../services/transactions/api";
import { transactionsQueryKey } from "../../../../services/transactions/queries";
import { applyFormError, getServerFieldName } from "./form-errors";
import {
  formatFormDate,
  formatMoneyForSummary,
  getInitialEntryDate,
  isValidFormDate,
  toEditTransferRequest,
  toCreateTransferRequest,
  transferFormSchema,
  type TransactionEntryMode,
  type TransferFormData,
} from "./transaction-form";
import { AccountSelect, TransactionSituationField } from "./TransactionFormFields";
import { TransactionFormShell } from "./TransactionFormShell";

type TransferFormProps = {
  accounts: readonly ContaResponse[];
  initialValues?: TransferFormData;
  mode: TransactionEntryMode;
  onClose: () => void;
  onFormStateChange: (state: { isDirty: boolean; isSubmitting: boolean }) => void;
  onModeChange: (mode: TransactionEntryMode) => void;
  onSaved: (message: string) => Promise<void>;
  selectedMonth: Parameters<typeof getInitialEntryDate>[0];
  transferId?: string;
};

function getTransferField(field: string | undefined): keyof TransferFormData | null {
  const fieldName = getServerFieldName(field);
  const validFields: readonly (keyof TransferFormData)[] = [
    "contaDestinoId",
    "contaOrigemId",
    "dataFinanceira",
    "descricao",
    "observacoes",
    "situacao",
    "valor",
  ];

  return validFields.find((validField) => validField === fieldName) ?? null;
}

type EditTransferMutationVariables = {
  id: string;
  input: Parameters<typeof putTransferencia>[1];
};

export function TransferForm({
  accounts,
  initialValues,
  mode,
  onClose,
  onFormStateChange,
  onModeChange,
  onSaved,
  selectedMonth,
  transferId,
}: TransferFormProps) {
  const isEditing = transferId !== undefined;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createTransferMutation = useMutation({
    mutationFn: (input: Parameters<typeof postTransferencia>[0]) => postTransferencia(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionsQueryKey }).catch(() => undefined);
    },
  });
  const editTransferMutation = useMutation({
    mutationFn: ({ id, input }: EditTransferMutationVariables) => putTransferencia(id, input),
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
    setValue,
  } = useForm<TransferFormData>({
    defaultValues: initialValues ?? {
      contaDestinoId: "",
      contaOrigemId: "",
      dataFinanceira: getInitialEntryDate(selectedMonth),
      descricao: "",
      observacoes: "",
      situacao: "EFETIVADA",
      valor: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(transferFormSchema),
  });
  const originAccountId = useWatch({ control, name: "contaOrigemId" });
  const destinationAccountId = useWatch({ control, name: "contaDestinoId" });
  const originAccount = accounts.find((account) => account.id === originAccountId);
  const descriptionField = register("descricao");
  const observationsField = register("observacoes");
  const valueField = register("valor");
  const dateField = register("dataFinanceira");

  useEffect(() => {
    if (!originAccountId || !destinationAccountId) {
      return;
    }

    const destinationAccount = accounts.find((account) => account.id === destinationAccountId);

    if (
      !destinationAccount ||
      destinationAccount.id === originAccountId ||
      (originAccount && destinationAccount.moeda !== originAccount.moeda)
    ) {
      setValue("contaDestinoId", "", { shouldDirty: true, shouldValidate: false });
    }
  }, [accounts, destinationAccountId, originAccount, originAccountId, setValue]);

  useEffect(() => {
    onFormStateChange({ isDirty, isSubmitting });
  }, [isDirty, isSubmitting, onFormStateChange]);

  const handleFormSubmit = async (data: TransferFormData) => {
    setSubmitError(null);
    const selectedOriginAccount = accounts.find((account) => account.id === data.contaOrigemId);
    const selectedDestinationAccount = accounts.find(
      (account) => account.id === data.contaDestinoId,
    );

    if (
      selectedOriginAccount &&
      selectedDestinationAccount &&
      selectedOriginAccount.moeda !== selectedDestinationAccount.moeda
    ) {
      setError("contaDestinoId", {
        message: "A conta de destino precisa usar a mesma moeda da conta de origem.",
        type: "validate",
      });
      setSubmitError("Não é possível transferir entre moedas diferentes.");
      return;
    }

    try {
      if (isEditing && transferId) {
        await editTransferMutation.mutateAsync({
          id: transferId,
          input: toEditTransferRequest(data),
        });
      } else {
        await createTransferMutation.mutateAsync(toCreateTransferRequest(data));
      }
    } catch (error) {
      applyFormError(
        error,
        setError,
        getTransferField,
        setSubmitError,
        isEditing
          ? "Não foi possível atualizar a transferência. Tente novamente."
          : "Não foi possível cadastrar a transferência. Tente novamente.",
      );
      return;
    }

    await onSaved(
      isEditing ? "Transferência atualizada com sucesso." : "Transferência cadastrada com sucesso.",
    );
  };

  const activeAccounts = accounts.filter((account) => account.ativo);
  const noActiveAccounts = !isEditing && activeAccounts.length < 2;
  const summaryOrigin = originAccount?.nome ?? "origem não selecionada";
  const summaryDestination =
    accounts.find((account) => account.id === destinationAccountId)?.nome ??
    "destino não selecionado";
  const summaryDate = useWatch({ control, name: "dataFinanceira" });
  const summaryValue = useWatch({ control, name: "valor" });

  return (
    <TransactionFormShell
      formId={isEditing ? "transfer-edit-form" : "transfer-creation-form"}
      isDisabled={noActiveAccounts}
      isSubmitting={isSubmitting}
      mode={mode}
      onClose={onClose}
      onModeChange={onModeChange}
      onSubmit={handleSubmit(handleFormSubmit)}
      showModeSelector={!isEditing}
      submitLabel={isEditing ? "Salvar transferência" : "Cadastrar transferência"}
    >
      {noActiveAccounts && (
        <output
          aria-live="polite"
          className="m-0 rounded-xl border border-warning/25 bg-warning-soft px-3.5 py-3 text-body-small text-warning"
        >
          Cadastre pelo menos duas contas ativas para fazer uma transferência.
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
        <div className="grid min-w-0 gap-3.5 sm:grid-cols-2">
          <Controller
            control={control}
            name="contaOrigemId"
            render={({ field }) => (
              <AccountSelect
                accounts={accounts}
                errorMessage={errors.contaOrigemId?.message}
                includeSelectedInactive={isEditing}
                isDisabled={isSubmitting}
                label="Conta de origem"
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
          <Controller
            control={control}
            name="contaDestinoId"
            render={({ field }) => (
              <AccountSelect
                accounts={accounts}
                currency={originAccount?.moeda}
                description={
                  originAccount
                    ? `Somente contas em ${originAccount.moeda} serão exibidas.`
                    : "Escolha a origem para filtrar pela mesma moeda."
                }
                errorMessage={errors.contaDestinoId?.message}
                excludedAccountId={originAccountId}
                includeSelectedInactive={isEditing}
                isDisabled={isSubmitting}
                label="Conta de destino"
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
        </div>
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
          placeholder="Ex.: Reserva para investimentos"
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
          Resumo: transferência de {formatMoneyForSummary(summaryValue)} entre {summaryOrigin} e{" "}
          {summaryDestination}, em{" "}
          {isValidFormDate(summaryDate) ? formatFormDate(summaryDate) : "data não informada"}.
        </output>
      </div>
    </TransactionFormShell>
  );
}
