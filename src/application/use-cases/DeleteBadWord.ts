import { BadWordRepository } from "../../domain/repositories/BadWordRepository";
import { BusinessError } from "../../domain/errors/AppError";

export class DeleteBadWord {
  constructor(private badWordRepository: BadWordRepository) {}

  async execute(id: number) {
    const existing = await this.badWordRepository.findById(id);
    if (!existing) {
      throw new BusinessError("Word not found");
    }
    await this.badWordRepository.delete(id);
  }
}
