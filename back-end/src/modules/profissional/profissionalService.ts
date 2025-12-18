import {
  IProfissionalRepository,
  CreateProfissionalDTO,
  ProfissionalEntity,
} from "./profissionalDTO";
import { AppError } from "../../shared/http/middlewares/error.middleware";
import { prisma } from "../../shared/database/prisma";

export class ProfissionalService {
  constructor(private profissionalRepository: IProfissionalRepository) {}

  async create(data: CreateProfissionalDTO): Promise<ProfissionalEntity> {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: data.id_usuario },
    });
    if (!user) throw new AppError("Usuário não encontrado", 404);

    const cpfExists = await this.profissionalRepository.findByCpf(data.cpf);
    if (cpfExists)
      throw new AppError("CPF já cadastrado para um profissional", 409);

    return await this.profissionalRepository.create(data);
  }
}
