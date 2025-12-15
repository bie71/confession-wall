import { IConfessionRepository } from "../../domain/repositories/ConfessionRepository";
import { Confession } from "../../domain/entities/Confession";
import { broadcast } from "../../infrastructure/websocket";

// Naive bad-words list (can be moved to a more robust service)
const BAD_WORDS = ["bangsat", "anjing", "goblok"];

export class CreateConfession {
  constructor(private confessionRepository: IConfessionRepository) {}

  async execute(input: {
    name: string;
    message: string;
    ipHash: string;
  }): Promise<Confession> {
    const { name, message, ipHash } = input;

    if (!message || message.length < 3) {
      throw new Error("Message too short");
    }

    const lower = message.toLowerCase();
    if (BAD_WORDS.some(w => lower.includes(w))) {
      throw new Error("Message contains prohibited words");
    }

    const hasLink = /https?:\/\/|www\.|@/.test(message);
    const status = hasLink ? "PENDING" : "APPROVED";

    const confession = await this.confessionRepository.create({
      name: name || null,
      message,
      ipHash,
      status,
    });

    broadcast({ type: "created", item: confession });

    return confession;
  }
}
