import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

// ─── Tamaños del modal ───
type ModalSize = "sm" | "md" | "lg" | "xl";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const SIZE_MAP: Record<ModalSize, string> = {
  sm: "440px",
  md: "600px",
  lg: "800px",
  xl: "1000px",
};

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  size = "md",
  children,
  footer,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={contentRef}
        className="modal-content"
        style={{ maxWidth: SIZE_MAP[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ─── */}
        <div className="modal-content__header">
          <h4>
            {icon && <span className="modal-content__icon">{icon}</span>}
            {title}
          </h4>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* ─── Body ─── */}
        <div className="modal-content__body">
          {children}
        </div>

        {/* ─── Footer (opcional) ─── */}
        {footer && (
          <div className="modal-content__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormModal;
