import { BadWordRepository } from "../../domain/repositories/BadWordRepository";

export class ListBadWords {
  constructor(private badWordRepository: BadWordRepository) {}

  async execute() {
    return this.badWordRepository.getAll();
  }
}
