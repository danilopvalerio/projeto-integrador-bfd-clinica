"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExchangeAlt, faCheck } from "@fortawesome/free-solid-svg-icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  oldDate: Date;
  newDate: Date;
  loading?: boolean; // Nova prop
}

const ConfirmMoveModal = ({
  isOpen,
  onClose,
  onConfirm,
  oldDate,
  newDate,
  loading = false,
}: Props) => {
  if (!isOpen) return null;

  const format = (d: Date) =>
    d.toLocaleString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      className="modal-backdrop d-flex justify-content-center align-items-center animate-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1080 }}
    >
      <div
        className="bg-white rounded-4 shadow p-4"
        style={{ maxWidth: "400px", width: "90%" }}
      >
        <div className="text-center mb-4">
          <div className="mb-3 text-primary bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3">
            <FontAwesomeIcon icon={faExchangeAlt} size="2x" />
          </div>
          <h5 className="fw-bold text-dark">Confirmar remarcação?</h5>
          <p className="text-muted small mb-0">O agendamento será movido.</p>
        </div>

        <div className="bg-light p-3 rounded-3 mb-4 border d-flex align-items-center justify-content-between gap-2">
          <div className="text-center">
            <small
              className="d-block text-muted"
              style={{ fontSize: "0.7rem" }}
            >
              DE
            </small>
            <span className="fw-bold text-danger small">{format(oldDate)}</span>
          </div>
          <FontAwesomeIcon
            icon={faExchangeAlt}
            className="text-secondary opacity-50"
          />
          <div className="text-center">
            <small
              className="d-block text-muted"
              style={{ fontSize: "0.7rem" }}
            >
              PARA
            </small>
            <span className="fw-bold text-success small">
              {format(newDate)}
            </span>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-light rounded-pill w-50 fw-bold shadow-none"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="button-dark-grey rounded-pill w-50 fw-bold shadow-none text-white d-flex align-items-center justify-content-center gap-2"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Movendo...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} />
                <span>Confirmar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmMoveModal;
