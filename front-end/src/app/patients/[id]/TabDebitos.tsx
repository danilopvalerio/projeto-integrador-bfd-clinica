// src/app/patient/[id]/TabDebitos.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faExclamationCircle,
  faTrash,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import { DebitoData, StatusPagamento } from "./../types";
import api from "../../../utils/api";
import { getErrorMessage } from "../../../utils/errorUtils";
import ConfirmationModal from "../../../components/ConfirmationModal";
import AlertModal from "../../../components/AlertModal";

interface Props {
  pacienteId: string;
}

interface CreateDebitoForm {
  valor_total: string;
  data_vencimento: string;
  observacoes: string;
  id_agendamento?: string;
}

export default function TabDebitos({ pacienteId }: Props) {
  const [debitos, setDebitos] = useState<DebitoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<CreateDebitoForm>({
    valor_total: "",
    data_vencimento: "",
    observacoes: "",
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "success" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    variant?: "error" | "success" | "info" | "warning";
  }>({
    isOpen: false,
    message: "",
  });

  // ===============================
  // Buscar débitos
  // ===============================
  const fetchDebitos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<DebitoData[]>(
        `/patients/${pacienteId}/debitos`
      );
      setDebitos(res.data);
      console.log(res.data);
    } catch (err) {
      setAlertModal({
        isOpen: true,
        message: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    if (pacienteId) fetchDebitos();
  }, [pacienteId, fetchDebitos]);

  // ===============================
  // Validação
  // ===============================
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.valor_total || parseFloat(formData.valor_total) <= 0) {
      errors.valor_total = "Informe um valor válido";
    }

    if (!formData.data_vencimento) {
      errors.data_vencimento = "Informe a data de vencimento";
    }

    if (!formData.observacoes.trim()) {
      errors.observacoes = "Informe uma descrição";
    }
    return Object.keys(errors).length === 0;
  };

  // ===============================
  // Criar débito
  // ===============================
  const handleCreateDebito = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setProcessing("creating");

      await api.post(`/patients/${pacienteId}/debitos`, {
        valor_total: parseFloat(formData.valor_total),
        data_vencimento: new Date(formData.data_vencimento).toISOString(),
        observacoes: formData.observacoes,
      });

      setFormData({
        valor_total: "",
        data_vencimento: "",
        observacoes: "",
      });

      setIsModalOpen(false);

      setAlertModal({
        isOpen: true,
        message: "Débito criado com sucesso!",
        variant: "success",
      });

      await fetchDebitos();
    } catch (err) {
      setAlertModal({
        isOpen: true,
        message: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setProcessing(null);
    }
  };

  // ===============================
  // Receber
  // ===============================
  const handleReceberClick = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmar Recebimento",
      message: "Deseja marcar este débito como pago?",
      variant: "success",
      onConfirm: () => handleReceber(id),
    });
  };

  const handleReceber = async (id: string) => {
    try {
      setProcessing(id);
      setConfirmModal({ ...confirmModal, isOpen: false });

      await api.patch(`/patients/debitos/${id}/pagar`);

      setAlertModal({
        isOpen: true,
        message: "Pagamento registrado com sucesso!",
        variant: "success",
      });

      await fetchDebitos();
    } catch (err) {
      setAlertModal({
        isOpen: true,
        message: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setProcessing(null);
    }
  };

  // ===============================
  // Excluir
  // ===============================
  const handleDeleteClick = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Excluir Débito",
      message: "Deseja realmente excluir este débito?",
      variant: "danger",
      onConfirm: () => handleDelete(id),
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessing(id);
      setConfirmModal({ ...confirmModal, isOpen: false });

      await api.delete(`/patients/debitos/${id}`);
      setDebitos((prev) => prev.filter((d) => d.id_debito !== id));

      setAlertModal({
        isOpen: true,
        message: "Débito excluído com sucesso!",
        variant: "success",
      });
    } catch (err) {
      setAlertModal({
        isOpen: true,
        message: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setProcessing(null);
    }
  };

  // ===============================
  // Render
  // ===============================
  if (loading) {
    return (
      <div className="p-5 text-center text-muted">Carregando financeiro...</div>
    );
  }

  return (
    <>
      <div className="p-4">
        <div className="d-flex justify-content-between mb-4">
          <span className="text-secondary">
            Exibindo débitos de todos os períodos
          </span>
          <button
            className="btn btn-success rounded-circle fw-bold"
            onClick={() => setIsModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="m-0" />
          </button>
        </div>

        <div className="card shadow-sm">
          {/* AQUI ESTÁ A ALTERAÇÃO: Wrapper table-responsive para o scroll */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-nowrap">
              <thead className="text-muted small">
                <tr>
                  <th className="ps-4">Data</th>
                  <th>Descrição</th>
                  <th className="text-end pe-4">Valor total</th>
                  <th className="text-end pe-4">Valor restante</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Receber</th>
                  <th className="text-center">Excluir</th>
                </tr>
              </thead>
              <tbody>
                {debitos.map((deb) => {
                  const restante = deb.valor_total - deb.valor_pago;
                  const isPago =
                    deb.status_pagamento === StatusPagamento.PAGO ||
                    restante <= 0;

                  return (
                    <tr key={deb.id_debito}>
                      <td className="ps-4 small">
                        {new Date(deb.data_vencimento).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>

                      <td className="fw-bold">
                        {deb.observacoes}
                        {!isPago && (
                          <FontAwesomeIcon
                            icon={faExclamationCircle}
                            className="text-danger ms-2"
                          />
                        )}
                      </td>

                      <td className="text-end pe-4 fw-bold">
                        {deb.valor_total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>

                      <td className="text-end pe-4 fw-bold">
                        {restante.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>

                      <td className="text-center">
                        <span
                          className={`badge rounded-pill ${
                            isPago
                              ? "bg-success bg-opacity-10 text-success"
                              : "bg-warning bg-opacity-10 text-warning"
                          }`}
                        >
                          {isPago ? "PAGO" : "PENDENTE"}
                        </span>
                      </td>

                      <td className="text-center">
                        {!isPago ? (
                          <button
                            className="btn btn-link text-success text-decoration-none p-0"
                            onClick={() => handleReceberClick(deb.id_debito)}
                          >
                            <FontAwesomeIcon
                              icon={faMoneyBillWave}
                              className="me-2"
                            />
                            Receber
                          </button>
                        ) : (
                          <span className="text-success fw-bold">Pago</span>
                        )}
                      </td>

                      <td className="text-center">
                        <button
                          className="btn btn-link text-danger p-0"
                          onClick={() => handleDeleteClick(deb.id_debito)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Criar Débito */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <form className="modal-content" onSubmit={handleCreateDebito}>
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Novo Débito</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsModalOpen(false)}
                />
              </div>

              <div className="modal-body">
                <input
                  type="number"
                  className="form-control mb-3"
                  placeholder="Valor"
                  value={formData.valor_total}
                  onChange={(e) =>
                    setFormData({ ...formData, valor_total: e.target.value })
                  }
                />

                <input
                  type="date"
                  className="form-control mb-3"
                  value={formData.data_vencimento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data_vencimento: e.target.value,
                    })
                  }
                />

                <textarea
                  className="form-control"
                  placeholder="Descrição"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success fw-bold">
                  Criar Débito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        {...confirmModal}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        isProcessing={processing !== null}
      />

      <AlertModal
        {...alertModal}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </>
  );
}
