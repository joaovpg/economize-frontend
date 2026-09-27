import { DiscardChangesModal as SharedDiscardChangesModal } from "../../../../components/Modal";

export type DiscardAction = { kind: "close" } | null;

type DiscardChangesModalProps = {
  action: DiscardAction;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DiscardChangesModal({ action, onCancel, onConfirm }: DiscardChangesModalProps) {
  return (
    <SharedDiscardChangesModal isOpen={action !== null} onCancel={onCancel} onConfirm={onConfirm} />
  );
}
