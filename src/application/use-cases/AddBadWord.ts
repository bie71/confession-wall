import { BadWordRepository } from "../../domain/repositories/BadWordRepository";

export class AddBadWord {
  constructor(private badWordRepository: BadWordRepository) {}

  async execute(word: string) {
    const existing = await this.badWordRepository.findByWord(word);
    if (existing) {
      throw new Error("Word already exists");
    }
    return this.badWordRepository.add(word);
  }
}
