import { IConfessionRepository } from "../../domain/repositories/ConfessionRepository";
import { Confession } from "../../domain/entities/Confession";
import { broadcast } from "../../infrastructure/websocket";

export class RejectConfession {
  constructor(private confessionRepository: IConfessionRepository) {}

  async execute(id: number): Promise<Confession> {
    const confession = await this.confessionRepository.update(id, { status: 'REJECTED' });
    if (!confession) {
      throw new Error("Confession not found");
    }
    // Decide if a broadcast is needed for rejections
    // broadcast({ type: "rejected", item: confession });
    return confession;
  }
}
