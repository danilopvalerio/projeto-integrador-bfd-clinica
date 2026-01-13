"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faSearch,
  faTimes,
  faTrash,
  faBriefcaseMedical,
} from "@fortawesome/free-solid-svg-icons";

import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";

import type {
  PaginatedResponse,
  ServicoEntityForProfissional,
} from "./types";

interface Props {
  profissionalId: string;
}

const LIMIT = 6;

const ProfissionalServicosList = ({ profissionalId }: Props) => {
  // ===== Vinculados =====
  const [linked, setLinked] = useState<ServicoEntityForProfissional[]>([]);
  const [linkedLoading, setLinkedLoading] = useState(true);
  const [linkedError, setLinkedError] = useState("");
  const [linkedPage, setLinkedPage] = useState(1);
  const [linkedTotalPages, setLinkedTotalPages] = useState(1);
  const [linkedSearch, setLinkedSearch] = useState("");

  // ===== Disponíveis (para selecionar/vincular) =====
  const [available, setAvailable] = useState<ServicoEntityForProfissional[]>([]);
  const [availableLoading, setAvailableLoading] = useState(true);
  const [availableError, setAvailableError] = useState("");
  const [availablePage, setAvailablePage] = useState(1);
  const [availableTotalPages, setAvailableTotalPages] = useState(1);
  const [availableSearch, setAvailableSearch] = useState("");

  const fetchLinked = async (page = 1, term = "") => {
    setLinkedLoading(true);
    setLinkedError("");

    try {
      let url = `/professionals/${profissionalId}/servicos/paginated?page=${page}&limit=${LIMIT}`;
      if (term) {
        url = `/professionals/${profissionalId}/servicos/search?q=${encodeURIComponent(
          term
        )}&page=${page}&limit=${LIMIT}`;
      }

      const response = await api.get(url);
      const data = response.data as PaginatedResponse<ServicoEntityForProfissional>;

      setLinked(data.data);
      setLinkedPage(data.page);
      setLinkedTotalPages(data.lastPage);
    } catch (err) {
      setLinkedError(getErrorMessage(err));
    } finally {
      setLinkedLoading(false);
    }
  };

  const fetchAvailable = async (page = 1, term = "") => {
    setAvailableLoading(true);
    setAvailableError("");

    try {
      let url = `/services/paginated?page=${page}&limit=${LIMIT}`;
      if (term) {
        url = `/services/search?q=${encodeURIComponent(
          term
        )}&page=${page}&limit=${LIMIT}`;
      }

      const response = await api.get(url);
      const data = response.data as PaginatedResponse<ServicoEntityForProfissional>;

      setAvailable(data.data);
      setAvailablePage(data.page);
      setAvailableTotalPages(data.lastPage);
    } catch (err) {
      setAvailableError(getErrorMessage(err));
    } finally {
      setAvailableLoading(false);
    }
  };

  useEffect(() => {
    fetchLinked(1, "");
    fetchAvailable(1, "");
    
  }, [profissionalId]);

  const handleLink = async (id_servico: string) => {
    try {
      await api.post(`/professionals/${profissionalId}/servicos`, { id_servico });

      // Atualiza as duas listas
      fetchLinked(linkedPage, linkedSearch);
      fetchAvailable(availablePage, availableSearch);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleUnlink = async (id_servico: string) => {
    const ok = confirm("Desvincular este serviço do profissional?");
    if (!ok) return;

    try {
      await api.delete(`/professionals/${profissionalId}/servicos`, {
        data: { id_servico },
      });

      fetchLinked(linkedPage, linkedSearch);
      fetchAvailable(availablePage, availableSearch);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="animate-fade-in">
      {/* ===== VINCULADOS ===== */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faBriefcaseMedical} />
          <span className="fw-bold">Serviços vinculados</span>
        </div>
      </div>

      <div className="row g-2 mb-3 align-items-end">
        <div className="col-12">
          <div className="position-relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
            />
            <input
              className="form-control ps-5 rounded-pill border-secondary border-opacity-25"
              placeholder="Buscar nos vinculados..."
              value={linkedSearch}
              onChange={(e) => setLinkedSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLinked(1, linkedSearch)}
            />
            {linkedSearch && (
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary cursor-pointer"
                onClick={() => {
                  setLinkedSearch("");
                  fetchLinked(1, "");
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </span>
            )}
          </div>
        </div>

        <div className="col-12 d-flex justify-content-end gap-2">
          <button
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
            onClick={() => fetchLinked(1, linkedSearch)}
          >
            Pesquisar
          </button>
        </div>
      </div>

      {linkedError && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3">
          {linkedError}
        </div>
      )}

      {linkedLoading ? (
        <div className="text-center py-3">
          <div className="spinner-border text-secondary spinner-border-sm" />
          <p className="text-muted small mt-2 mb-0">Carregando vinculados...</p>
        </div>
      ) : linked.length ? (
        <>
          <div className="list-group mb-2">
            {linked.map((s) => (
              <div
                key={s.id_servico}
                className="list-group-item d-flex justify-content-between align-items-center rounded-3 mb-2"
              >
                <div>
                  <div className="fw-bold">{s.nome}</div>
                  <div className="text-muted small">
                    {s.descricao || "Sem descrição"}
                  </div>
                </div>

                <button
                  className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
                  onClick={() => handleUnlink(s.id_servico)}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Remover
                </button>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
            <button
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
              disabled={linkedPage === 1}
              onClick={() => fetchLinked(linkedPage - 1, linkedSearch)}
            >
              Anterior
            </button>
            <span className="text-secondary small fw-bold">
              Página {linkedPage} de {linkedTotalPages}
            </span>
            <button
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
              disabled={linkedPage === linkedTotalPages}
              onClick={() => fetchLinked(linkedPage + 1, linkedSearch)}
            >
              Próxima
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-muted small py-3 fst-italic">
          Nenhum serviço vinculado.
        </div>
      )}

      <hr className="my-4" />

      {/* ===== DISPONÍVEIS ===== */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faPlus} />
          <span className="fw-bold">Vincular novo serviço</span>
        </div>
      </div>

      <div className="row g-2 mb-3 align-items-end">
        <div className="col-12">
          <div className="position-relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
            />
            <input
              className="form-control ps-5 rounded-pill border-secondary border-opacity-25"
              placeholder="Buscar no catálogo de serviços..."
              value={availableSearch}
              onChange={(e) => setAvailableSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && fetchAvailable(1, availableSearch)
              }
            />
            {availableSearch && (
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary cursor-pointer"
                onClick={() => {
                  setAvailableSearch("");
                  fetchAvailable(1, "");
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </span>
            )}
          </div>
        </div>

        <div className="col-12 d-flex justify-content-end gap-2">
          <button
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
            onClick={() => fetchAvailable(1, availableSearch)}
          >
            Pesquisar
          </button>
        </div>
      </div>

      {availableError && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3">
          {availableError}
        </div>
      )}

      {availableLoading ? (
        <div className="text-center py-3">
          <div className="spinner-border text-secondary spinner-border-sm" />
          <p className="text-muted small mt-2 mb-0">Carregando catálogo...</p>
        </div>
      ) : available.length ? (
        <>
          <div className="list-group mb-2">
            {available.map((s) => (
              <div
                key={s.id_servico}
                className="list-group-item d-flex justify-content-between align-items-center rounded-3 mb-2"
              >
                <div>
                  <div className="fw-bold">{s.nome}</div>
                  <div className="text-muted small">
                    {s.descricao || "Sem descrição"}
                  </div>
                </div>

                <button
                  className="button-dark-grey btn btn-sm rounded-pill px-3 fw-bold shadow-sm"
                  onClick={() => handleLink(s.id_servico)}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Vincular
                </button>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
            <button
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
              disabled={availablePage === 1}
              onClick={() => fetchAvailable(availablePage - 1, availableSearch)}
            >
              Anterior
            </button>
            <span className="text-secondary small fw-bold">
              Página {availablePage} de {availableTotalPages}
            </span>
            <button
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
              disabled={availablePage === availableTotalPages}
              onClick={() => fetchAvailable(availablePage + 1, availableSearch)}
            >
              Próxima
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-muted small py-3 fst-italic">
          Nenhum serviço encontrado no catálogo.
        </div>
      )}
    </div>
  );
};

export default ProfissionalServicosList;
