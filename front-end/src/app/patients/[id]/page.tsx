// src/app/patient/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// Imports Locais
import { PacienteSummary } from "./../types";
import ProntuarioHeader from "./ProntuarioHeader";
import TabSobre from "./TabSobre";
import TabDebitos from "./TabDebitos";
import TabDocumentos from "./TabDocumentos"; // Esse pode ser atualizado futuramente para usar a API de arquivos
import TabImagens from "./TabImagens"; // Esse também
import TabAnamnese from "./TabAnamnese"; // NOVO COMPONENTE
import TabTratamentos from "./TabTratamentos"; // NOVO COMPONENTE
import TabEvolucao from "./TabEvolucao";

// API
import api from "../../../utils/api";
import { getErrorMessage } from "../../../utils/errorUtils";

export default function ProntuarioPage() {
  const params = useParams();
  const router = useRouter();

  // Tab inicial padrão (pode mudar se quiser)
  const [activeTab, setActiveTab] = useState("sobre");

  const [paciente, setPaciente] = useState<PacienteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPaciente = async () => {
      const id = params?.id;
      if (!id) {
        setError("ID do paciente não encontrado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/patients/${id}`);
        setPaciente(response.data);
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        console.error("Erro ao buscar paciente:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaciente();
  }, [params?.id]);

  // Loading State
  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="text-muted">Carregando prontuário...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <div
          className="alert alert-danger text-center border-0 shadow-sm"
          style={{ maxWidth: "500px" }}
        >
          <h5 className="alert-heading">Erro ao carregar prontuário</h5>
          <p className="mb-3">{error}</p>
          <button
            className="btn btn-outline-danger"
            onClick={() => router.push("/patients")}
          >
            Voltar para Pacientes
          </button>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!paciente) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-danger">
        <div
          className="alert alert-warning text-center border-0 shadow-sm"
          style={{ maxWidth: "500px" }}
        >
          <h5 className="alert-heading">Paciente não encontrado</h5>
          <p className="mb-3">
            Não foi possível encontrar os dados deste paciente.
          </p>
          <button
            className="btn btn-outline-warning"
            onClick={() => router.push("/patients")}
          >
            Voltar para Pacientes
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "sobre", label: "SOBRE" },
    { id: "anamnese", label: "ANAMNESE" },
    { id: "evolucao", label: "EVOLUÇÃO E TRATAMENTOS" }, // Renomeei para ficar mais claro (Timeline)
    { id: "débitos", label: "FINANCEIRO" }, // Renomeei para ficar mais profissional
    { id: "imagens", label: "IMAGENS" },
    { id: "documentos", label: "DOCUMENTOS" },
  ];

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#e9e9e9" }}
    >
      <ProntuarioHeader paciente={paciente} />

      {/* Tabs com Scroll Horizontal e Sem Scroll Vertical */}
      <div
        className="bg-white border-bottom shadow-sm overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <div className="container">
          <ul
            className="nav nav-tabs border-bottom-0 gap-4 flex-nowrap"
            style={{ minWidth: "max-content" }}
          >
            {tabs.map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link border-0 bg-transparent px-0 pb-3 fw-bold small text-nowrap ${
                    activeTab === tab.id
                      ? "text-primary border-bottom border-primary border-3"
                      : "text-secondary"
                  }`}
                  style={{ borderRadius: 0, marginTop: "0.5rem" }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container my-4 flex-grow-1">
        <div
          className="bg-white border rounded-4 shadow-sm overflow-hidden"
          style={{ minHeight: "400px" }}
        >
          <div className="p-0">
            {activeTab === "sobre" && (
              <div className="p-4">
                <TabSobre paciente={paciente} />
              </div>
            )}

            {/* NOVO: Passando pacienteId para buscar prontuário interno */}
            {activeTab === "anamnese" && (
              <TabAnamnese pacienteId={paciente.id_paciente} />
            )}

            {/* LINHA DO TEMPO / TRATAMENTOS */}
            {activeTab === "evolucao" && (
              <TabEvolucao pacienteId={paciente.id_paciente} />
            )}

            {/* NOVO: Timeline Clínica */}
            {activeTab === "tratamentos" && (
              <TabTratamentos pacienteId={paciente.id_paciente} />
            )}

            {/* Módulos Financeiros (Já estavam prontos) */}
            {activeTab === "débitos" && (
              <TabDebitos pacienteId={paciente.id_paciente} />
            )}

            {/* Módulos de Arquivos (Ainda visuais, podem ser integrados depois seguindo o padrão da anamnese) */}
            {activeTab === "imagens" && <TabImagens />}
            {activeTab === "documentos" && <TabDocumentos />}
          </div>
        </div>
      </div>
    </div>
  );
}
