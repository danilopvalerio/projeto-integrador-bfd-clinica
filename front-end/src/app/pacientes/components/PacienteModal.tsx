"use client";

import PacienteForm from "./PacienteForm";
import { PacienteEntity, CreatePacienteDTO } from "../dto/pacienteDTO";

interface Props {
  open: boolean;
  onClose: () => void;
  paciente?: PacienteEntity | null;
  onSubmit: (data: CreatePacienteDTO) => void;
}

export default function PacienteModal({
  open,
  onClose,
  paciente,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <div className="modal">
      <PacienteForm
        paciente={paciente ?? undefined}
        onSubmit={onSubmit}
      />

      <button onClick={onClose}>Fechar</button>
    </div>
  );
}
