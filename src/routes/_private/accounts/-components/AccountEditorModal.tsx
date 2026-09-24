import { useState } from "react";
import { Controller, useForm, type UseFormSetError } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../../../../components/Button";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../components/Modal";
import { NumberField } from "../../../../components/NumberField";
import { TextField } from "../../../../components/TextField";
import { isApiError } from "../../../../lib/api-errors";
import { postConta } from "../../../../services/accounts/api";
import { accountsQueryKey } from "../../../../services/accounts/queries";
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
) {
  const fallback = "Não foi possível cadastrar a conta. Tente novamente.";

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
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
};

export function AccountEditorModal({ onClose, onSaved }: AccountEditorModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createAccountMutation = useMutation({
    mutationFn: (input: Parameters<typeof postConta>[0]) => postConta(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountsQueryKey }).catch(() => undefined);
    },
  });
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<AccountFormData>({
    defaultValues: {
      dataSaldoInicial: new Date().toISOString().slice(0, 10),
      moeda: "BRL",
      nome: "",
      saldoInicial: 0,
    },
    mode: "onSubmit",
    resolver: zodResolver(accountFormSchema),
  });
  const nameField = register("nome");
  const currencyField = register("moeda");
  const dateField = register("dataSaldoInicial");

  const handleFormSubmit = async (data: AccountFormData) => {
    setSubmitError(null);

    try {
      await createAccountMutation.mutateAsync({
        dataSaldoInicial: data.dataSaldoInicial,
        moeda: data.moeda,
        nome: data.nome.trim(),
        saldoInicial: data.saldoInicial,
      });
      await queryClient.invalidateQueries({ queryKey: accountsQueryKey });
    } catch (error) {
      applyAccountFormError(error, setError, setSubmitError);
      return;
    }

    onClose();
    void onSaved("Conta criada com sucesso.");
  };

  return (
    <Modal
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
      isOpen
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
      size="md"
    >
      <ModalHeader>
        <ModalTitle>Nova conta</ModalTitle>
        <ModalDescription>
          Cadastre uma conta e informe o saldo a partir da data escolhida.
        </ModalDescription>
        {!isSubmitting && <ModalClose />}
      </ModalHeader>

      <form
        className="contents"
        id="account-editor-form"
        noValidate
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <ModalBody>
          {submitError && (
            <p
              aria-live="assertive"
              className="block rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <TextField
            errorMessage={errors.nome?.message}
            inputRef={nameField.ref}
            label="Nome"
            maxLength={120}
            name={nameField.name}
            onBlur={nameField.onBlur}
            onInput={nameField.onChange}
            placeholder="Ex.: Conta corrente"
          />

          <TextField
            errorMessage={errors.moeda?.message}
            inputRef={currencyField.ref}
            label="Moeda"
            maxLength={3}
            name={currencyField.name}
            onBlur={currencyField.onBlur}
            onInput={currencyField.onChange}
            placeholder="BRL"
          />

          <Controller
            control={control}
            name="saldoInicial"
            render={({ field }) => (
              <NumberField
                errorMessage={errors.saldoInicial?.message}
                formatOptions={{ maximumFractionDigits: 4 }}
                label="Saldo inicial"
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />

          <TextField
            errorMessage={errors.dataSaldoInicial?.message}
            inputRef={dateField.ref}
            label="Data do saldo inicial"
            name={dateField.name}
            onBlur={dateField.onBlur}
            onInput={dateField.onChange}
            type="date"
          />
        </ModalBody>

        <ModalFooter>
          <Button
            isDisabled={isSubmitting}
            onPress={onClose}
            size="sm"
            type="button"
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button form="account-editor-form" isPending={isSubmitting} size="sm" type="submit">
            Cadastrar conta
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
