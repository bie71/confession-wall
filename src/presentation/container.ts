// Infrastructure
import { DrizzleConfessionRepository } from "../infrastructure/database/DrizzleConfessionRepository";
import { DrizzleVoteRepository } from "../infrastructure/database/DrizzleVoteRepository";

// Application
import { CreateConfession } from "../application/use-cases/CreateConfession";
import { ListConfessions } from "../application/use-cases/ListConfessions";
import { VoteOnConfession } from "../application/use-cases/VoteOnConfession";
import { ApproveConfession } from "../application/use-cases/ApproveConfession";
import { RejectConfession } from "../application/use-cases/RejectConfession";
import { DeleteConfession } from "../application/use-cases/DeleteConfession";
import { ExportConfessions } from "../application/use-cases/ExportConfessions";

// Repositories
const confessionRepository = new DrizzleConfessionRepository();
const voteRepository = new DrizzleVoteRepository();

// Use Cases
export const createConfession = new CreateConfession(confessionRepository);
export const listConfessions = new ListConfessions(confessionRepository);
export const voteOnConfession = new VoteOnConfession(confessionRepository, voteRepository);
export const approveConfession = new ApproveConfession(confessionRepository);
export const rejectConfession = new RejectConfession(confessionRepository);
export const deleteConfession = new DeleteConfession(confessionRepository);
export const exportConfessions = new ExportConfessions(confessionRepository);
