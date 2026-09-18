import { useState } from "react";

import { Button } from "../../../../components/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../../../components/Modal";
import { RadioGroup, RadioItem } from "../../../../components/RadioGroup";
import { isApiError } from "../../../../lib/api-errors";
import {
  deleteOcorrenciaRecorrente,
  deleteTransferencia,
} from "../../../../services/transactions/api";
import { type RecurrenceScope } from "../../../../services/transactions/contracts";
import { type TransactionActionTarget } from "./transaction-actions";
import { recurrenceScopeOptions } from "./transaction-form";

type TransactionDeleteModalProps = {
  onClose: () => void;
  onDeleted: (message: string) => Promise<void>;
  target: TransactionActionTarget;
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
  const isRecurrence = target.kind === "recurrence";
  const label = target.kind === "transfer" ? "transferência" : target.entryLabel;

  const handleDelete = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (target.kind === "transfer") {
        await deleteTransferencia(target.id);
      } else {
        await deleteOcorrenciaRecorrente(target.segmentoId, target.dataOriginal, { escopo: scope });
      }

      await onDeleted(
        `${label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1)} excluído com sucesso.`,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  return (
    <Modal
      description={`Essa ação excluirá o ${label} selecionado.`}
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
      isOpen
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
      role="alertdialog"
      showCloseButton={!isSubmitting}
      size="sm"
      title={`Excluir ${label}?`}
    >
      <ModalHeader />
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
