import { useRef, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "../../../../components/Button";
import { RadioGroup, RadioItem } from "../../../../components/fields/RadioGroup";
import { InlineMessage } from "../../../../components/InlineMessage";
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../components/Modal";
import { getGuidedApiErrorMessage, isApiError } from "../../../../lib/api-errors";
import { deleteTransacao } from "../../../../services/transactions/api";
import { transactionsQueryKey } from "../../../../services/transactions/queries";
import { deleteTransferencia } from "../../../../services/transfers/api";
import { isStaleTransactionError } from "./form-errors";
import { escopoEdicaoOptions, getRequiredTargetId } from "./transaction-form";

import type {
  ConsultaTransacaoItem,
  EscopoEdicaoTransacao,
} from "../../../../services/transactions/contracts";

type TransactionDeleteModalProps = {
  onClose: () => void;
  onDeleted: (message: string) => Promise<void>;
  target: ConsultaTransacaoItem;
};

function getErrorMessage(error: unknown) {
  return (
    getGuidedApiErrorMessage(error) ??
    (isApiError(error)
      ? (error.problem?.detail ?? error.message)
      : "Não foi possível excluir a movimentação. Tente novamente.")
  );
}

export function TransactionDeleteModal({
  onClose,
  onDeleted,
  target,
}: TransactionDeleteModalProps) {
  const scopeOptions = escopoEdicaoOptions.filter((option) =>
    target.escoposDisponiveis.includes(option.value),
  );
  const [scope, setScope] = useState<EscopoEdicaoTransacao>(
    scopeOptions[0]?.value ?? "SOMENTE_ESTA",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const queryClient = useQueryClient();

  const invalidateTransactions = () => {
    void queryClient.invalidateQueries({ queryKey: transactionsQueryKey }).catch(() => undefined);
  };

  const deleteTransactionMutation = useMutation({
    mutationFn: ({
      chaveEdicao,
      escopo,
      versaoEdicao,
    }: {
      chaveEdicao: string;
      escopo?: EscopoEdicaoTransacao;
      versaoEdicao: string;
    }) => deleteTransacao(chaveEdicao, { escopo, versaoEdicao }),
    onSuccess: invalidateTransactions,
  });

  const deleteTransferMutation = useMutation({
    mutationFn: ({ operacaoId, versaoEdicao }: { operacaoId: string; versaoEdicao: string }) =>
      deleteTransferencia(operacaoId, { versaoEdicao }),
    onSuccess: invalidateTransactions,
  });

  const isRecurrence = ["TRANSACAO_RECORRENTE", "PARCELA"].includes(target.origem);

  const handleDelete = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      switch (target.origem) {
        case "PARCELA":
        case "TRANSACAO_RECORRENTE":
          await deleteTransactionMutation.mutateAsync({
            chaveEdicao: getRequiredTargetId(target.chaveEdicao, "chave de edição da ocorrência"),
            escopo: scope,
            versaoEdicao: getRequiredTargetId(
              target.versaoEdicao,
              "versão de edição da ocorrência",
            ),
          });
          break;
        case "TRANSFERENCIA":
          await deleteTransferMutation.mutateAsync({
            operacaoId: getRequiredTargetId(target.operacaoId, "identificador da transferência"),
            versaoEdicao: getRequiredTargetId(
              target.versaoEdicao,
              "versão de edição da transferência",
            ),
          });
          break;
        default:
          await deleteTransactionMutation.mutateAsync({
            chaveEdicao: getRequiredTargetId(target.chaveEdicao, "chave de edição da transação"),
            versaoEdicao: getRequiredTargetId(target.versaoEdicao, "versão de edição da transação"),
          });
      }

      await onDeleted(`Transação excluída com sucesso.`);
    } catch (error) {
      if (isStaleTransactionError(error)) {
        invalidateTransactions();
      }

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
      size={isRecurrence ? "md" : "sm"}
      initialFocus={cancelButtonRef}
    >
      <ModalHeader showClose={!isSubmitting}>
        <ModalTitle>Excluir transação?</ModalTitle>
        <ModalDescription>Essa ação excluirá a transação selecionada.</ModalDescription>
      </ModalHeader>
      <ModalBody>
        {isRecurrence && (
          <RadioGroup
            description="Escolha quais ocorrências devem ser removidas."
            isDisabled={isSubmitting}
            label="Aplicar exclusão"
            onChange={(nextValue) => {
              const nextScope = scopeOptions.find((option) => option.value === nextValue)?.value;

              if (nextScope) {
                setScope(nextScope);
              }
            }}
            value={scope}
          >
            {scopeOptions.map((option) => (
              <RadioItem
                description={
                  option.value === "SOMENTE_ESTA"
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
        {isRecurrence && scope === "ESTA_E_AS_PROXIMAS" && (
          <InlineMessage tone="warning">
            Remove esta e as próximas; ocorrências já efetivadas são mantidas.
          </InlineMessage>
        )}
        <p className="m-0 text-body text-muted">
          Essa ação não pode ser desfeita. Os dados serão removidos da API.
        </p>
        {errorMessage && <InlineMessage tone="danger">{errorMessage}</InlineMessage>}
      </ModalBody>
      <ModalFooter>
        <Button
          ref={cancelButtonRef}
          isDisabled={isSubmitting}
          onPress={onClose}
          size="sm"
          variant="secondary"
        >
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
