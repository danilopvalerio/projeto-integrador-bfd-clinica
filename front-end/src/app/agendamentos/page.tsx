// src/app/agendamentos/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus, faSync } from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import { AgendamentoCalendarDTO, ProfissionalSummary } from "./types";

// Componentes
import AgendaCalendar from "./AgendaCalendar";
import AddAgendamentoModal from "./AddAgendamentoModal";
import EditAgendamentoModal from "./EditAgendamentoModal";

const AgendamentosPage = () => {
  const router = useRouter();

  // Estados de Filtro
  const [dataInicio, setDataInicio] = useState<string>(
    new Date().toISOString().split("T")[0], // Hoje
  );
  const [selectedProfissional, setSelectedProfissional] = useState<string>("");

  // Estados de Dados
  const [agendamentos, setAgendamentos] = useState<AgendamentoCalendarDTO[]>(
    [],
  );
  const [profissionais, setProfissionais] = useState<ProfissionalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAgendamentoId, setSelectedAgendamentoId] = useState<
    string | null
  >(null);

  // 1. Carregar Profissionais
  useEffect(() => {
    const fetchProfissionais = async () => {
      try {
        const res = await api.get("/professionals/paginated?limit=100");
        setProfissionais(res.data.data);
      } catch (err) {
        console.error("Erro ao carregar profissionais", err);
      }
    };
    fetchProfissionais();
  }, []);

  // 2. Buscar Agendamentos
  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const startObj = new Date(dataInicio);
      const endObj = new Date(startObj);
      endObj.setDate(endObj.getDate() + 7);

      const endStr = endObj.toISOString().split("T")[0];

      let url = `/agendamentos/calendar?start=${dataInicio}&end=${endStr}`;
      if (selectedProfissional) {
        url += `&id_profissional=${selectedProfissional}`;
      }

      const res = await api.get(url);
      setAgendamentos(res.data.agendamentos);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dataInicio, selectedProfissional]);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#e9e9e9" }}
    >
      {/* Header */}
      <header className="header-panel bg-gradient-vl d-flex align-items-center px-4 shadow-sm">
        <button
          className="btn btn-link text-white p-0 me-3"
          onClick={() => router.push("/menu")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="fs-4" />
        </button>
        <span className="text-white fw-bold fs-5">Gestão de Agendas</span>
      </header>

      <div className="container-fluid px-4 my-4 flex-grow-1">
        {/* Filtros */}
        <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-bold text-secondary small">
                Data Início
              </label>
              <input
                type="date"
                className="form-control"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold text-secondary small">
                Profissional
              </label>
              <select
                className="form-select"
                value={selectedProfissional}
                onChange={(e) => setSelectedProfissional(e.target.value)}
              >
                <option value="">Visão Geral (Todos)</option>
                {profissionais.map((p) => (
                  <option key={p.id_profissional} value={p.id_profissional}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-5 d-flex justify-content-end gap-2">
              <button
                className="btn btn-light border text-secondary"
                onClick={fetchAgendamentos}
                title="Atualizar"
              >
                <FontAwesomeIcon icon={faSync} spin={loading} />
              </button>

              <button
                className="button-dark-grey px-4 py-2 rounded-pill shadow-sm fw-bold text-white border-0"
                onClick={() => setIsAddModalOpen(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Novo Agendamento
              </button>
            </div>
          </div>
        </div>

        {/* Calendário */}
        {error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <AgendaCalendar
            agendamentos={agendamentos}
            startDate={dataInicio}
            onMoveSuccess={fetchAgendamentos}
            // CORREÇÃO AQUI: Tipagem explícita do ID
            onSelectAgendamento={(id: string) => setSelectedAgendamentoId(id)}
            loading={loading}
          />
        )}

        {/* Legenda */}
        <div className="d-flex gap-4 mt-4 px-2">
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 16,
                height: 16,
                background: "#d4edda",
                borderRadius: 4,
              }}
            ></div>
            <small className="text-secondary fw-bold">Confirmado</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 16,
                height: 16,
                background: "#fff3cd",
                borderRadius: 4,
              }}
            ></div>
            <small className="text-secondary fw-bold">Pendente</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 16,
                height: 16,
                background: "#f8d7da",
                borderRadius: 4,
              }}
            ></div>
            <small className="text-secondary fw-bold">Cancelado</small>
          </div>
        </div>
      </div>

      {/* Modais */}
      {isAddModalOpen && (
        <AddAgendamentoModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchAgendamentos();
          }}
          initialDate={dataInicio}
          preSelectedProfissional={selectedProfissional}
        />
      )}

      {selectedAgendamentoId && (
        <EditAgendamentoModal
          agendamentoId={selectedAgendamentoId}
          onClose={() => setSelectedAgendamentoId(null)}
          onSuccess={() => {
            setSelectedAgendamentoId(null);
            fetchAgendamentos();
          }}
        />
      )}
    </div>
  );
};

export default AgendamentosPage;
