import { MedicalRecord } from "../../../types";

interface Props {records: MedicalRecord[];}

export default function ClinicalHistory({ records }: Props) {
  const queixa = records.find(r => r.tipo_registro === "QUEIXA_PRINCIPAL");
  const diagnostico = records.find(r => r.tipo_registro === "DIAGNOSTICO");
  const conduta = records.find(r => r.tipo_registro === "CONDUTA");
  const alertas = records.filter(r => r.tipo_registro === "ALERTA");


  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
      <h5 className="fw-bold text-primary mb-4">Histórico Clínico</h5>

      {/* ALERTAS */}
      <div className="mb-4">
        <label className="text-muted small fw-bold text-uppercase">Alertas Importantes</label>

        {alertas.length > 0 ? (
          <div className="border-start border-4 border-danger ps-3 mt-2">
            <ul className="mb-0">
              {alertas.map(alerta => (
                <li
                  key={alerta.id_prontuario}
                  className="text-danger fw-medium"
                >
                  {alerta.descricao}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted small mt-1">Nenhum alerta registrado.</p>
        )}
      </div>

      {/* QUEIXA */}
      <div className="mb-3">
        <label className="text-muted small fw-bold text-uppercase">Queixa Principal</label>

        <p className="mt-1">
          {queixa?.descricao || "Não informada."}
        </p>
      </div>

      {/* DIAGNÓSTICO */}
      <div className="mb-3">
        <label className="text-muted small fw-bold text-uppercase">Diagnóstico / Hipótese</label>

        <p className="mt-1">
          {diagnostico?.descricao || "Não definido."}
        </p>
      </div>

      {/* CONDUTA */}
      <div>
        <label className="text-muted small fw-bold text-uppercase">Conduta Atual</label>

        <p style={{ whiteSpace: "pre-wrap" }} className="mt-1">
          {conduta?.descricao || "Nenhuma conduta registrada."}
        </p>
      </div>
    </div>
  );
}
