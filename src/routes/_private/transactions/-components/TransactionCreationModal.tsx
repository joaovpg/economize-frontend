import { useCallback, useEffect, useState } from "react";
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
import { parseFormDate, transactionTimeZone } from "../../../../lib/date";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { postTransacao } from "../../../../services/transactions/api";
import { transactionsQueryKey } from "../../../../services/transactions/queries";
import { postTransferencia } from "../../../../services/transfers/api";
import { DiscardChangesModal, type DiscardAction } from "./DiscardChangesModal";
import { applyFormError, getServerFieldName } from "./form-errors";
import {
  formularioOperacaoFinanceiraSchema,
  getInitialEntryDate,
  toCreateTransactionRequest,
  toCreateTransferRequest,
  type FormularioOperacaoFinanceira,
} from "./transaction-form";
import { createRepeticaoFormValues } from "./transaction-repetition-form";
import { AccountSelect, CategorySelect } from "./TransactionFormFields";
import { TransactionRepetitionFields } from "./TransactionRepetitionFields";

interface TransactionCreationModalProps {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  selectedMonth: Parameters<typeof getInitialEntryDate>[0];
}

type CreateOperationResponse =
  | Awaited<ReturnType<typeof postTransacao>>
  | Awaited<ReturnType<typeof postTransferencia>>;

function getTransactionCreationField(
  field: string | undefined,
): keyof FormularioOperacaoFinanceira | null {
  const fieldName = getServerFieldName(field);

  if (fieldName === "dataFinanceira") {
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

function getSubmitLabel(operation: FormularioOperacaoFinanceira["tipoOperacao"]) {
  switch (operation) {
    case "TRANSACAO":
      return "Cadastrar transação";
    case "TRANSFERENCIA":
      return "Cadastrar transferência";
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
      categoriaId: null,
      contaDestinoId: "",
      contaId: "",
      contaOrigemId: "",
      data: initialEntryDate,
      descricao: "",
      observacoes: "",
      repeticao: createRepeticaoFormValues(false),
      situacao: "PLANEJADA",
      tipo: "DESPESA",
      tipoOperacao: "TRANSACAO",
      valor: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(formularioOperacaoFinanceiraSchema),
  });
  const tipoOperacao = useWatch({ control, name: "tipoOperacao" });
  const situation = useWatch({ control, name: "situacao" });
  const entryDate = useWatch({ control, name: "data" });
  const repetitionActive = useWatch({ control, name: "repeticao.ativa" });
  const repetitionEndType = useWatch({ control, name: "repeticao.termino.tipo" });
  const isInstallment =
    tipoOperacao === "TRANSACAO" && repetitionActive && repetitionEndType === "PARCELAS";
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
        <ModalHeader showClose={!isSubmitting && discardAction === null}>
          <ModalTitle>Nova movimentação</ModalTitle>
          <ModalDescription>
            Informe os dados da movimentação que deseja cadastrar.
          </ModalDescription>
        </ModalHeader>
        <form className="contents" noValidate onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalBody>
            {submitError && <InlineMessage tone="danger">{submitError}</InlineMessage>}
            <Controller
              control={control}
              name="tipoOperacao"
              render={({ field }) => (
                <RadioGroup
                  orientation="horizontal"
                  isDisabled={isSubmitting}
                  isRequired
                  label="Tipo de movimentação"
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(nextValue) => {
                    switch (nextValue) {
                      case "TRANSACAO":
                      case "TRANSFERENCIA":
                        handleOperationChange(nextValue);
                        break;
                    }
                  }}
                  value={field.value}
                >
                  <RadioItem focusOnOpen value="TRANSACAO">
                    Transação
                  </RadioItem>
                  <RadioItem value="TRANSFERENCIA">Transferência</RadioItem>
                </RadioGroup>
              )}
            />

            {tipoOperacao !== "TRANSFERENCIA" && (
              <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                  <RadioGroup
                    orientation="horizontal"
                    isDisabled={isSubmitting}
                    isRequired
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
                    ref={field.ref}
                    placeholder="Ex.: Supermercado"
                    value={field.value}
                  />
                )}
              />
              <Controller
                control={control}
                name="valor"
                render={({ field }) => (
                  <CurrencyField
                    autoComplete="off"
                    className="min-w-0"
                    errorMessage={errors.valor?.message}
                    isDisabled={isSubmitting}
                    isRequired
                    label={isInstallment ? "Valor de cada parcela" : "Valor"}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    ref={field.ref}
                    placeholder="R$ 0,00"
                    value={field.value}
                  />
                )}
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
                      (tipoOperacao === "TRANSACAO" || tipoOperacao === "TRANSFERENCIA") &&
                      situation === "EFETIVADA"
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
              {tipoOperacao === "TRANSACAO" || tipoOperacao === "TRANSFERENCIA" ? (
                <Controller
                  control={control}
                  name="situacao"
                  render={({ field }) => (
                    <RadioGroup
                      orientation="horizontal"
                      description={
                        tipoOperacao === "TRANSACAO" && repetitionActive
                          ? "Vale só para a primeira ocorrência"
                          : undefined
                      }
                      isDisabled={isSubmitting}
                      isRequired
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
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="contaOrigemId"
                  render={({ field }) => (
                    <AccountSelect
                      accounts={accounts}
                      errorMessage={errors.contaOrigemId?.message}
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

            {tipoOperacao === "TRANSACAO" && (
              <TransactionRepetitionFields
                control={control}
                dataFinanceira={entryDate}
                isDisabled={isSubmitting}
              />
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
                  ref={field.ref}
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
