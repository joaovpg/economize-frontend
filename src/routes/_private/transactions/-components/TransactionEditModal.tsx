import { useCallback, useState } from "react";

import { Modal, ModalHeader } from "../../../../components/Modal";
import { type TransactionMonth } from "../../../../lib/transaction-month";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { DiscardChangesModal, type DiscardAction } from "./DiscardChangesModal";
import { RecurrenceOccurrenceForm } from "./RecurrenceOccurrenceForm";
import { type TransactionActionTarget } from "./transaction-actions";
import { TransferForm } from "./TransferForm";

type TransactionEditModalProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  selectedMonth: TransactionMonth;
  target: TransactionActionTarget;
};

type FormState = {
  isDirty: boolean;
  isSubmitting: boolean;
};

const cleanFormState: FormState = { isDirty: false, isSubmitting: false };

export function TransactionEditModal({
  accounts,
  categories,
  onClose,
  onSaved,
  selectedMonth,
  target,
}: TransactionEditModalProps) {
  const [discardAction, setDiscardAction] = useState<DiscardAction>(null);
  const [formState, setFormState] = useState<FormState>(cleanFormState);
  const title = target.kind === "transfer" ? "Editar transferência" : `Editar ${target.entryLabel}`;

  const handleFormStateChange = useCallback((nextState: FormState) => {
    setFormState(nextState);
  }, []);

  const requestClose = useCallback(() => {
    if (formState.isSubmitting) {
      return;
    }

    if (formState.isDirty) {
      setDiscardAction({ kind: "close" });
      return;
    }

    onClose();
  }, [formState.isDirty, formState.isSubmitting, onClose]);

  const handleDiscardCancel = useCallback(() => {
    setDiscardAction(null);
  }, []);

  const handleDiscardConfirm = useCallback(() => {
    if (!discardAction) {
      return;
    }

    setDiscardAction(null);
    setFormState(cleanFormState);
    onClose();
  }, [discardAction, onClose]);

  return (
    <>
      <Modal
        description="Atualize os dados da movimentação selecionada."
        isDismissable={!formState.isSubmitting && discardAction === null}
        isKeyboardDismissDisabled={formState.isSubmitting}
        isOpen
        onOpenChange={(open) => {
          if (!open) {
            requestClose();
          }
        }}
        showCloseButton={!formState.isSubmitting && discardAction === null}
        size="lg"
        title={title}
      >
        <ModalHeader />
        {target.kind === "transfer" ? (
          <TransferForm
            accounts={accounts}
            initialValues={target.values}
            mode="transfer"
            onClose={requestClose}
            onFormStateChange={handleFormStateChange}
            onModeChange={() => undefined}
            onSaved={onSaved}
            selectedMonth={selectedMonth}
            transferId={target.id}
          />
        ) : (
          <RecurrenceOccurrenceForm
            accounts={accounts}
            categories={categories}
            dataOriginal={target.dataOriginal}
            entryLabel={target.entryLabel}
            initialValues={target.values}
            onClose={requestClose}
            onFormStateChange={handleFormStateChange}
            onSaved={onSaved}
            segmentoId={target.segmentoId}
          />
        )}
      </Modal>
      <DiscardChangesModal
        action={discardAction}
        onCancel={handleDiscardCancel}
        onConfirm={handleDiscardConfirm}
      />
    </>
  );
}
