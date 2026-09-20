import { useCallback, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../../../../components/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../../../components/Modal";
import { NumberField } from "../../../../components/NumberField";
import { RadioGroup, RadioItem } from "../../../../components/RadioGroup";
import { TextArea } from "../../../../components/TextArea";
import { TextField } from "../../../../components/TextField";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { putOcorrenciaRecorrente } from "../../../../services/recurrences/api";
import { type RecurrenceScope } from "../../../../services/recurrences/contracts";
import { putTransacao } from "../../../../services/transactions/api";
import {
  formularioEdicaoOperacaoFinanceiraSchema,
  type ConsultaTransacaoItem,
  type FormularioEdicaoOperacaoFinanceira,
  type FormularioTipoOperacao,
  parseMoneyInput,
} from "../../../../services/transactions/contracts";
import { transactionsQueryKey } from "../../../../services/transactions/queries";
import { putTransferencia } from "../../../../services/transfers/api";
import { DiscardChangesModal, type DiscardAction } from "./DiscardChangesModal";
import { applyFormError, getServerFieldName } from "./form-errors";
import {
  formatFormDate,
  formatMoneyForSummary,
  isValidFormDate,
  recurrenceScopeOptions,
  toEditRecurrenceOccurrenceRequest,
  toEditTransactionRequest,
  toEditTransferRequest,
} from "./transaction-form";
import {
  AccountSelect,
  CategorySelect,
  TransactionSituationField,
  TransactionTypeField,
} from "./TransactionFormFields";

type TransactionEditModalProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  target: ConsultaTransacaoItem;
};

type EditOperationResponse =
  | Awaited<ReturnType<typeof putOcorrenciaRecorrente>>
  | Awaited<ReturnType<typeof putTransacao>>
  | Awaited<ReturnType<typeof putTransferencia>>;

function getEditOperation(target: ConsultaTransacaoItem): FormularioTipoOperacao | null {
  switch (target.origem) {
    case "TRANSACAO_SIMPLES":
      return "TRANSACAO";
    case "TRANSFERENCIA":
      return "TRANSFERENCIA";
    case "TRANSACAO_RECORRENTE":
      return "RECORRENCIA";
    case "PARCELA":
      return "PARCELAMENTO";
    case "SALDO_INICIAL_CONTA":
      return null;
    default: {
      const exhaustive: never = target.origem;
      return exhaustive;
    }
  }
}

function getOperationLabel(operation: FormularioTipoOperacao) {
  switch (operation) {
    case "TRANSACAO":
      return "transação";
    case "TRANSFERENCIA":
      return "transferência";
    case "RECORRENCIA":
      return "recorrência";
    case "PARCELAMENTO":
      return "parcelamento";
    default: {
      const exhaustive: never = operation;
      return exhaustive;
    }
  }
}

function getSuccessMessage(operation: FormularioTipoOperacao) {
  switch (operation) {
    case "TRANSACAO":
      return "Transação atualizada com sucesso.";
    case "TRANSFERENCIA":
      return "Transferência atualizada com sucesso.";
    case "RECORRENCIA":
      return "Recorrência atualizada com sucesso.";
    case "PARCELAMENTO":
      return "Parcelamento atualizado com sucesso.";
    default: {
      const exhaustive: never = operation;
      return exhaustive;
    }
  }
}

function getErrorFallback(operation: FormularioTipoOperacao) {
  switch (operation) {
    case "TRANSACAO":
      return "Não foi possível atualizar a transação. Tente novamente.";
    case "TRANSFERENCIA":
      return "Não foi possível atualizar a transferência. Tente novamente.";
    case "RECORRENCIA":
      return "Não foi possível atualizar a recorrência. Tente novamente.";
    case "PARCELAMENTO":
      return "Não foi possível atualizar o parcelamento. Tente novamente.";
    default: {
      const exhaustive: never = operation;
      return exhaustive;
    }
  }
}

function getRequiredTargetId(value: string | null | undefined, fieldName: string) {
  if (!value) {
    throw new Error(`O ${fieldName} da operação não foi encontrado.`);
  }

  return value;
}

function getInitialValues(
  target: ConsultaTransacaoItem,
  operation: FormularioTipoOperacao,
): FormularioEdicaoOperacaoFinanceira {
  const isTransfer = operation === "TRANSFERENCIA";
  const isTransferOrigin = isTransfer && target.valor < 0;
  const counterpartyAccountId = target.contaContraparteId ?? "";

  return {
    categoriaId: isTransfer ? null : (target.categoriaId ?? null),
    contaDestinoId: isTransfer ? (isTransferOrigin ? counterpartyAccountId : target.contaId) : "",
    contaId: isTransfer ? "" : target.contaId,
    contaOrigemId: isTransfer ? (isTransferOrigin ? target.contaId : counterpartyAccountId) : "",
    data: target.dataFinanceira,
    descricao: target.descricao,
    observacoes: target.observacoes ?? "",
    situacao: target.situacao ?? "PLANEJADA",
    tipo: target.valor >= 0 ? "RECEITA" : "DESPESA",
    tipoOperacao: operation,
    valor: String(Math.abs(target.valor)),
  };
}

function getEditField(field: string | undefined): keyof FormularioEdicaoOperacaoFinanceira | null {
  const fieldName = getServerFieldName(field);

  if (
    fieldName === "dataFinanceira" ||
    fieldName === "dataInicio" ||
    fieldName === "dataPrimeiraOcorrencia" ||
    fieldName === "inicio"
  ) {
    return "data";
  }

  const validFields: readonly (keyof FormularioEdicaoOperacaoFinanceira)[] = [
    "categoriaId",
    "contaDestinoId",
    "contaId",
    "contaOrigemId",
    "data",
    "descricao",
    "observacoes",
    "situacao",
    "tipo",
    "tipoOperacao",
    "valor",
  ];

  return validFields.find((validField) => validField === fieldName) ?? null;
}

export function TransactionEditModal({
  accounts,
  categories,
  onClose,
  onSaved,
  target,
}: TransactionEditModalProps) {
  const editOperation = getEditOperation(target);
  const operation = editOperation ?? "TRANSACAO";
  const operationLabel = getOperationLabel(operation);
  const isTransfer = operation === "TRANSFERENCIA";
  const isRecurring = operation === "RECORRENCIA" || operation === "PARCELAMENTO";
  const [discardAction, setDiscardAction] = useState<DiscardAction>(null);
  const [isScopeDirty, setIsScopeDirty] = useState(false);
  const [scope, setScope] = useState<RecurrenceScope>("ONLY_THIS");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const editMutation = useMutation<
    EditOperationResponse,
    unknown,
    FormularioEdicaoOperacaoFinanceira
  >({
    mutationFn: (data) => {
      switch (data.tipoOperacao) {
        case "TRANSACAO":
          return putTransacao(
            getRequiredTargetId(target.operacaoId, "identificador da transação"),
            toEditTransactionRequest(data),
          );
        case "TRANSFERENCIA":
          return putTransferencia(
            getRequiredTargetId(target.operacaoId, "identificador da transferência"),
            toEditTransferRequest(data),
          );
        case "RECORRENCIA":
        case "PARCELAMENTO":
          return putOcorrenciaRecorrente(
            getRequiredTargetId(target.segmentoRecorrenciaId, "segmento da recorrência"),
            getRequiredTargetId(target.dataOriginalRecorrencia, "data original da ocorrência"),
            toEditRecurrenceOccurrenceRequest(data, scope),
          );
        default: {
          const exhaustive: never = data.tipoOperacao;
          return exhaustive;
        }
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionsQueryKey }).catch(() => undefined);
    },
  });
  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    setError,
    setValue,
  } = useForm<FormularioEdicaoOperacaoFinanceira>({
    defaultValues: getInitialValues(target, operation),
    mode: "onSubmit",
    resolver: zodResolver(formularioEdicaoOperacaoFinanceiraSchema),
  });
  const accountId = useWatch({ control, name: "contaId" });
  const destinationAccountId = useWatch({ control, name: "contaDestinoId" });
  const originAccountId = useWatch({ control, name: "contaOrigemId" });
  const transactionType = useWatch({ control, name: "tipo" });
  const summaryDate = useWatch({ control, name: "data" });
  const summaryValue = useWatch({ control, name: "valor" });
  const originAccount = accounts.find((account) => account.id === originAccountId);

  useEffect(() => {
    if (!isTransfer || !originAccountId || !destinationAccountId) {
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
  }, [accounts, destinationAccountId, isTransfer, originAccount, originAccountId, setValue]);

  const requestClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (isDirty || isScopeDirty) {
      setDiscardAction({ kind: "close" });
      return;
    }

    onClose();
  }, [isDirty, isScopeDirty, isSubmitting, onClose, setDiscardAction]);

  const handleDiscardCancel = useCallback(() => {
    setDiscardAction(null);
  }, [setDiscardAction]);

  const handleDiscardConfirm = useCallback(() => {
    if (!discardAction) {
      return;
    }

    setDiscardAction(null);
    onClose();
  }, [discardAction, onClose, setDiscardAction]);

  const handleFormSubmit = async (data: FormularioEdicaoOperacaoFinanceira) => {
    setSubmitError(null);

    if (data.tipoOperacao === "TRANSFERENCIA") {
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
    }

    try {
      await editMutation.mutateAsync(data);
    } catch (error) {
      applyFormError(
        error,
        setError,
        getEditField,
        setSubmitError,
        getErrorFallback(data.tipoOperacao),
      );
      return;
    }

    await onSaved(getSuccessMessage(data.tipoOperacao));
  };

  if (editOperation === null) {
    return null;
  }

  const accountLabel =
    accounts.find((account) => account.id === accountId)?.nome ?? "conta não selecionada";
  const summary = isTransfer ? (
    <>
      Resumo: transferência de {formatMoneyForSummary(summaryValue)} entre{" "}
      {originAccount?.nome ?? "origem não selecionada"} e{" "}
      {accounts.find((account) => account.id === destinationAccountId)?.nome ??
        "destino não selecionado"}
      , em {isValidFormDate(summaryDate) ? formatFormDate(summaryDate) : "data não informada"}.
    </>
  ) : (
    <>
      Resumo: {transactionType === "RECEITA" ? "receita" : "despesa"} de{" "}
      {formatMoneyForSummary(summaryValue)} na conta {accountLabel}, em{" "}
      {isValidFormDate(summaryDate) ? formatFormDate(summaryDate) : "data não informada"}.
    </>
  );

  return (
    <>
      <Modal
        description="Atualize os dados da movimentação selecionada."
        isDismissable={!isSubmitting && discardAction === null}
        isKeyboardDismissDisabled={isSubmitting}
        isOpen
        onOpenChange={(open) => {
          if (!open) {
            requestClose();
          }
        }}
        showCloseButton={!isSubmitting && discardAction === null}
        size="lg"
        title={`Editar ${operationLabel}`}
      >
        <ModalHeader />
        <form className="contents" noValidate onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalBody>
            {submitError && (
              <p
                aria-live="assertive"
                className="m-0 rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
                role="alert"
              >
                {submitError}
              </p>
            )}

            {isRecurring && (
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
                    setIsScopeDirty(nextScope !== "ONLY_THIS");
                  }
                }}
                value={scope}
              >
                {recurrenceScopeOptions.map((option) => (
                  <RadioItem
                    description={option.description}
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </RadioItem>
                ))}
              </RadioGroup>
            )}

            {!isTransfer && (
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
            )}

            <div className="grid min-w-0 gap-3.5 sm:grid-cols-[minmax(0,1fr)_12rem]">
              <Controller
                control={control}
                name="descricao"
                render={({ field }) => (
                  <TextField
                    autoComplete="off"
                    className="min-w-0"
                    errorMessage={errors.descricao?.message}
                    isDisabled={isSubmitting}
                    label="Descrição"
                    maxLength={255}
                    name={field.name}
                    onBlur={field.onBlur}
                    onInput={field.onChange}
                    inputRef={field.ref}
                    placeholder="Ex.: Supermercado"
                    value={field.value}
                  />
                )}
              />
              <Controller
                control={control}
                name="valor"
                render={({ field }) => (
                  <NumberField
                    autoComplete="off"
                    className="min-w-0"
                    errorMessage={errors.valor?.message}
                    formatOptions={{ currency: "BRL", maximumFractionDigits: 4, style: "currency" }}
                    inputMode="decimal"
                    isDisabled={isSubmitting}
                    label={operation === "PARCELAMENTO" ? "Valor da parcela" : "Valor"}
                    maxLength={24}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={(value) => field.onChange(Number.isNaN(value) ? "" : String(value))}
                    inputRef={field.ref}
                    placeholder="R$ 0,00"
                    showStepperButton
                    value={parseMoneyInput(field.value) ?? undefined}
                  />
                )}
              />
            </div>

            <div className="grid min-w-0 gap-3.5 sm:grid-cols-2">
              <Controller
                control={control}
                name="data"
                render={({ field }) => (
                  <TextField
                    errorMessage={errors.data?.message}
                    isDisabled={isSubmitting}
                    label="Data financeira"
                    name={field.name}
                    onBlur={field.onBlur}
                    onInput={field.onChange}
                    inputRef={field.ref}
                    type="date"
                    value={field.value}
                  />
                )}
              />
              {isTransfer || operation === "TRANSACAO" ? (
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
              ) : (
                <div />
              )}
            </div>

            {isTransfer ? (
              <div className="grid min-w-0 gap-3.5 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="contaOrigemId"
                  render={({ field }) => (
                    <AccountSelect
                      accounts={accounts}
                      errorMessage={errors.contaOrigemId?.message}
                      includeSelectedInactive
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
                      includeSelectedInactive
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
            ) : (
              <div className="grid min-w-0 gap-3.5 sm:grid-cols-2">
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
              </div>
            )}

            <Controller
              control={control}
              name="observacoes"
              render={({ field }) => (
                <TextArea
                  errorMessage={errors.observacoes?.message}
                  isDisabled={isSubmitting}
                  label="Observações"
                  maxLength={2000}
                  name={field.name}
                  onBlur={field.onBlur}
                  onInput={field.onChange}
                  placeholder="Adicione uma observação opcional"
                  textAreaRef={field.ref}
                  value={field.value}
                />
              )}
            />

            <output
              aria-live="polite"
              className="rounded-xl border border-border bg-surface-muted px-3.5 py-3 text-body-small text-muted"
            >
              {summary}
            </output>
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={isSubmitting}
              onPress={requestClose}
              size="sm"
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button isDisabled={isSubmitting} isPending={isSubmitting} size="sm" type="submit">
              Salvar {operationLabel}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
      <DiscardChangesModal
        action={discardAction}
        onCancel={handleDiscardCancel}
        onConfirm={handleDiscardConfirm}
      />
    </>
  );
}
