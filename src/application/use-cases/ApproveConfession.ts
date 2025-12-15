import { IConfessionRepository } from "../../domain/repositories/ConfessionRepository";
import { Confession } from "../../domain/entities/Confession";
import { broadcast } from "../../infrastructure/websocket";

export class ApproveConfession {
  constructor(private confessionRepository: IConfessionRepository) {}

  async execute(id: number): Promise<Confession> {
    const confession = await this.confessionRepository.update(id, { status: 'APPROVED' });
    if (!confession) {
      throw new Error("Confession not found");
    }
    broadcast({ type: "approved", item: confession });
    return confession;
  }
}
