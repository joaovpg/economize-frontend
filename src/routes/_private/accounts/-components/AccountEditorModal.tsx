import { useRef, useState } from "react";
import { Controller, useForm, type UseFormSetError } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { today } from "@internationalized/date";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../../../../components/Button";
import { DatePicker } from "../../../../components/fields/DatePicker";
import { NumberField } from "../../../../components/fields/NumberField";
import { TextField } from "../../../../components/fields/TextField";
import { InlineMessage } from "../../../../components/InlineMessage";
import {
  Modal,
  ModalBody,
  ModalDescription,
  DiscardChangesModal,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../components/Modal";
import { isApiError } from "../../../../lib/api-errors";
import { parseFormDate, transactionTimeZone } from "../../../../lib/date";
import { postConta, putConta } from "../../../../services/accounts/api";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { accountsQueryKey } from "../../../../services/accounts/queries";
import { transactionsQueryKey } from "../../../../services/transactions/queries";
import { accountFormSchema, type AccountFormData } from "./account-form";

function getAccountFormField(field: string | undefined): keyof AccountFormData | null {
  const fieldName = field?.split("#").pop()?.split("/").pop();

  return fieldName === "nome" ||
    fieldName === "moeda" ||
    fieldName === "saldoInicial" ||
    fieldName === "dataSaldoInicial"
    ? fieldName
    : null;
}

function applyAccountFormError(
  error: unknown,
  setError: UseFormSetError<AccountFormData>,
  setSubmitError: (message: string) => void,
  fallback: string,
) {
  if (!isApiError(error)) {
    setSubmitError(fallback);
    return;
  }

  let hasFieldError = false;

  for (const [fieldName, messages] of Object.entries(error.fieldErrors)) {
    const field = getAccountFormField(fieldName);
    const message = messages[0];

    if (field && message) {
      setError(field, { message, type: "server" });
      hasFieldError = true;
    }
  }

  if (!hasFieldError || error.problem?.detail) {
    setSubmitError(error.problem?.detail ?? error.message ?? fallback);
  }
}

type AccountEditorModalProps = {
  account: ContaResponse | null;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
};

export function AccountEditorModal({ account, onClose, onSaved }: AccountEditorModalProps) {
  const isEditing = account !== null;
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const createAccountMutation = useMutation({
    mutationFn: (input: Parameters<typeof postConta>[0]) => postConta(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountsQueryKey }).catch(() => undefined);
    },
  });
  const editAccountMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof putConta>[1] }) =>
      putConta(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountsQueryKey }).catch(() => undefined);
      void queryClient.invalidateQueries({ queryKey: transactionsQueryKey }).catch(() => undefined);
    },
  });
  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<AccountFormData>({
    defaultValues: account
      ? {
          dataSaldoInicial: account.dataSaldoInicial,
          moeda: account.moeda,
          nome: account.nome,
          saldoInicial: account.saldoInicial,
        }
      : {
          dataSaldoInicial: today(transactionTimeZone).toString(),
          moeda: "BRL",
          nome: "",
          saldoInicial: 0,
        },
    mode: "onSubmit",
    resolver: zodResolver(accountFormSchema),
  });

  const requestClose = () => {
    if (isSubmitting) {
      return;
    }

    if (isDirty) {
      setIsDiscardModalOpen(true);
      return;
    }

    onClose();
  };

  const handleFormSubmit = async (data: AccountFormData) => {
    setSubmitError(null);
    let successMessage: string;

    try {
      if (account) {
        await editAccountMutation.mutateAsync({
          id: account.id,
          input: {
            ativo: account.ativo,
            dataSaldoInicial: data.dataSaldoInicial,
            moeda: data.moeda,
            nome: data.nome.trim(),
            saldoInicial: data.saldoInicial,
          },
        });
        successMessage = "Conta atualizada com sucesso.";
      } else {
        await createAccountMutation.mutateAsync({
          dataSaldoInicial: data.dataSaldoInicial,
          moeda: data.moeda,
          nome: data.nome.trim(),
          saldoInicial: data.saldoInicial,
        });
        successMessage = "Conta criada com sucesso.";
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
        queryClient.invalidateQueries({ queryKey: transactionsQueryKey }),
      ]);
    } catch (error) {
      applyAccountFormError(
        error,
        setError,
        setSubmitError,
        isEditing
          ? "Não foi possível atualizar a conta. Tente novamente."
          : "Não foi possível cadastrar a conta. Tente novamente.",
      );
      return;
    }

    onClose();
    void onSaved(successMessage);
  };

  return (
    <>
      <Modal
        isDismissable={!isSubmitting && !isDiscardModalOpen}
        isKeyboardDismissDisabled={isSubmitting || isDiscardModalOpen}
        isOpen
        initialFocus={nameInputRef}
        onOpenChange={(open) => {
          if (!open) {
            requestClose();
          }
        }}
        size="md"
      >
        <ModalHeader showClose={!isSubmitting && !isDiscardModalOpen}>
          <ModalTitle>{isEditing ? "Editar conta" : "Nova conta"}</ModalTitle>
          <ModalDescription>
            {isEditing
              ? "Atualize os dados desta conta. O status ativa ou inativa é alterado na listagem."
              : "Cadastre uma conta e informe o saldo a partir da data escolhida."}
          </ModalDescription>
        </ModalHeader>

        <form
          className="contents"
          id="account-editor-form"
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <ModalBody>
            {submitError && <InlineMessage tone="danger">{submitError}</InlineMessage>}

            <Controller
              control={control}
              name="nome"
              render={({ field }) => (
                <TextField
                  {...field}
                  errorMessage={errors.nome?.message}
                  isDisabled={isSubmitting}
                  isRequired
                  label="Nome"
                  maxLength={120}
                  placeholder="Ex.: Conta corrente"
                  ref={(input) => {
                    nameInputRef.current = input;
                    field.ref(input);
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="moeda"
              render={({ field }) => (
                <TextField
                  {...field}
                  errorMessage={errors.moeda?.message}
                  isDisabled={isSubmitting}
                  isRequired
                  label="Moeda"
                  maxLength={3}
                  placeholder="BRL"
                />
              )}
            />

            <Controller
              control={control}
              name="saldoInicial"
              render={({ field }) => (
                <NumberField
                  errorMessage={errors.saldoInicial?.message}
                  isRequired
                  formatOptions={{ maximumFractionDigits: 4 }}
                  isDisabled={isSubmitting}
                  label="Saldo inicial"
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />

            <Controller
              control={control}
              name="dataSaldoInicial"
              render={({ field }) => (
                <DatePicker
                  todayValue={today(transactionTimeZone)}
                  errorMessage={errors.dataSaldoInicial?.message}
                  isDisabled={isSubmitting}
                  isRequired
                  ref={field.ref}
                  label="Data do saldo inicial"
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(date) => field.onChange(date?.toString() ?? "")}
                  value={parseFormDate(field.value)}
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
            <Button form="account-editor-form" isPending={isSubmitting} size="sm" type="submit">
              {isEditing ? "Salvar alterações" : "Cadastrar conta"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
      <DiscardChangesModal
        isOpen={isDiscardModalOpen}
        onCancel={() => setIsDiscardModalOpen(false)}
        onConfirm={() => {
          setIsDiscardModalOpen(false);
          onClose();
        }}
      />
    </>
  );
}
