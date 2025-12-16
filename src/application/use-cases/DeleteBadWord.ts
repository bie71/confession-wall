import { BadWordRepository } from "../../domain/repositories/BadWordRepository";

export class DeleteBadWord {
  constructor(private badWordRepository: BadWordRepository) {}

  async execute(id: number) {
    const existing = await this.badWordRepository.findById(id);
    if (!existing) {
      throw new Error("Word not found");
    }
    await this.badWordRepository.delete(id);
  }
}
