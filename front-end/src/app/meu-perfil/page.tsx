"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faSignOutAlt,
  faIdCard,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

// --- TIPAGEM ---
interface PortalUser {
  id_usuario: string;
  email: string;
  tipo_usuario: string;
  paciente?: {
    nome: string;
    cpf?: string;
    sexo?: string;
  };
  nome?: string;
}

interface Agendamento {
  id_agendamento: string;
  start: string;
  servico: {
    nomes: string; // Ex: "Limpeza, Avaliação"
    valor_total: number;
  };
  profissional: {
    nome: string;
  };
  status: string;
}

interface MeusAgendamentosResponse {
  paciente: {
    nome: string;
    cpf: string;
    sexo: string;
  };
  data: Agendamento[];
  total: number;
  page: number;
  lastPage: number;
}

export default function PortalPacientePage() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchMeusAgendamentos(parsedUser);
      } catch (error) {
        console.error("Erro ao ler dados do usuário", error);
        localStorage.removeItem("user");
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchMeusAgendamentos = async (currentUser: PortalUser) => {
    setLoadingAgendamentos(true);
    try {
      const response = await api.get<MeusAgendamentosResponse>(
        "/agendamentos/me?page=1&limit=5",
      );
      setAgendamentos(response.data.data);

      if (response.data.paciente) {
        const dadosAtualizados = response.data.paciente;
        if (currentUser.paciente?.nome !== dadosAtualizados.nome) {
          const novoUser = {
            ...currentUser,
            paciente: { ...currentUser.paciente, ...dadosAtualizados },
          };
          setUser(novoUser);
          localStorage.setItem("user", JSON.stringify(novoUser));
        }
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos", error);
    } finally {
      setLoadingAgendamentos(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/sessions/logout");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  /**
   * Função para formatar a exibição de múltiplos serviços
   */
  const renderServicos = (nomes: string) => {
    const lista = nomes.split(",").map((s) => s.trim());
    if (lista.length <= 1) return nomes;

    return (
      <div className="d-flex align-items-center gap-2">
        <span className="text-truncate" style={{ maxWidth: "150px" }}>
          {lista[0]}
        </span>
        <span
          className="badge bg-secondary-subtle text-secondary border rounded-pill fw-normal"
          title={nomes} // Mostra todos ao passar o mouse
          style={{ cursor: "help" }}
        >
          +{lista.length - 1}
        </span>
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="min-vh-100 bg-light pb-5">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4 shadow-sm py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <span className="navbar-brand fw-bold fs-4">PORTAL DO PACIENTE</span>
          <button
            onClick={handleLogout}
            className="btn btn-light text-primary fw-bold rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Sair
          </button>
        </div>
      </nav>

      <main className="container">
        <div className="row g-4">
          {/* COLUNA 1: DADOS */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faIdCard} /> Meus Dados
                </h5>
                <div className="mb-3">
                  <label className="text-muted small fw-bold text-uppercase">
                    Nome Completo
                  </label>
                  <p className="mb-0 fw-medium fs-5 text-dark">
                    {user.paciente?.nome || user.nome || "Paciente"}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="text-muted small fw-bold text-uppercase">
                    E-mail
                  </label>
                  <p className="mb-0 text-secondary">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA 2: LISTAGEM */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4 text-primary d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faCalendarCheck} /> Minhas Consultas
                </h5>

                {loadingAgendamentos ? (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                  </div>
                ) : agendamentos.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-3">
                    <p className="text-muted mb-0">
                      Nenhum agendamento encontrado.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="py-3 ps-3">Data e Hora</th>
                          <th className="py-3">Serviço(s)</th>
                          <th className="py-3">Profissional</th>
                          <th className="py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agendamentos.map((ag) => (
                          <tr key={ag.id_agendamento}>
                            <td className="ps-3">
                              <div className="d-flex flex-column">
                                <span className="fw-bold text-dark">
                                  {new Date(ag.start).toLocaleDateString(
                                    "pt-BR",
                                  )}
                                </span>
                                <small className="text-muted">
                                  <FontAwesomeIcon
                                    icon={faClock}
                                    className="me-1"
                                    size="xs"
                                  />
                                  {new Date(ag.start).toLocaleTimeString(
                                    "pt-BR",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </small>
                              </div>
                            </td>
                            {/* AQUI A MUDANÇA PARA MÚLTIPLOS SERVIÇOS */}
                            <td className="py-3">
                              {renderServicos(ag.servico.nomes)}
                            </td>
                            <td className="text-muted small py-3">
                              {ag.profissional.nome}
                            </td>
                            <td className="text-center">
                              <span
                                className={`badge rounded-pill bg-opacity-10 text-uppercase small px-3 py-2 
                                ${
                                  ag.status === "CONFIRMADO"
                                    ? "bg-success text-success"
                                    : ag.status === "CANCELADO"
                                      ? "bg-danger text-danger"
                                      : "bg-warning text-warning"
                                }`}
                              >
                                {ag.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
