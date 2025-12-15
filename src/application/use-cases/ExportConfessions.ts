import { IConfessionRepository, FindAllConfessionsOptions } from "../../domain/repositories/ConfessionRepository";
import { Confession } from "../../domain/entities/Confession";

export class ExportConfessions {
  constructor(private confessionRepository: IConfessionRepository) {}

  async execute(options: Omit<FindAllConfessionsOptions, 'page' | 'limit'>): Promise<Confession[]> {
    return this.confessionRepository.export(options);
  }
}
