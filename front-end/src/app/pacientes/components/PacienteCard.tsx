import { PacienteEntity } from "../dto/pacienteDTO";

interface Props {
  paciente: PacienteEntity;
  onClick: () => void;
}

export default function PacienteCard({ paciente, onClick }: Props) {
  return (
    <div
      className="card border-0 shadow-sm h-100 cursor-pointer hover-scale"
      onClick={onClick}
    >
      <div className="card-body d-flex flex-column gap-2">
        <h5 className="fw-bold text-dark mb-1">{paciente.nome}</h5>

        <span className="text-muted small">
          <strong>CPF:</strong> {paciente.cpf}
        </span>

        <span className="text-muted small">
          <strong>Email:</strong> {paciente.email}
        </span>

        <span className="text-muted small">
          <strong>Telefone:</strong> {paciente.telefone}
        </span>

        <span className="text-muted small">
          <strong>Sexo:</strong> {paciente.sexo}
        </span>

        <span className="text-muted small">
          <strong>Nascimento:</strong>{" "}
          {new Date(paciente.data_nascimento).toLocaleDateString("pt-BR")}
        </span>
      </div>
    </div>
  );
}
