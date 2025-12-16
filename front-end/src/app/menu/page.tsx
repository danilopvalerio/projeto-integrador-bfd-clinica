"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function MenuPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Verifica se está logado
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("accessToken");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    setUserName(user.nome || "Usuário");
    setUserRole(user.role || "Visitante");
  }, [router]);

  const handleLogout = async () => {
    try {
      // Tenta chamar o backend para invalidar refresh token (opcional mas recomendado)
      await api.post("/sessions/logout");
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    } finally {
      // Limpa tudo localmente
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      // Força o redirecionamento
      router.push("/login");
    }
  };

  return (
    // Usando sua classe 'bg-gradient-vl' para fundo e centralização
    <div className="d-flex vh-100 w-100 justify-content-center align-items-center bg-gradient-vl">
      <div
        className="bg-white p-5 rounded-4 shadow-lg text-center"
        style={{ maxWidth: "500px", width: "90%" }}
      >
        <div className="text-success mb-4" style={{ fontSize: "4rem" }}>
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>

        <h1 className="quartenary fw-bold mb-2">Usuário Logado com Sucesso!</h1>

        <div className="my-4 py-3 border-top border-bottom">
          <p className="text-secondary mb-1 small text-uppercase fw-bold">
            Bem-vindo(a)
          </p>
          <h3 className="text-dark fw-bold mb-0">{userName}</h3>
          <span className="badge bg-secondary mt-2 px-3 py-2 rounded-pill">
            {userRole}
          </span>
        </div>

        {/* Botão de Logout usando sua classe 'button-dark-grey' */}
        <button
          onClick={handleLogout}
          className="button-dark-grey w-100 d-flex justify-content-center align-items-center gap-2 fw-bold"
          style={{ height: "3rem" }}
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          SAIR DO SISTEMA
        </button>
      </div>
    </div>
  );
}
