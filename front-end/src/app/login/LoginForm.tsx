"use client";

import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // --- LOGIN FORÇADO FICTÍCIO ---
    if (email.toLowerCase() === "paciente@teste.com" && password === "123456") {
      const mockUser = {
        id: "mock-id-123",
        nome: "Ana Beatriz Oliveira",
        email: "paciente@teste.com",
        role: "PACIENTE", // Isso garante que o router.push vá para /meu-perfil
      };

      localStorage.setItem("accessToken", "token-ficticio-valido");
      localStorage.setItem("user", JSON.stringify(mockUser));

      router.push("/meu-perfil");
      setLoading(false);
      return; // Interrompe aqui para não tentar chamar a API real
    }

    try {
      const response = await api.post("/sessions/login", {
        email: email.toLowerCase(),
        senha: password,
      });

      if (response.status === 200) {
        const { accessToken, user } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
        if (user.role === "PACIENTE") {
          router.push("/meu-perfil");
        } else {
          router.push("/menu");
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error: string }>;
      const msg =
        axiosErr?.response?.data?.error || "Usuário ou senha incorretos.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-100 px-md-4">
      {/* Mensagem de Erro */}
      {error && (
        <div className="alert alert-danger mb-4 py-2 text-center small border-0 bg-danger bg-opacity-10 text-danger rounded-3">
          {error}
        </div>
      )}

      {/* <div class="form-group"> 
         <label>Email</label>
         <input class="form-control-underline">
      */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="form-label text-secondary fw-bold small mb-1"
        >
          E-mail
        </label>
        <input
          type="email"
          id="email"
          className="form-control form-control-underline w-100"
          placeholder="seu.email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      {/* <div class="form-group"> 
         <label>Senha</label>
         <input class="form-control-underline">
      */}
      <div className="mb-2">
        <label
          htmlFor="senha"
          className="form-label text-secondary fw-bold small mb-1"
        >
          Senha
        </label>
        <div className="position-relative">
          <input
            type={passwordVisible ? "text" : "password"}
            id="senha"
            className="form-control form-control-underline w-100 pe-5"
            placeholder="sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <button
            type="button"
            className="btn p-0 position-absolute top-50 end-0 translate-middle-y text-secondary border-0 bg-transparent"
            onClick={() => setPasswordVisible(!passwordVisible)}
            style={{ zIndex: 10 }}
          >
            <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
          </button>
        </div>
      </div>

      {/* <div class="forgot-password"> */}
      <div className="d-flex justify-content-end mb-4">
        <Link
          href="/forgot-password"
          className="grey-link-text small fw-semibold fst-italic"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      {/* <button type="submit" class="submit-btn"> -> Usando .button-dark-grey */}
      <button
        type="submit"
        className="button-dark-grey w-100 d-flex justify-content-center align-items-center fw-bold shadow-sm"
        disabled={loading}
      >
        {loading ? (
          <div
            className="spinner-border spinner-border-sm text-white"
            role="status"
          >
            <span className="visually-hidden">Carregando...</span>
          </div>
        ) : (
          "Entrar"
        )}
      </button>

      {/* Link de Registro para Mobile (já que o painel lateral some em telas pequenas) */}
      <div className="d-md-none mt-4 text-center border-top pt-3">
        <p className="small text-secondary mb-1">Não tem uma conta?</p>
        <Link href="/register" className="grey-link-text fw-bold">
          Criar Conta
        </Link>
      </div>
    </form>
  );
}
