"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCalendarCheck, faSignOutAlt, faIdCard } from "@fortawesome/free-solid-svg-icons";

const MOCK_AGENDAMENTOS = [
  {
    id_agendamento: "1",
    servico: "Limpeza e Avaliação",
    profissional: "Dr. Ricardo Silva",
    data_hora_inicio: "2024-03-25T14:00:00",
    status: "Confirmado"
  }
];

export default function PortalPacientePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post("/sessions/logout");
    } catch (error) {
      console.error("Erro no logout", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  if (!user) return null;

  return (
    <div className="min-vh-100 bg-light pb-5">
      {/* NAVBAR AZUL PADRÃO (bg-primary) */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4 shadow-sm py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold fs-4">PORTAL DO PACIENTE</span>
          
          {/* BOTÃO DE SAIR ESTILO MENU/PAGE.TSX */}
          <button 
            onClick={handleLogout}
            className="btn btn-light text-primary fw-bold rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Sair
          </button>
        </div>
      </nav>

      <main className="container">
        <div className="row g-4">
          
          {/* COLUNA 1: MEUS DADOS */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faIdCard} /> 
                  Meus Dados
                </h5>
                
                <div className="mb-3">
                  <label className="text-muted small fw-bold text-uppercase">Nome Completo</label>
                  <p className="mb-0 fw-medium fs-5">{user.nome || "Não informado"}</p>
                </div>

                <div className="mb-3">
                  <label className="text-muted small fw-bold text-uppercase">E-mail de Acesso</label>
                  <p className="mb-0 text-secondary">{user.email}</p>
                </div>

                <div className="p-3 bg-light rounded-3 mt-4 border-start border-4 border-primary">
                  <p className="small text-muted mb-0 italic">
                    Para alterar seus dados cadastrais, entre em contato com a recepção da clínica.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA 2: MEUS AGENDAMENTOS */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarCheck} /> 
                  Minhas Consultas
                </h5>

                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3">Data e Hora</th>
                        <th className="py-3">Serviço</th>
                        <th className="py-3">Profissional</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_AGENDAMENTOS.map((ag) => (
                        <tr key={ag.id_agendamento}>
                          <td className="fw-bold py-3 text-dark">
                            {new Date(ag.data_hora_inicio).toLocaleDateString('pt-BR')} às {new Date(ag.data_hora_inicio).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="py-3">{ag.servico}</td>
                          <td className="text-muted small py-3">{ag.profissional}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}