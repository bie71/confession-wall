import {
  IConfessionRepository,
  FindAllConfessionsOptions,
  PaginatedConfessions,
} from "../../domain/repositories/ConfessionRepository";

export class ListConfessions {
  constructor(private confessionRepository: IConfessionRepository) {}

  async execute(options: FindAllConfessionsOptions): Promise<PaginatedConfessions> {
    const { query, status, page = 1, limit = 10 } = options;

    const sanitizedPage = Math.max(1, Number(page));
    const sanitizedLimit = Math.min(50, Math.max(1, Number(limit)));
    
    return this.confessionRepository.findAll({
      query,
      status: status || 'APPROVED',
      page: sanitizedPage,
      limit: sanitizedLimit,
    });
  }
}
