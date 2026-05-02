import React from "react";
import FormModal from "./FormModal";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  variant = "danger",
}) => {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<AlertTriangle size={20} />}
      size="sm"
      footer={
        <div className="modal-footer-actions">
          <button className="btn-secondary" onClick={onClose} type="button">
            {cancelLabel}
          </button>
          <button
            className={`btn-confirm ${variant === "danger" ? "btn-confirm--danger" : "btn-confirm--warning"}`}
            onClick={() => { onConfirm(); onClose(); }}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="confirm-dialog__body">
        <p>{message}</p>
      </div>
    </FormModal>
  );
};

export default ConfirmDialog;
