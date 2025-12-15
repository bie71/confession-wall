import { Confession, ConfessionStatus } from "../entities/Confession";

export type FindAllConfessionsOptions = {
  query?: string;
  status?: ConfessionStatus;
  page?: number;
  limit?: number;
};

export type PaginatedConfessions = {
  items: Confession[];
  total: number;
  page: number;
  limit: number;
};

export interface IConfessionRepository {
  create(data: Omit<Confession, 'id' | 'likes' | 'dislikes' | 'createdAt'> & { embedding: number[], userId?: number | null }): Promise<Confession>;
  update(id: number, data: Partial<Pick<Confession, 'status' | 'likes' | 'dislikes'>>): Promise<Confession | null>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Confession | null>;
  findAll(options: FindAllConfessionsOptions): Promise<PaginatedConfessions>;
  export(options: Omit<FindAllConfessionsOptions, 'page' | 'limit'>): Promise<Confession[]>;
  findSimilarByEmbedding(embedding: number[]): Promise<Confession | null>;
}
