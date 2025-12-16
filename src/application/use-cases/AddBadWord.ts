import { BadWordRepository } from "../../domain/repositories/BadWordRepository";
import { BusinessError } from "../../domain/errors/AppError";

export class AddBadWord {
  constructor(private badWordRepository: BadWordRepository) {}

  async execute(word: string) {
    const existing = await this.badWordRepository.findByWord(word);
    if (existing) {
      throw new BusinessError("Word already exists");
    }
    return this.badWordRepository.add(word);
  }
}
