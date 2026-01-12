//src/app/services/ServicoGeneralForm.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeading,
  faAlignLeft,
  faDollarSign,
  faStopwatch,
} from "@fortawesome/free-solid-svg-icons";

// Interface local que reflete os dados manipulados neste formulário
interface ServicoFormData {
  nome: string;
  descricao: string;
  preco: string | number;
  duracao_estimada: string | number;
  ativo: boolean;
  preco_visivel_paciente: boolean;
}

interface Props {
  data: ServicoFormData;
  // CORREÇÃO: Substituído 'any' pelos tipos reais aceitos no formulário
  onChange: (
    field: keyof ServicoFormData,
    value: string | number | boolean
  ) => void;
  disabled?: boolean;
}

const ServicoGeneralForm = ({ data, onChange, disabled = false }: Props) => {
  return (
    <div className="row g-3">
      <div className="col-12">
        <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">
          Informações Básicas
        </h6>
      </div>

      {/* Nome */}
      <div className="col-12">
        <label className="form-label small text-muted fw-bold">
          Nome do Serviço
        </label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faHeading}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
          <input
            className="p-2 ps-5 w-100 form-control-underline"
            placeholder="Ex: Consulta Geral"
            value={data.nome}
            onChange={(e) => onChange("nome", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      {/* Duração */}
      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">
          Duração (minutos)
        </label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faStopwatch}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
          <input
            type="number"
            className="p-2 ps-5 w-100 form-control-underline"
            placeholder="30"
            value={data.duracao_estimada}
            onChange={(e) => onChange("duracao_estimada", e.target.value)}
            disabled={disabled}
            min={1}
          />
        </div>
      </div>

      {/* Preço */}
      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">
          Preço (R$)
        </label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faDollarSign}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
          <input
            type="number"
            className="p-2 ps-5 w-100 form-control-underline"
            placeholder="0.00"
            value={data.preco}
            onChange={(e) => onChange("preco", e.target.value)}
            disabled={disabled}
            step="0.01"
            min={0}
          />
        </div>
      </div>

      {/* Descrição */}
      <div className="col-12">
        <label className="form-label small text-muted fw-bold">Descrição</label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faAlignLeft}
            className="position-absolute top-20 start-0 mt-3 ms-3 text-secondary"
          />
          <textarea
            className="p-2 ps-5 w-100 form-control-underline"
            rows={3}
            placeholder="Detalhes sobre o procedimento..."
            value={data.descricao}
            onChange={(e) => onChange("descricao", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Configurações (Switches) */}
      <div className="col-12 mt-3">
        <div className="d-flex gap-4">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="ativoSwitch"
              checked={data.ativo}
              onChange={(e) => onChange("ativo", e.target.checked)}
              disabled={disabled}
            />
            <label
              className="form-check-label small fw-bold text-secondary"
              htmlFor="ativoSwitch"
            >
              Serviço Ativo
            </label>
          </div>

          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="precoVisibleSwitch"
              checked={data.preco_visivel_paciente}
              onChange={(e) =>
                onChange("preco_visivel_paciente", e.target.checked)
              }
              disabled={disabled}
            />
            <label
              className="form-check-label small fw-bold text-secondary"
              htmlFor="precoVisibleSwitch"
            >
              Preço visível ao paciente
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicoGeneralForm;
