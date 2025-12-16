import Link from "next/link";
import LoginForm from "./LoginForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignInAlt,
  faServer,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";

// Função para verificar se o back-end está vivo
async function checkHealth() {
  try {
    const res = await fetch("http://localhost:3333/api/health", {
      cache: "no-store", // Garante que não use cache
      next: { revalidate: 0 }, // Força a requisição a cada acesso
    });
    return res.ok;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export default async function LoginPage() {
  // Executa a verificação antes de renderizar
  const isOnline = await checkHealth();

  // === CENÁRIO 1: SISTEMA FORA DO AR ===
  if (!isOnline) {
    return (
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center bg-light">
        <div
          className="d-flex flex-column justify-content-center align-items-center bg-gradient-vl text-white p-5 rounded-4 shadow-lg text-center"
          style={{ maxWidth: "500px", width: "90%" }}
        >
          <div
            className="d-flex justify-content-center align-items-center rounded-circle mb-4 bg-white bg-opacity-25"
            style={{ width: "100px", height: "100px" }}
          >
            <FontAwesomeIcon icon={faServer} style={{ fontSize: "3rem" }} />
          </div>

          <h2 className="fw-bold mb-3">Sistema Indisponível</h2>

          <p className="mb-4 opacity-75">
            Não conseguimos estabelecer conexão com o servidor. Por favor,
            verifique se o Back-end está rodando na porta 3333.
          </p>

          <div className="bg-white bg-opacity-10 p-3 rounded-3 w-100 d-flex align-items-center justify-content-center gap-2">
            <FontAwesomeIcon icon={faWifi} className="text-warning" />
            <span className="small font-monospace">
              GET /api/health : FALHOU
            </span>
          </div>

          <Link
            href="/login"
            className="btn btn-light rounded-pill px-4 py-2 fw-bold mt-4 text-primary text-decoration-none"
          >
            Tentar Novamente
          </Link>
        </div>

        <footer className="w-100 text-center py-3 mt-auto">
          <p className="m-0 small text-secondary">
            © 2025 Softex PE. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    );
  }

  // === CENÁRIO 2: SISTEMA ONLINE (TELA DE LOGIN) ===
  return (
    <div className="d-flex flex-column min-vh-100 align-items-center bg-light">
      <div
        className="d-flex shadow-lg rounded-4 overflow-hidden my-auto"
        style={{ maxWidth: "900px", width: "90%", minHeight: "500px" }}
      >
        {/* === SIDE PANEL (Esquerda) === */}
        <div className="col-5 d-none d-md-flex flex-column justify-content-center align-items-center bg-gradient-vl text-white p-5 text-center">
          <div
            className="d-flex justify-content-center align-items-center rounded-circle mb-4"
            style={{
              width: "80px",
              height: "80px",
              border: "2px solid rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            <FontAwesomeIcon icon={faSignInAlt} style={{ fontSize: "2rem" }} />
          </div>

          <h2 className="fw-bold mb-3">Acesso à Área de Login</h2>

          <p className="mb-5 opacity-75 small">
            Faça seu login para gerenciar seus agendamentos e acessar seus
            resultados.
          </p>

          <p className="mb-2 small">Não tem uma conta?</p>

          <Link
            href="/register"
            className="btn btn-outline-light rounded-pill px-4 py-2 fw-bold text-decoration-none"
            style={{ fontSize: "0.9rem" }}
          >
            Criar Conta
          </Link>
        </div>

        {/* === FORM PANEL (Direita) === */}
        <div className="col-12 col-md-7 bg-white p-5 d-flex flex-column justify-content-center">
          <h2 className="text-center mb-5 quartenary fw-bold fs-3">
            Login de Usuário
          </h2>

          <LoginForm />
        </div>
      </div>

      {/* === FOOTER === */}
      <footer className="w-100 text-center py-3">
        <p className="m-0 small">
          © 2025 Softex PE. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
