// src/app/not-found.tsx
"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faHome,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="d-flex flex-column min-vh-100 align-items-center justify-content-center"
      style={{ background: "#e9e9e9" }}
    >
      <div className="container">
        <div
          className="bg-white border rounded-4 shadow-sm p-5 text-center"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          {/* Ícone de Erro */}
          <div className="text-warning mb-4">
            <FontAwesomeIcon icon={faExclamationTriangle} size="5x" />
          </div>

          {/* Título */}
          <h1 className="display-1 fw-bold text-dark mb-3">404</h1>
          <h2 className="h4 fw-bold text-secondary mb-3">
            Página Não Encontrada
          </h2>

          {/* Mensagem */}
          <p className="text-muted mb-4">
            A página que você está procurando não existe ou foi removida.
            Verifique o endereço digitado e tente novamente.
          </p>

          {/* Linha Divisória */}
          <hr className="my-4" />

          {/* Botões de Ação */}
          <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">
            <button
              className="btn btn-outline-secondary px-4 py-2 fw-bold"
              onClick={() => router.back()}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Voltar
            </button>

            <button
              className="button-dark-grey px-4 py-2 fw-bold rounded-pill shadow-sm"
              onClick={() => router.push("/menu")}
            >
              <FontAwesomeIcon icon={faHome} className="me-2" />
              Ir para o Menu
            </button>
          </div>

          {/* Informação Adicional */}
          <div className="mt-4 pt-3 border-top">
            <small className="text-muted">
              Se você acredita que isso é um erro, entre em contato com o
              suporte.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
