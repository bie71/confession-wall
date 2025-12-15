import { IConfessionRepository } from "../../domain/repositories/ConfessionRepository";
import { broadcast } from "../../infrastructure/websocket";

export class DeleteConfession {
  constructor(private confessionRepository: IConfessionRepository) {}

  async execute(id: number): Promise<void> {
    const confession = await this.confessionRepository.findById(id);
    if (!confession) {
      throw new Error("Confession not found");
    }
    await this.confessionRepository.delete(id);
    broadcast({ type: "deleted", item: { id } });
  }
}
