"use client";

import { useParams } from "next/navigation";
import { MOCK_PATIENTS, MOCK_MEDICAL_RECORDS } from "../../types/mockData";
import AnamnesisSummary from "./components/AnamnesisSummary";
import ClinicalTimeline from "./components/ClinicalTimeLine";
import TreatmentPlan from "./components/TreatmentPlan";

export default function RecordPage() {
  const { id } = useParams();

  // 1. Busca o paciente específico para o cabeçalho
  const patient = MOCK_PATIENTS.find((p) => p.id_paciente === id);

  // 2. Filtra todos os registros clínicos deste paciente
  const records = MOCK_MEDICAL_RECORDS.filter((r) => r.id_paciente === id);

  if (!patient) {
    return (
      <div className="container p-5 text-center">
        <div className="alert alert-warning shadow-sm">
          ⚠️ Paciente com ID <strong>{id}</strong> não encontrado no sistema.
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f4f7f6" }}>
      {/* Cabeçalho da Página */}
      <header className="bg-white border-bottom py-3 mb-4 shadow-sm">
        <div className="container-fluid px-4 d-flex justify-content-between align-items-center">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb small mb-1">
                <li className="breadcrumb-item"><a href="/patients" className="text-decoration-none text-secondary">Pacientes</a></li>
                <li className="breadcrumb-item active">Prontuário Digital</li>
              </ol>
            </nav>
            <h3 className="fw-bold text-dark m-0">
              {patient.nome_completo} <span className="text-muted fw-normal fs-6">| CPF: {patient.cpf}</span>
            </h3>
          </div>
          <button className="btn btn-primary rounded-pill px-4 fw-bold">
            Imprimir Prontuário
          </button>
        </div>
      </header>

      <main className="container-fluid px-4 pb-5">
        <div className="row g-4">
          
          {/* COLUNA ESQUERDA: Resumo e Planejamento */}
          <div className="col-lg-4 col-md-5">
            <div className="d-grid gap-4">
              {/* Componente de Anamnese (Histórico e Alergias) */}
              <AnamnesisSummary records={records} />
              
              {/* Componente de Plano de Tratamento (Futuro) */}
              <TreatmentPlan records={records} />
            </div>
          </div>

          {/* COLUNA DIREITA: Timeline Central (Histórico de Consultas) */}
          <div className="col-lg-8 col-md-7">
            <ClinicalTimeline records={records} />
          </div>

        </div>
      </main>
    </div>
  );
}