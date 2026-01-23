// src/shared/dtos/userTypes.ts
export const UserTypes = {
  PACIENTE: "CLIENTE", // Como está no DB
  PROFISSIONAL: "PROFISSIONAL",
  RECEPCIONISTA: "RECEPCIONISTA",
  ADMIN: "ADMIN",
  GERENTE: "GERENTE",
} as const;

// Tipos derivados
export type UserType = (typeof UserTypes)[keyof typeof UserTypes];

// Grupos de permissão
export const UserGroups = {
  STAFF: [
    UserTypes.PROFISSIONAL,
    UserTypes.RECEPCIONISTA,
    UserTypes.ADMIN,
    UserTypes.GERENTE,
  ], // Todos exceto paciente
  ADMIN_ONLY: [UserTypes.ADMIN, UserTypes.GERENTE],
  ALL: Object.values(UserTypes),
} as const;
