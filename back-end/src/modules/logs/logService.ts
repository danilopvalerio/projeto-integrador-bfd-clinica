import { LogRepository } from "./logRepository";

export class LogService {
  constructor(private logRepository: LogRepository) {}

  async findAll() {
    return this.logRepository.findAll();
  }

  async listPaginated(page: number, limit: number) {
    return this.logRepository.listPaginated(page, limit);
  }

  async searchPaginated(term: string, page: number, limit: number) {
    return this.logRepository.searchPaginated(term, page, limit);
  }
}
