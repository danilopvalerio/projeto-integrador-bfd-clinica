"use client";

import "../../../styles/pacientes.css";

type Paciente = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
};

export default function PacienteList() {
  //TESTE
  const pacientes: Paciente[] = [
    { id: 1, nome: "Maria Silva", email: "maria@email.com", telefone: "99999-0000" },
    { id: 2, nome: "João Souza", email: "joao@email.com", telefone: "98888-1111" },
  ];

  return (
    <section>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {pacientes.map((paciente) => (
            <tr key={paciente.id}>
              <td>{paciente.nome}</td>
              <td>{paciente.email}</td>
              <td>{paciente.telefone}</td>
              <td>
                <button>Editar</button>
                <button>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
