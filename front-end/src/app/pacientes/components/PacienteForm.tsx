"use client";

import { useEffect, useState } from "react";
import { CreatePacienteDTO, PacienteEntity } from "../dto/pacienteDTO";



interface PacienteFormProps {
  paciente?: PacienteEntity;
  onSubmit: (data: CreatePacienteDTO) => void;
}


export default function PacienteForm({
  paciente,
  onSubmit,
}: PacienteFormProps) {
  const [form, setForm] = useState<CreatePacienteDTO>({
    nome: "",
    cpf: "",
    data_nascimento: "",
    sexo: "",
    email: "",
    telefone: "",
  });

  useEffect(() => {
    if (paciente) {
      setForm({
        nome: paciente.nome,
        cpf: paciente.cpf,
        data_nascimento: paciente.data_nascimento,
        sexo: paciente.sexo,
        email: paciente.email,
        telefone: paciente.telefone,
      });
    }
  }, [paciente]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="nome" value={form.nome} onChange={handleChange} />
      <input name="cpf" value={form.cpf} onChange={handleChange} />
      <input type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange}/>

      <select name="sexo" value={form.sexo} onChange={handleChange}>
        <option value="">Sexo</option>
        <option value="F">Feminino</option>
        <option value="M">Masculino</option>
      </select>

      <input name="email" value={form.email} onChange={handleChange} />
      <input name="telefone" value={form.telefone} onChange={handleChange} />

      <button type="submit">Salvar</button>
    </form>
  );
}
