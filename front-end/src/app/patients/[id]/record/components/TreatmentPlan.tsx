import { MedicalRecord } from "../../../types";

interface Props {
  records: MedicalRecord[];
}

export default function TreatmentPlan({ records }: { records: MedicalRecord[] }) {
  // Filtra apenas o registro que contém o plano de tratamento
  const plano = records.find((r) => r.tipo_registro === "PLANO_TRATAMENTO");

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mt-3">
      <div className="d-flex align-items-center gap-2 mb-3">
        <h5 className="fw-bold text-primary m-0">Plano de Tratamento</h5>
      </div>

      <div className="bg-light p-3 rounded-3 border-start border-4 border-primary">
        {plano ? (
          <div className="white-space-pre-wrap text-secondary" style={{ whiteSpace: 'pre-wrap' }}>
            {plano.descricao}
          </div>
        ) : (
          <p className="text-muted small m-0 italic">
            Nenhum plano de tratamento detalhado para este paciente.
          </p>
        )}
      </div>

      <div className="mt-3">
        <button className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold">
          + Novo Procedimento
        </button>
      </div>
    </div>
  );
}