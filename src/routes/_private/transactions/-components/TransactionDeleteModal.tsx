import { useState } from "react";

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
import { RadioGroup, RadioItem } from "../../../../components/RadioGroup";
import { isApiError } from "../../../../lib/api-errors";
import { deleteOcorrenciaRecorrente } from "../../../../services/recurrences/api";
import { type RecurrenceScope } from "../../../../services/recurrences/contracts";
import { deleteTransacao } from "../../../../services/transactions/api";
import { transactionsQueryKey } from "../../../../services/transactions/queries";
import { deleteTransferencia } from "../../../../services/transfers/api";
import { recurrenceScopeOptions } from "./transaction-form";

import type { ConsultaTransacaoItem } from "../../../../services/transactions/contracts";

type TransactionDeleteModalProps = {
  onClose: () => void;
  onDeleted: (message: string) => Promise<void>;
  target: ConsultaTransacaoItem;
};

function getErrorMessage(error: unknown) {
  return isApiError(error)
    ? (error.problem?.detail ?? error.message)
    : "Não foi possível excluir a movimentação. Tente novamente.";
}

export function TransactionDeleteModal({
  onClose,
  onDeleted,
  target,
}: TransactionDeleteModalProps) {
  const [scope, setScope] = useState<RecurrenceScope>("ONLY_THIS");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const deleteTransationMutation = useMutation({
    mutationFn: (id: string) => deleteTransacao(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionsQueryKey }).catch(() => undefined);
    },
  });

  const deleteTransferMutation = useMutation({
    mutationFn: (id: string) => deleteTransferencia(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionsQueryKey }).catch(() => undefined);
    },
  });

  const deleteRecurrenceMutation = useMutation({
    mutationFn: ({
      dataOriginal,
      escopo,
      segmentoId,
    }: {
      dataOriginal: string;
      escopo: RecurrenceScope;
      segmentoId: string;
    }) => deleteOcorrenciaRecorrente(segmentoId, dataOriginal, { escopo }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: transactionsQueryKey }).catch(() => undefined);
    },
  });
  const isRecurrence = ["TRANSACAO_RECORRENTE", "PARCELA"].includes(target.origem);

  const handleDelete = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      switch (target.origem) {
        case "PARCELA":
        case "TRANSACAO_RECORRENTE":
          await deleteRecurrenceMutation.mutateAsync({
            dataOriginal: target.dataOriginalRecorrencia ?? "",
            escopo: scope,
            segmentoId: target.segmentoRecorrenciaId ?? "",
          });
          break;
        case "TRANSFERENCIA":
          await deleteTransferMutation.mutateAsync(target.operacaoId ?? "");
          break;
        default:
          await deleteTransationMutation.mutateAsync(target.operacaoId ?? "");
      }

      await onDeleted(`Transação excluída com sucesso.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
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
      role="alertdialog"
      size="sm"
    >
      <ModalHeader>
        <ModalTitle>Excluir transação?</ModalTitle>
        <ModalDescription>Essa ação excluirá a transação selecionada.</ModalDescription>
        {!isSubmitting && <ModalClose />}
      </ModalHeader>
      <ModalBody>
        {isRecurrence && (
          <RadioGroup
            description="Escolha quais ocorrências devem ser removidas."
            isDisabled={isSubmitting}
            label="Aplicar exclusão"
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
              <RadioItem
                description={
                  option.value === "ONLY_THIS"
                    ? "Remove somente o lançamento escolhido."
                    : "Remove este lançamento e os próximos do mesmo segmento."
                }
                key={option.value}
                value={option.value}
              >
                {option.label}
              </RadioItem>
            ))}
          </RadioGroup>
        )}
        <p className="m-0 text-body-small text-muted">
          Essa ação não pode ser desfeita. Os dados serão removidos da API.
        </p>
        {errorMessage && (
          <p
            aria-live="assertive"
            className="m-0 rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button isDisabled={isSubmitting} onPress={onClose} size="sm" variant="secondary">
          Cancelar
        </Button>
        <Button
          isDisabled={isSubmitting}
          isPending={isSubmitting}
          onPress={handleDelete}
          size="sm"
          variant="danger"
        >
          Excluir
        </Button>
      </ModalFooter>
    </Modal>
  );
}
