import { BadWord } from "../entities/BadWord";

export interface BadWordRepository {
  add(word: string): Promise<BadWord>;
  findById(id: number): Promise<BadWord | null>;
  findByWord(word: string): Promise<BadWord | null>;
  getAll(): Promise<BadWord[]>;
  update(id: number, newWord: string): Promise<void>;
  delete(id: number): Promise<void>;
}
