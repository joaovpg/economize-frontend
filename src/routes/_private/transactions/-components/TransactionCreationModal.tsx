import { useCallback, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../../../../components/Button";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../components/Modal";
import { NumberField } from "../../../../components/NumberField";
import { RadioGroup, RadioItem } from "../../../../components/RadioGroup";
import { TextArea } from "../../../../components/TextArea";
import { TextField } from "../../../../components/TextField";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { postRecorrencia } from "../../../../services/recurrences/api";
import { postTransacao } from "../../../../services/transactions/api";
import {
  formularioOperacaoFinanceiraSchema,
  parseMoneyInput,
  type FormularioOperacaoFinanceira,
} from "../../../../services/transactions/contracts";
import { transactionsQueryKey } from "../../../../services/transactions/queries";
import { postTransferencia } from "../../../../services/transfers/api";
import { DiscardChangesModal, type DiscardAction } from "./DiscardChangesModal";
import { applyFormError, getServerFieldName } from "./form-errors";
import { RecurrenceFields } from "./RecurrenceFields";
import {
  getDayOfWeekForDate,
  getInitialEntryDate,
  getMonthDayForDate,
  isValidFormDate,
  toCreateInstallmentRequest,
  toCreateRecurrenceRequest,
  toCreateTransactionRequest,
  toCreateTransferRequest,
} from "./transaction-form";
import { AccountSelect, CategorySelect } from "./TransactionFormFields";

interface TransactionCreationModalProps {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  selectedMonth: Parameters<typeof getInitialEntryDate>[0];
}

type CreateOperationResponse =
  | Awaited<ReturnType<typeof postRecorrencia>>
  | Awaited<ReturnType<typeof postTransacao>>
  | Awaited<ReturnType<typeof postTransferencia>>;

function getTransactionCreationField(
  field: string | undefined,
): keyof FormularioOperacaoFinanceira | null {
  const fieldName = getServerFieldName(field);

  if (
    fieldName === "dataFinanceira" ||
    fieldName === "dataInicio" ||
    fieldName === "dataPrimeiraOcorrencia" ||
    fieldName === "inicio"
  ) {
    return "data";
  }

  if (fieldName === "dataFim" || fieldName === "termino") {
    return "ate";
  }

  if (fieldName === "count") {
    return "quantidadeOcorrencias";
  }

  if (fieldName === "valorPorParcela") {
    return "valor";
  }

  const validFields: readonly (keyof FormularioOperacaoFinanceira)[] = [
    "ate",
    "categoriaId",
    "contaDestinoId",
    "contaId",
    "contaOrigemId",
    "data",
    "descricao",
    "diasMes",
    "diasSemana",
    "frequencia",
    "intervalo",
    "numeroPrimeiraParcela",
    "observacoes",
    "quantidadeOcorrencias",
    "quantidadeTotalOriginal",
    "semTermino",
    "situacao",
    "tipo",
    "tipoOperacao",
    "valor",
  ];

  return validFields.find((validField) => validField === fieldName) ?? null;
}

function getSubmitLabel(operation: FormularioOperacaoFinanceira["tipoOperacao"]) {
  switch (operation) {
    case "TRANSACAO":
      return "Cadastrar transação";
    case "TRANSFERENCIA":
      return "Cadastrar transferência";
    case "RECORRENCIA":
      return "Cadastrar recorrência";
    case "PARCELAMENTO":
      return "Cadastrar parcelamento";
    default: {
      const exhaustive: never = operation;
      return exhaustive;
    }
  }
}

function getSuccessMessage(operation: FormularioOperacaoFinanceira["tipoOperacao"]) {
  switch (operation) {
    case "TRANSACAO":
      return "Transação cadastrada com sucesso.";
    case "TRANSFERENCIA":
      return "Transferência cadastrada com sucesso.";
    case "RECORRENCIA":
      return "Recorrência cadastrada com sucesso.";
    case "PARCELAMENTO":
      return "Parcelamento cadastrado com sucesso.";
    default: {
      const exhaustive: never = operation;
      return exhaustive;
    }
  }
}

export function TransactionCreationModal({
  accounts,
  categories,
  onClose,
  onSaved,
  selectedMonth,
}: TransactionCreationModalProps) {
  const initialEntryDate = getInitialEntryDate(selectedMonth);
  const [discardAction, setDiscardAction] = useState<DiscardAction>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createMutation = useMutation<
    CreateOperationResponse,
    unknown,
    FormularioOperacaoFinanceira
  >({
    mutationFn: (data: FormularioOperacaoFinanceira) => {
      switch (data.tipoOperacao) {
        case "TRANSACAO":
          return postTransacao(toCreateTransactionRequest(data));
        case "TRANSFERENCIA":
          return postTransferencia(toCreateTransferRequest(data));
        case "RECORRENCIA":
          return postRecorrencia(toCreateRecurrenceRequest(data));
        case "PARCELAMENTO":
          return postRecorrencia(toCreateInstallmentRequest(data));
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
    clearErrors,
  } = useForm<FormularioOperacaoFinanceira>({
    defaultValues: {
      ate: "",
      categoriaId: null,
      contaDestinoId: "",
      contaId: "",
      contaOrigemId: "",
      data: initialEntryDate,
      descricao: "",
      diasMes: [getMonthDayForDate(initialEntryDate)],
      diasSemana: [],
      frequencia: "MONTHLY",
      intervalo: "1",
      numeroPrimeiraParcela: "1",
      observacoes: "",
      quantidadeOcorrencias: "",
      quantidadeTotalOriginal: "",
      semTermino: true,
      situacao: "PLANEJADA",
      tipo: "DESPESA",
      tipoOperacao: "TRANSACAO",
      valor: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(formularioOperacaoFinanceiraSchema),
  });
  const tipoOperacao = useWatch({ control, name: "tipoOperacao" });
  const startDate = useWatch({ control, name: "data" });
  const accountId = useWatch({ control, name: "contaId" });
  const categoryId = useWatch({ control, name: "categoriaId" });
  const originAccountId = useWatch({ control, name: "contaOrigemId" });
  const destinationAccountId = useWatch({ control, name: "contaDestinoId" });
  const originAccount = accounts.find((account) => account.id === originAccountId);

  useEffect(() => {
    if (tipoOperacao !== "TRANSFERENCIA" || !originAccountId || !destinationAccountId) {
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
  }, [accounts, destinationAccountId, originAccount, originAccountId, setValue, tipoOperacao]);

  const requestClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (isDirty) {
      setDiscardAction({ kind: "close" });
      return;
    }

    onClose();
  }, [isDirty, isSubmitting, onClose, setDiscardAction]);

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

  const handleOperationChange = (nextOperation: FormularioOperacaoFinanceira["tipoOperacao"]) => {
    setValue("tipoOperacao", nextOperation, { shouldDirty: true, shouldValidate: false });
    clearErrors();

    setValue("contaId", nextOperation === "TRANSFERENCIA" ? "" : accountId, {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("contaOrigemId", nextOperation === "TRANSFERENCIA" ? originAccountId : "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("contaDestinoId", nextOperation === "TRANSFERENCIA" ? destinationAccountId : "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setValue("categoriaId", nextOperation === "TRANSFERENCIA" ? null : categoryId, {
      shouldDirty: true,
      shouldValidate: false,
    });

    if (nextOperation === "RECORRENCIA") {
      setValue("frequencia", "MONTHLY", { shouldDirty: true, shouldValidate: false });
      setValue("intervalo", "1", { shouldDirty: true, shouldValidate: false });
      setValue("diasMes", isValidFormDate(startDate) ? [getMonthDayForDate(startDate)] : [], {
        shouldDirty: true,
        shouldValidate: false,
      });
      setValue("diasSemana", isValidFormDate(startDate) ? [getDayOfWeekForDate(startDate)] : [], {
        shouldDirty: true,
        shouldValidate: false,
      });
      setValue("semTermino", true, { shouldDirty: true, shouldValidate: false });
      setValue("ate", "", { shouldDirty: true, shouldValidate: false });
      setValue("quantidadeOcorrencias", "", { shouldDirty: true, shouldValidate: false });
    } else {
      setValue("frequencia", null, { shouldDirty: true, shouldValidate: false });
      setValue("diasMes", [], { shouldDirty: true, shouldValidate: false });
      setValue("diasSemana", [], { shouldDirty: true, shouldValidate: false });
      setValue("semTermino", true, { shouldDirty: true, shouldValidate: false });
      setValue("ate", "", { shouldDirty: true, shouldValidate: false });
      setValue("quantidadeOcorrencias", "", { shouldDirty: true, shouldValidate: false });
    }

    if (nextOperation === "PARCELAMENTO") {
      setValue("intervalo", "1", { shouldDirty: true, shouldValidate: false });
      setValue("numeroPrimeiraParcela", "1", { shouldDirty: true, shouldValidate: false });
      setValue("quantidadeTotalOriginal", "", { shouldDirty: true, shouldValidate: false });
    }
  };

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
      await createMutation.mutateAsync(data);
    } catch (error) {
      applyFormError(
        error,
        setError,
        getTransactionCreationField,
        setSubmitError,
        "Não foi possível cadastrar a movimentação. Tente novamente.",
      );
      return;
    }

    await onSaved(getSuccessMessage(data.tipoOperacao));
  };

  return (
    <>
      <Modal
        isDismissable={!isSubmitting && discardAction === null}
        isKeyboardDismissDisabled={isSubmitting}
        isOpen
        onOpenChange={(open) => {
          if (!open) {
            requestClose();
          }
        }}
        size="lg"
      >
        <ModalHeader>
          <ModalTitle>Nova movimentação</ModalTitle>
          {!isSubmitting && discardAction === null && <ModalClose />}
        </ModalHeader>
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
            <Controller
              control={control}
              name="tipoOperacao"
              render={({ field }) => (
                <RadioGroup
                  appearance="segmented"
                  isDisabled={isSubmitting}
                  label="Tipo de movimentação"
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(nextValue) => {
                    switch (nextValue) {
                      case "TRANSACAO":
                      case "TRANSFERENCIA":
                      case "RECORRENCIA":
                      case "PARCELAMENTO":
                        handleOperationChange(nextValue);
                        break;
                    }
                  }}
                  value={field.value}
                >
                  <RadioItem value="TRANSACAO">Transação</RadioItem>
                  <RadioItem value="TRANSFERENCIA">Transferência</RadioItem>
                  <RadioItem value="RECORRENCIA">Recorrência</RadioItem>
                  <RadioItem value="PARCELAMENTO">Parcelamento</RadioItem>
                </RadioGroup>
              )}
            />

            {tipoOperacao !== "TRANSFERENCIA" && (
              <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                  <RadioGroup
                    appearance="segmented"
                    isDisabled={isSubmitting}
                    label="Tipo"
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value}
                    errorMessage={errors.tipo?.message}
                  >
                    <RadioItem value="DESPESA">Despesa</RadioItem>
                    <RadioItem value="RECEITA">Receita</RadioItem>
                  </RadioGroup>
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
                    label={tipoOperacao === "PARCELAMENTO" ? "Valor da parcela" : "Valor"}
                    maxLength={24}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={(value) => field.onChange(Number.isNaN(value) ? "" : String(value))}
                    inputRef={field.ref}
                    placeholder="R$ 0,00"
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
                    label={
                      tipoOperacao === "RECORRENCIA"
                        ? "Data inicial"
                        : tipoOperacao === "PARCELAMENTO"
                          ? "Data da primeira parcela"
                          : "Data financeira"
                    }
                    name={field.name}
                    onBlur={field.onBlur}
                    onInput={field.onChange}
                    inputRef={field.ref}
                    type="date"
                    value={field.value}
                  />
                )}
              />
              {tipoOperacao === "TRANSACAO" || tipoOperacao === "TRANSFERENCIA" ? (
                <Controller
                  control={control}
                  name="situacao"
                  render={({ field }) => (
                    <RadioGroup
                      appearance="segmented"
                      isDisabled={isSubmitting}
                      label="Situação"
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value}
                      errorMessage={errors.situacao?.message}
                    >
                      <RadioItem value="PLANEJADA">Planejada</RadioItem>
                      <RadioItem value="EFETIVADA">Efetivada</RadioItem>
                    </RadioGroup>
                  )}
                />
              ) : (
                <div />
              )}
            </div>

            {tipoOperacao === "TRANSFERENCIA" ? (
              <div className="grid min-w-0 gap-3.5 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="contaOrigemId"
                  render={({ field }) => (
                    <AccountSelect
                      accounts={accounts}
                      errorMessage={errors.contaOrigemId?.message}
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
              </div>
            )}

            {tipoOperacao === "RECORRENCIA" && (
              <RecurrenceFields control={control} setValue={setValue} />
            )}

            {tipoOperacao === "PARCELAMENTO" && (
              <fieldset className="grid min-w-0 gap-3.5 border-0 p-0">
                <legend className="text-label text-foreground">Parcelamento</legend>
                <div className="grid min-w-0 gap-3.5 sm:grid-cols-3">
                  <Controller
                    control={control}
                    name="numeroPrimeiraParcela"
                    render={({ field }) => (
                      <TextField
                        errorMessage={errors.numeroPrimeiraParcela?.message}
                        inputMode="numeric"
                        isDisabled={isSubmitting}
                        label="Número inicial"
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
                  <Controller
                    control={control}
                    name="quantidadeTotalOriginal"
                    render={({ field }) => (
                      <TextField
                        errorMessage={errors.quantidadeTotalOriginal?.message}
                        inputMode="numeric"
                        isDisabled={isSubmitting}
                        label="Total de parcelas"
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
                  <Controller
                    control={control}
                    name="intervalo"
                    render={({ field }) => (
                      <TextField
                        description="Use 1 para repetir todo mês."
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
                <output
                  aria-live="polite"
                  className="rounded-xl border border-border bg-surface-muted px-3.5 py-3 text-body-small text-muted"
                >
                  O backend ajustará automaticamente os meses sem o dia escolhido para o último dia
                  do mês.
                </output>
              </fieldset>
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
                  textAreaRef={field.ref}
                  value={field.value}
                  placeholder="Adicione uma observação opcional"
                />
              )}
            />
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
              {getSubmitLabel(tipoOperacao)}
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
