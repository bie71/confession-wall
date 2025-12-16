import { BadWordRepository } from "../../domain/repositories/BadWordRepository";
import { BusinessError } from "../../domain/errors/AppError";

export class UpdateBadWord {
  constructor(private badWordRepository: BadWordRepository) {}

  async execute(id: number, newWord: string) {
    const existingById = await this.badWordRepository.findById(id);
    if (!existingById) {
      throw new BusinessError("Word not found");
    }
    const existingByWord = await this.badWordRepository.findByWord(newWord);
    if (existingByWord && existingByWord.id !== id) {
      throw new BusinessError("New word already exists");
    }
    await this.badWordRepository.update(id, newWord);
  }
}
