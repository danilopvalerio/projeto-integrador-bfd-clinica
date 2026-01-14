import { MedicalRecord } from "../../../types";

export default function AnamnesisSummary({ records }: { records: MedicalRecord[] }) {
  const anamnese = records.find(r => r.tipo_registro === "ANAMNESE");
  const plano = records.find(r => r.tipo_registro === "PLANO_TRATAMENTO");

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <h5 className="fw-bold text-primary mb-3">Resumo Clínico</h5>
      <div className="mb-4">
        <label className="text-muted small fw-bold text-uppercase">Anamnese / Alergias</label>
        <p className="border-start border-3 border-danger ps-2 mt-1">{anamnese?.descricao || "Nenhum alerta."}</p>
      </div>
      <div>
        <label className="text-muted small fw-bold text-uppercase">Plano de Tratamento</label>
        <p className="mt-1">{plano?.descricao || "Nenhum plano definido."}</p>
      </div>
    </div>
  );
}