"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faSignOutAlt,
  faUserMd,
  faStethoscope,
  faNotesMedical,
  faCalendarCheck,
  faUsers,
  faChevronRight,
  faShieldHalved,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

interface User {
  nome: string;
  role: string;
}

interface MenuCardProps {
  title: string;
  description?: string;
  icon: IconDefinition;
  onClick?: () => void;
  active?: boolean;
}

const MenuCard = ({
  title,
  description,
  icon,
  onClick,
  active = true,
}: MenuCardProps) => {
  return (
    <div
      className="col-12 col-md-6 col-lg-4 mb-4"
      onClick={active ? onClick : undefined}
    >
      <div
        className={`card h-100 shadow-sm p-4 menu-card ${
          active ? "active" : "inactive"
        }`}
      >
        <div className="d-flex align-items-center h-100">
          <div className="menu-icon-circle">
            <FontAwesomeIcon icon={icon} />
          </div>

          <div className="flex-grow-1">
            <h5 className="fw-bold mb-1 quartenary">{title}</h5>
            {description && (
              <small className="small menu-card-desc">{description}</small>
            )}
            {!active && <span className="badge menu-badge">Em breve</span>}
          </div>

          {active && (
            <div className="text-muted">
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MenuPage() {
  const router = useRouter();
  const [user, setUser] = useState<User>({ nome: "", role: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser({
        nome: parsedUser.nome || "Usuário",
        role: parsedUser.role || "Visitante",
      });
    } catch (e) {
      console.error("Erro ao ler usuário", e);
      router.push("/login");
    } finally {
      setLoading(false);
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

  const navigateTo = (path: string) => router.push(path);

  if (loading) return null;

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <header className="menu-header px-4 px-md-5 d-flex justify-content-between align-items-center sticky-top">
        <div className="d-flex align-items-center gap-3">
          <div className="menu-logo bg-gradient-vl shadow-sm">VL</div>

          <div className="d-flex flex-column">
            <span className="fw-bold quartenary fs-6">
              Olá, {user.nome.split(" ")[0]}
            </span>
            <span
              className="text-uppercase small fw-bold text-muted"
              style={{ fontSize: "0.7rem" }}
            >
              {user.role}
            </span>
          </div>

          <button
            className="btn btn-link p-0 ms-2 text-decoration-none"
            style={{ color: "var(--color-gray-medium)" }}
            title="Configurações da Conta"
            onClick={() => alert("Configurações em breve!")}
          >
            <FontAwesomeIcon icon={faCog} className="fs-5 hover-rotate" />
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-outline-danger d-flex align-items-center gap-2 btn-sm fw-bold rounded-pill px-3"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          Sair
        </button>
      </header>

      <main className="container py-5 flex-grow-1 menu-container-limit">
        <div className="mb-5 animate-fade-in">
          <div className="d-flex align-items-center mb-4">
            <div className="section-pill bg-gradient-vl"></div>
            <h6 className="quartenary fw-bold text-uppercase m-0 text-ls-1">
              Cadastros Gerais
            </h6>
          </div>

          <div className="row g-4">
            <MenuCard
              title="Profissionais"
              description="Gerencie médicos e equipe."
              icon={faUserMd}
              onClick={() => navigateTo("/profissionais")}
            />
            <MenuCard
              title="Especialidades"
              description="Tipos de atendimento."
              icon={faStethoscope}
              onClick={() => navigateTo("/especialidade")}
            />
            <MenuCard
              title="Serviços"
              description="Procedimentos e preços."
              icon={faNotesMedical}
              onClick={() => navigateTo("/services")}
            />
          </div>
        </div>

        <div className="animate-fade-in delay-100">
          <div className="d-flex align-items-center mb-4">
            <div className="section-pill bg-secondary"></div>
            <h6 className="fw-bold text-uppercase m-0 text-ls-1 text-secondary">
              Operacional
            </h6>
          </div>

          <div className="row g-4">
            <MenuCard
              title="Agenda"
              description="Marcação de consultas."
              icon={faCalendarCheck}
              active={true}
              onClick={() => navigateTo("/agendamentos")}
            />
            <MenuCard
              title="Pacientes"
              description="Base de clientes."
              icon={faUsers}
              active={true}
              onClick={() => navigateTo("/patients")}
            />

            <MenuCard
              title="Histórico de Acessos"
              description="Registros de login e tentativas de acesso ao sistema."
              icon={faShieldHalved}
              active={true}
              onClick={() => navigateTo("/logs-sistema")}
            />
          </div>
        </div>
      </main>

      <footer className="w-100 text-center py-3 mt-auto">
        <p className="m-0 small text-white">
          © 2025 Softex PE. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
