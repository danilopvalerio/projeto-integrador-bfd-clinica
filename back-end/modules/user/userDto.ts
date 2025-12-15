import { UserType } from "./userEnum";

export interface CreateUserDTO {
  email: string;
  senha_hash: string;
  tipo_usuario: UserType;
}
