import { MedicalRecord } from "../../../types";

export default function ClinicalTimeline({ records }: { records: MedicalRecord[] }) {
  const evolucoes = records.filter(r => r.tipo_registro === "EVOLUCAO_VISITA");

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <h5 className="fw-bold text-primary mb-4">Histórico de Evoluções</h5>
      {evolucoes.length === 0 ? <p>Nenhuma evolução registrada.</p> : (
        <div className="position-relative">
          {evolucoes.map((rec) => (
            <div key={rec.id_prontuario} className="mb-4 ps-4 position-relative border-start border-2">
              <div className="position-absolute translate-middle-x bg-primary rounded-circle" 
                   style={{ width: "12px", height: "12px", left: "-1px", top: "10px" }}></div>
              <span className="text-muted small">{new Date(rec.data_registro).toLocaleDateString()}</span>
              <p className="mt-1 fw-medium">{rec.descricao}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}