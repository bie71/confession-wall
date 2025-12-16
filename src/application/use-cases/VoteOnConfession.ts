import { IConfessionRepository } from "../../domain/repositories/ConfessionRepository";
import { IVoteRepository } from "../../domain/repositories/VoteRepository";
import { Confession } from "../../domain/entities/Confession";
import { broadcast } from "../../infrastructure/websocket";
import { BusinessError } from "../../domain/errors/AppError";

export class VoteOnConfession {
  constructor(
    private confessionRepository: IConfessionRepository,
    private voteRepository: IVoteRepository
  ) {}

  async execute(input: {
    confessionId: number;
    value: 1 | -1;
    ipHash: string;
  }): Promise<Confession> {
    const { confessionId, value, ipHash } = input;

    const existingVote = await this.voteRepository.findByConfessionAndIp(confessionId, ipHash);
    if (existingVote) {
      throw new BusinessError("You already voted");
    }
    
    await this.voteRepository.create({
      confessionId,
      ipHash,
      value,
    });

    const updatedConfession = await this.confessionRepository.update(confessionId, {
        [value === 1 ? 'likes' : 'dislikes']: 1
    });

    if (!updatedConfession) {
      throw new BusinessError("Confession not found");
    }

    broadcast({ type: "voted", item: updatedConfession });
    return updatedConfession;
  }
}
