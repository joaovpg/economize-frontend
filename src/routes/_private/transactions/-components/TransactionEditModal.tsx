import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { today } from "@internationalized/date";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../../../../components/Button";
import { CurrencyField } from "../../../../components/fields/CurrencyField";
import { DatePicker } from "../../../../components/fields/DatePicker";
import { RadioGroup, RadioItem } from "../../../../components/fields/RadioGroup";
import { TextArea } from "../../../../components/fields/TextArea";
import { TextField } from "../../../../components/fields/TextField";
import { InlineMessage } from "../../../../components/InlineMessage";
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../components/Modal";
import { getGuidedApiErrorMessage } from "../../../../lib/api-errors";
import { isDataIsoValida, parseFormDate, transactionTimeZone } from "../../../../lib/date";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { putTransacao } from "../../../../services/transactions/api";
import {
  type ConsultaTransacaoItem,
  type EscopoEdicaoTransacao,
  type RepeticaoTransacaoRequest,
} from "../../../../services/transactions/contracts";
import { transactionsQueryKey } from "../../../../services/transactions/queries";
import { putTransferencia } from "../../../../services/transfers/api";
import { DiscardChangesModal, type DiscardAction } from "./DiscardChangesModal";
import { applyFormError, getServerFieldName, isStaleTransactionError } from "./form-errors";
import {
  formatFormDate,
  formatMoneyForSummary,
  formularioOperacaoFinanceiraSchema,
  getEscopoEdicaoOptions,
  getRequiredTargetId,
  toEditTransactionRequest,
  toEditTransferRequest,
  type FormularioOperacaoFinanceira,
  type FormularioTipoOperacao,
} from "./transaction-form";
import { getRepeticaoResumo } from "./transaction-repetition";
import {
  createRepeticaoFormValuesParaEscopo,
  toRepeticaoFormValues,
  toRepeticaoRequestFromForm,
} from "./transaction-repetition-form";
import {
  AccountSelect,
  CategorySelect,
  TransactionSituationField,
  TransactionTypeField,
} from "./TransactionFormFields";
import { TransactionRepetitionFields } from "./TransactionRepetitionFields";

type TransactionEditModalProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  target: ConsultaTransacaoItem;
};

type EditOperationResponse =
  | Awaited<ReturnType<typeof putTransacao>>
  | Awaited<ReturnType<typeof putTransferencia>>;

function getEditOperation(target: ConsultaTransacaoItem): FormularioTipoOperacao | null {
  switch (target.origem) {
    case "TRANSACAO_SIMPLES":
    case "TRANSACAO_RECORRENTE":
    case "PARCELA":
      return "TRANSACAO";
    case "TRANSFERENCIA":
      return "TRANSFERENCIA";
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
    default: {
      const exhaustive: never = operation;
      return exhaustive;
    }
  }
}

function getInitialValues(
  target: ConsultaTransacaoItem,
  operation: FormularioTipoOperacao,
  escopoInicial: EscopoEdicaoTransacao,
): FormularioOperacaoFinanceira {
  const isTransfer = operation === "TRANSFERENCIA";
  const isTransferOrigin = isTransfer && target.valor < 0;
  const counterpartyAccountId = target.contaContraparteId ?? "";
  const destinationAccountId = isTransferOrigin ? counterpartyAccountId : target.contaId;
  const originAccountId = isTransferOrigin ? target.contaId : counterpartyAccountId;

  return {
    categoriaId: isTransfer ? null : (target.categoriaId ?? null),
    contaDestinoId: isTransfer ? destinationAccountId : "",
    contaId: isTransfer ? "" : target.contaId,
    contaOrigemId: isTransfer ? originAccountId : "",
    data: target.dataFinanceira,
    descricao: target.descricao,
    observacoes: target.observacoes ?? "",
    repeticao: createRepeticaoFormValuesParaEscopo(target, escopoInicial),
    situacao: target.situacao ?? "PLANEJADA",
    tipo: target.valor >= 0 ? "RECEITA" : "DESPESA",
    tipoOperacao: operation,
    valor: String(Math.abs(target.valor)),
  };
}

function getEditField(field: string | undefined): keyof FormularioOperacaoFinanceira | null {
  const fieldName = getServerFieldName(field);

  if (
    fieldName === "dataFinanceira" ||
    fieldName === "dataInicio" ||
    fieldName === "dataPrimeiraOcorrencia" ||
    fieldName === "inicio"
  ) {
    return "data";
  }

  const validFields: readonly (keyof FormularioOperacaoFinanceira)[] = [
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

/**
 * Reenvia a repetição lida da ocorrência, sem alterar a regra. Usado em "Somente esta", que não
 * altera a regra da série.
 */
function getRepeticaoLidaParaEscrita(target: ConsultaTransacaoItem): RepeticaoTransacaoRequest {
  const repeticao = toRepeticaoRequestFromForm(toRepeticaoFormValues(target.repeticao ?? null));

  if (!repeticao) {
    throw new Error("A repetição da ocorrência não foi encontrada.");
  }

  return repeticao;
}

type RepetitionSummaryProps = {
  target: ConsultaTransacaoItem;
};

/** Resumo somente leitura da repetição de uma ocorrência de série em "Somente esta". */
function RepetitionSummary({ target }: RepetitionSummaryProps) {
  const summary = getRepeticaoResumo(target);

  return (
    <section className="grid min-w-0 gap-2 rounded-control border border-border bg-surface-muted px-3 py-3">
      <p className="m-0 text-body-strong text-foreground">Repetir</p>
      {summary && <p className="m-0 text-body text-muted">{summary}</p>}
    </section>
  );
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
  const isRecurring = target.origem === "TRANSACAO_RECORRENTE" || target.origem === "PARCELA";
  const [discardAction, setDiscardAction] = useState<DiscardAction>(null);
  const [isScopeDirty, setIsScopeDirty] = useState(false);
  const scopeOptions = getEscopoEdicaoOptions(target);
  const initialScope = scopeOptions.find((option) => !option.isDisabled)?.value ?? "SOMENTE_ESTA";
  const [scope, setScope] = useState<EscopoEdicaoTransacao>(initialScope);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const editMutation = useMutation<EditOperationResponse, unknown, FormularioOperacaoFinanceira>({
    mutationFn: (data) => {
      switch (data.tipoOperacao) {
        case "TRANSACAO":
          return putTransacao(
            getRequiredTargetId(target.chaveEdicao, "chave de edição da transação"),
            toEditTransactionRequest(data, {
              escopo: isRecurring ? scope : undefined,
              repeticao:
                isRecurring && scope === "SOMENTE_ESTA"
                  ? getRepeticaoLidaParaEscrita(target)
                  : toRepeticaoRequestFromForm(data.repeticao),
              versaoEdicao: getRequiredTargetId(
                target.versaoEdicao,
                "versão de edição da transação",
              ),
            }),
          );
        case "TRANSFERENCIA":
          return putTransferencia(
            getRequiredTargetId(target.operacaoId, "identificador da transferência"),
            toEditTransferRequest(
              data,
              getRequiredTargetId(target.versaoEdicao, "versão de edição da transferência"),
            ),
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
    clearErrors,
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    setError,
    setValue,
  } = useForm<FormularioOperacaoFinanceira>({
    defaultValues: getInitialValues(target, operation, initialScope),
    mode: "onSubmit",
    resolver: zodResolver(formularioOperacaoFinanceiraSchema),
  });
  const situation = useWatch({ control, name: "situacao" });
  const accountId = useWatch({ control, name: "contaId" });
  const destinationAccountId = useWatch({ control, name: "contaDestinoId" });
  const originAccountId = useWatch({ control, name: "contaOrigemId" });
  const transactionType = useWatch({ control, name: "tipo" });
  const summaryDate = useWatch({ control, name: "data" });
  const summaryValue = useWatch({ control, name: "valor" });
  const repetitionActive = useWatch({ control, name: "repeticao.ativa" });
  const repetitionEndType = useWatch({ control, name: "repeticao.termino.tipo" });
  // "Somente esta" mostra a repetição lida e não a edita; o formulário fica com a seção desligada.
  const isRepetitionEditable = !isTransfer && (!isRecurring || scope === "ESTA_E_AS_PROXIMAS");
  const isInstallment =
    scope === "SOMENTE_ESTA" && isRecurring
      ? target.repeticao?.termino.tipo === "PARCELAS"
      : repetitionActive && repetitionEndType === "PARCELAS";
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

  const handleFormSubmit = async (data: FormularioOperacaoFinanceira) => {
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
      const guidedMessage = getGuidedApiErrorMessage(error);

      if (guidedMessage) {
        setSubmitError(guidedMessage);

        if (isStaleTransactionError(error)) {
          void queryClient
            .invalidateQueries({ queryKey: transactionsQueryKey })
            .catch(() => undefined);
        }

        return;
      }

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
      , em {isDataIsoValida(summaryDate) ? formatFormDate(summaryDate) : "data não informada"}.
    </>
  ) : (
    <>
      Resumo: {transactionType === "RECEITA" ? "receita" : "despesa"} de{" "}
      {formatMoneyForSummary(summaryValue)} na conta {accountLabel}, em{" "}
      {isDataIsoValida(summaryDate) ? formatFormDate(summaryDate) : "data não informada"}.
    </>
  );

  return (
    <>
      <Modal
        isDismissable={!isSubmitting && discardAction === null}
        isKeyboardDismissDisabled={isSubmitting}
        isOpen
        initialFocus={isTransfer ? descriptionInputRef : undefined}
        onOpenChange={(open) => {
          if (!open) {
            requestClose();
          }
        }}
        size="lg"
      >
        <ModalHeader showClose={!isSubmitting && discardAction === null}>
          <ModalTitle>Editar {operationLabel}</ModalTitle>
          <ModalDescription>Atualize os dados da movimentação selecionada.</ModalDescription>
        </ModalHeader>
        <form className="contents" noValidate onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalBody>
            {submitError && <InlineMessage tone="danger">{submitError}</InlineMessage>}

            {isRecurring && (
              <RadioGroup
                description="Escolha quais ocorrências devem receber esta alteração."
                isDisabled={isSubmitting}
                label="Aplicar alteração"
                onChange={(nextValue) => {
                  const nextScope = scopeOptions.find(
                    (option) => option.value === nextValue,
                  )?.value;

                  if (nextScope) {
                    setScope(nextScope);
                    setIsScopeDirty(nextScope !== "SOMENTE_ESTA");
                    // Voltar para "Somente esta" descarta as mudanças na repetição.
                    setValue("repeticao", createRepeticaoFormValuesParaEscopo(target, nextScope), {
                      shouldDirty: true,
                      shouldValidate: false,
                    });
                    clearErrors("repeticao");
                  }
                }}
                value={scope}
              >
                {scopeOptions.map((option) => (
                  <RadioItem
                    description={option.description}
                    focusOnOpen={option.value === "SOMENTE_ESTA"}
                    isDisabled={option.isDisabled}
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
                    isRequired
                    focusOnOpen={!isRecurring}
                    isDisabled={isSubmitting}
                    onChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
            )}

            <div className="grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_var(--spacing-form-aside)]">
              <Controller
                control={control}
                name="descricao"
                render={({ field }) => (
                  <TextField
                    autoComplete="off"
                    className="min-w-0"
                    errorMessage={errors.descricao?.message}
                    isDisabled={isSubmitting}
                    isRequired
                    label="Descrição"
                    maxLength={255}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    ref={(input) => {
                      descriptionInputRef.current = input;
                      field.ref(input);
                    }}
                    placeholder="Ex.: Supermercado"
                    value={field.value}
                  />
                )}
              />
              <Controller
                control={control}
                name="valor"
                render={({ field }) => {
                  const displayValue =
                    field.value === ""
                      ? ""
                      : new Intl.NumberFormat("en-US", {
                          maximumFractionDigits: 2,
                          useGrouping: false,
                        }).format(Number(field.value));
                  const hasExtraPrecision = Number(field.value) !== Number(displayValue);

                  return (
                    <CurrencyField
                      autoComplete="off"
                      className="min-w-0"
                      errorMessage={errors.valor?.message}
                      description={
                        hasExtraPrecision
                          ? `Valor original: R$ ${formatMoneyForSummary(field.value)}. Será mantido até você alterar este campo.`
                          : undefined
                      }
                      isDisabled={isSubmitting}
                      isRequired
                      label={isInstallment ? "Valor de cada parcela" : "Valor"}
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      ref={field.ref}
                      placeholder="R$ 0,00"
                      value={displayValue}
                    />
                  );
                }}
              />
            </div>

            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="data"
                render={({ field }) => (
                  <DatePicker
                    todayValue={today(transactionTimeZone)}
                    errorMessage={errors.data?.message}
                    isDisabled={isSubmitting}
                    isRequired
                    label="Data financeira"
                    maxValue={
                      (operation === "TRANSACAO" || isTransfer) && situation === "EFETIVADA"
                        ? today(transactionTimeZone)
                        : undefined
                    }
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={(date) => field.onChange(date?.toString() ?? "")}
                    ref={field.ref}
                    value={parseFormDate(field.value)}
                  />
                )}
              />
              {isTransfer || operation === "TRANSACAO" ? (
                <Controller
                  control={control}
                  name="situacao"
                  render={({ field }) => (
                    <TransactionSituationField
                      isRequired
                      description={
                        isRepetitionEditable && repetitionActive
                          ? "Vale só para a primeira ocorrência"
                          : undefined
                      }
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
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="contaOrigemId"
                  render={({ field }) => (
                    <AccountSelect
                      accounts={accounts}
                      errorMessage={errors.contaOrigemId?.message}
                      includeSelectedInactive
                      isDisabled={isSubmitting}
                      isRequired
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
                      isRequired
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
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="contaId"
                  render={({ field }) => (
                    <AccountSelect
                      accounts={accounts}
                      errorMessage={errors.contaId?.message}
                      includeSelectedInactive
                      isDisabled={isSubmitting}
                      isRequired
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

            {isRecurring && scope === "SOMENTE_ESTA" && <RepetitionSummary target={target} />}

            {isRepetitionEditable && (
              <>
                <TransactionRepetitionFields
                  control={control}
                  dataFinanceira={summaryDate}
                  isDisabled={isSubmitting}
                  valoresAoAtivar={createRepeticaoFormValuesParaEscopo(target, scope)}
                />
                {isRecurring && (
                  <InlineMessage tone="warning">
                    Altera esta ocorrência e as seguintes; a data desta ocorrência passa a ser o
                    início da nova regra.
                  </InlineMessage>
                )}
                {isRecurring && !repetitionActive && (
                  <InlineMessage tone="warning">
                    Esta ocorrência vira uma transação simples e as próximas deixam de existir.
                    Ocorrências já efetivadas são mantidas.
                  </InlineMessage>
                )}
              </>
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
                  onChange={field.onChange}
                  placeholder="Adicione uma observação opcional"
                  ref={field.ref}
                  value={field.value}
                />
              )}
            />

            <output
              aria-live="polite"
              className="rounded-control border border-border bg-surface-muted px-3 py-3 text-body text-muted"
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
