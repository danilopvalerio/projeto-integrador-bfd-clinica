"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

import api from "../../utils/api"; // Importado para buscar dados reais futuramente
import { PatientSummary } from "./types";
import PatientCard from "./PatientCard";
import AddPatientModal from "./AddPatientModal";
import PatientDetailModal from "./PatientDetailModal";

import { MOCK_PATIENTS_SUMMARY } from "./types/mockPatients";

const PatientsPage = () => {
  const router = useRouter();

  // Estados de dados
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Função para carregar pacientes (Centralizada para facilitar o refresh)
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      // Quando sua API estiver pronta, use: const res = await api.get("/patients");
      // setPatients(res.data);
      
      // Simulação com Mock por enquanto
      setTimeout(() => {
        setPatients(MOCK_PATIENTS_SUMMARY);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erro ao buscar pacientes", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Função de busca
  const handleSearch = () => {
    const term = searchTerm.toLowerCase();
    const filtered = MOCK_PATIENTS_SUMMARY.filter(
      (p) =>
        p.nome_completo.toLowerCase().includes(term) ||
        p.cpf.includes(term)
    );
    setPatients(filtered);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPatients(MOCK_PATIENTS_SUMMARY);
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: "#e9e9e9" }}>
      {/* Header */}
      <header className="header-panel bg-gradient-vl d-flex align-items-center px-4 shadow-sm">
        <button className="btn btn-link text-white p-0 me-3" onClick={() => router.push("/menu")}>
          <FontAwesomeIcon icon={faArrowLeft} className="fs-4" />
        </button>
        <span className="text-white fw-bold fs-5">Módulo de Pacientes</span>
      </header>

      <div className="container my-5 flex-grow-1">
        <div className="bg-white border rounded-4 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="bg-gradient-vl p-4 text-center text-white">
            <h3 className="fw-bold m-0">Gestão de Pacientes</h3>
            <p className="opacity-75 small m-0 mt-1">Consulte e gerencie o cadastro de pacientes</p>
          </div>

          <div className="p-4">
            {/* Toolbar */}
            <div className="row g-3 mb-4 align-items-end">
              <div className="col-md-6">
                <div className="position-relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                  />
                  <input
                    className="form-control ps-5 rounded-pill border-secondary border-opacity-25"
                    placeholder="Buscar por nome ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  {searchTerm && (
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary cursor-pointer"
                      onClick={handleClearSearch}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </span>
                  )}
                </div>
              </div>

              <div className="col-md-2">
                <button
                  className="button-dark-grey w-100 rounded-pill px-4 py-2 shadow-sm fw-bold"
                  onClick={handleSearch}
                >
                  Pesquisar
                </button>
              </div>

              <div className="col-md-4 text-end">
                <button
                  className="button-dark-grey w-100 w-md-auto rounded-pill px-4 py-2 shadow-sm fw-bold"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Novo Paciente
                </button>
              </div>
            </div>

            {/* Grid de Pacientes */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" />
              </div>
            ) : patients.length ? (
              <div className="row g-3">
                {patients.map((patient) => (
                  <div key={patient.id_paciente} className="col-md-6 col-lg-4">
                    <PatientCard
                      patient={patient}
                      // Alterado de .id para .id_paciente
                      onClick={() => setSelectedPatientId(patient.id_paciente)}
                      onEdit={() => setSelectedPatientId(patient.id_paciente)} 
                      onDelete={() => {
                        if(confirm("Deseja remover este paciente?")) {
                            setPatients((prev) =>
                                prev.filter((p) => p.id_paciente !== patient.id_paciente)
                            );
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 bg-light rounded-3 mt-3">
                <p className="text-muted fw-bold mb-0">Nenhum paciente encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      {isAddModalOpen && (
        <AddPatientModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchPatients(); // Atualiza a lista
          }}
        />
      )}

      {selectedPatientId && (
        <PatientDetailModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
          onSuccess={() => {
            setSelectedPatientId(null);
            fetchPatients(); // Atualiza a lista
          }}
        />
      )}
    </div>
  );
};

export default PatientsPage;