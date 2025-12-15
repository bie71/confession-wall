import { IConfessionRepository } from "../../domain/repositories/ConfessionRepository";
import { Confession } from "../../domain/entities/Confession";
import { broadcast } from "../../infrastructure/websocket";
import { generateEmbedding } from "../../infrastructure/ai/embedding";
import logger from "../../infrastructure/logger";

// Naive bad-words list (can be moved to a more robust service)
const BAD_WORDS = ["bangsat", "anjing", "goblok"];

export class CreateConfession {
  constructor(private confessionRepository: IConfessionRepository) {}

  async execute(input: {
    name: string;
    message: string;
    ipHash: string;
    userId?: number;
  }): Promise<Confession> {
    const { name, message, ipHash, userId } = input;

    if (!message || message.length < 3) {
      throw new Error("Message too short");
    }

    const lower = message.toLowerCase();
    if (BAD_WORDS.some(w => lower.includes(w))) {
      throw new Error("Message contains prohibited words");
    }

    // Generate embedding and check for duplicates
    logger.debug('Generating embedding for new confession...');
    const embedding = await generateEmbedding(message);
    logger.debug('Checking for similar confessions...');
    const similarPost = await this.confessionRepository.findSimilarByEmbedding(embedding);
    
    if (similarPost) {
      logger.warn({ similarPostId: similarPost.id }, 'Duplicate post detected.');
      throw new Error("This confession is too similar to a recent post.");
    }

    const hasLink = /https?:\/\/|www\.|@/.test(message);
    const status = hasLink ? "PENDING" : "APPROVED";

    const confession = await this.confessionRepository.create({
      name: name || null,
      message,
      ipHash,
      status,
      embedding,
      userId: userId ?? null,
    });

    broadcast({ type: "created", item: confession });

    return confession;
  }
}
