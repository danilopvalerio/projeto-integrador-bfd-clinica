"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlus, faUserMd } from "@fortawesome/free-solid-svg-icons";
import api from "./../../utils/api";
import { getErrorMessage } from "./../../utils/errorUtils";
import { ProfissionalVinculado } from "./types";

interface Props {
  especialidadeId: string;
}

const EspecialidadeProfissionaisList = ({ especialidadeId }: Props) => {
  const [profissionais, setProfissionais] = useState<ProfissionalVinculado[]>([]);
  const [loading, setLoading] = useState(false);
  const [novoProfId, setNovoProfId] = useState("");

  const fetchProfissionais = useCallback(async () => {
    if (!especialidadeId) return;

    try {
      setLoading(true);

      const res = await api.get(
        `/specialities/${especialidadeId}/profissionais`
      );

      setProfissionais(res.data);
    } catch (error) {
      console.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [especialidadeId]);

  useEffect(() => {
    fetchProfissionais();
  }, [fetchProfissionais]);

  const handleAdd = async () => {
    if (!novoProfId) return;

    try {
      await api.post(
        `/specialities/${especialidadeId}/profissionais`,
        {
          id_profissional: novoProfId,
        }
      );

      setNovoProfId("");
      fetchProfissionais();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const handleRemove = async (profId: string) => {
    if (!confirm("Desvincular profissional dessa especialidade?")) return;

    try {
      await api.delete(
        `/specialities/${especialidadeId}/profissionais`,
        {
          data: { id_profissional: profId },
        }
      );

      fetchProfissionais();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="mt-4 pt-3 border-top animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold text-secondary m-0">
          Profissionais Especializados
        </h6>
        <span className="badge bg-secondary bg-opacity-10 text-secondary">
          {profissionais.length}
        </span>
      </div>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control form-control-sm rounded-pill"
          placeholder="ID do Profissional"
          value={novoProfId}
          onChange={(e) => setNovoProfId(e.target.value)}
        />
        <button
          className="btn btn-sm btn-success rounded-pill px-3"
          onClick={handleAdd}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-secondary"></div>
        </div>
      ) : (
        <div className="list-group list-group-flush rounded-3 border-0">
          {profissionais.length > 0 ? (
            profissionais.map((prof) => (
              <div
                key={prof.id_profissional}
                className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0 mb-2 bg-light rounded px-3"
              >
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="bg-white rounded-circle d-flex align-items-center justify-content-center text-secondary shadow-sm"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <FontAwesomeIcon icon={faUserMd} className="small" />
                  </div>
                  <div className="d-flex flex-column">
                    <span className="fw-bold small text-dark">
                      {prof.nome}
                    </span>
                    <span
                      className="text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {prof.conselho}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-link text-danger p-0 opacity-50 hover-opacity-100"
                  onClick={() => handleRemove(prof.id_profissional)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-muted small py-3 fst-italic">
              Nenhum profissional vinculado a essa especialidade.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EspecialidadeProfissionaisList;