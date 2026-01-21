import { LogRepository, CreateLogDTO } from "./logRepository";

export class LogService {
  constructor(private repo = new LogRepository()) {}

  // LOG GENÉRICO
  async createLog(data: CreateLogDTO) {
    await this.repo.create(data);
  }


  async logAcesso(data: Omit<CreateLogDTO, "tipo">) {
    await this.repo.create({
      ...data,
      tipo: "ACESSO",
    });
  }

  // BUSCAR LOGS POR PAGINA
  async getLogs(page = 1, perPage = 5) {
    return this.repo.findAll({ page, perPage });
  }

  // BUSCAR LOGS POR TERMO
  async searchLogs(term: string, page = 1, perPage = 5) {
    return this.repo.findBySearch({ term, page, perPage });
  }
}
