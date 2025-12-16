import { BadWordRepository } from "../../domain/repositories/BadWordRepository";

export class UpdateBadWord {
  constructor(private badWordRepository: BadWordRepository) {}

  async execute(id: number, newWord: string) {
    const existingById = await this.badWordRepository.findById(id);
    if (!existingById) {
      throw new Error("Word not found");
    }
    const existingByWord = await this.badWordRepository.findByWord(newWord);
    if (existingByWord && existingByWord.id !== id) {
      throw new Error("New word already exists");
    }
    await this.badWordRepository.update(id, newWord);
  }
}
