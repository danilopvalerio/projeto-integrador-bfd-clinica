"use client";

import { useState } from "react";


interface Props {
  onSearch: (query: string) => void;
}

export function PacienteSearch({ onSearch }: Props) {
  const [value, setValue] = useState("");

  return (
    <div>
      <input type="text" placeholder="Buscar paciente por nome ou CPF" value={value} onChange={(e) => setValue(e.target.value)}/>

      <button onClick={() => onSearch(value)}>
        Buscar
      </button>
    </div>
  );
}
