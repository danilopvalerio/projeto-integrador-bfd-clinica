"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPacienteById } from "../services/pacienteService";
import { PacienteEntity } from "../dto/pacienteDTO";
import PacienteForm from "../components/PacienteForm";

export default function EditarPacientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [paciente, setPaciente] = useState<PacienteEntity | null>(null);

  useEffect(() => {
    async function carregarPaciente() {
      const data = await getPacienteById(id);
      setPaciente(data);
    }
    carregarPaciente();
  }, [id]);

  if (!paciente) return <p>Carregando...</p>;

  
  return (
    <div>
      <h1>Editar Paciente</h1>

      <PacienteForm
        paciente={paciente}
        onSuccess={() => router.push(`/pacientes/${id}`)}
      />
    </div>
  );
}
