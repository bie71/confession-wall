// Infrastructure
import { DrizzleConfessionRepository } from "../infrastructure/database/DrizzleConfessionRepository";
import { DrizzleVoteRepository } from "../infrastructure/database/DrizzleVoteRepository";
import { DrizzleUserRepository } from "../infrastructure/database/DrizzleUserRepository";
import { DrizzleBadWordRepository } from "../infrastructure/database/DrizzleBadWordRepository";

// Application
import { CreateConfession } from "../application/use-cases/CreateConfession";
import { ListConfessions } from "../application/use-cases/ListConfessions";
import { VoteOnConfession } from "../application/use-cases/VoteOnConfession";
import { ApproveConfession } from "../application/use-cases/ApproveConfession";
import { RejectConfession } from "../application/use-cases/RejectConfession";
import { DeleteConfession } from "../application/use-cases/DeleteConfession";
import { ExportConfessions } from "../application/use-cases/ExportConfessions";
import { RegisterUser } from "../application/use-cases/RegisterUser";
import { LoginUser } from "../application/use-cases/LoginUser";
import { ListBadWords } from "../application/use-cases/ListBadWords";
import { AddBadWord } from "../application/use-cases/AddBadWord";
import { UpdateBadWord } from "../application/use-cases/UpdateBadWord";
import { DeleteBadWord } from "../application/use-cases/DeleteBadWord";
import { ListUsers } from '../application/use-cases/ListUsers';
import { UpdateUser } from '../application/use-cases/UpdateUser';
import { DeleteUser } from '../application/use-cases/DeleteUser';

// Repositories
const confessionRepository = new DrizzleConfessionRepository();
const voteRepository = new DrizzleVoteRepository();
const userRepository = new DrizzleUserRepository();
const badWordRepository = new DrizzleBadWordRepository();

// Use Cases
export const createConfession = new CreateConfession(confessionRepository, badWordRepository);
export const listConfessions = new ListConfessions(confessionRepository);
export const voteOnConfession = new VoteOnConfession(confessionRepository, voteRepository);
export const approveConfession = new ApproveConfession(confessionRepository);
export const rejectConfession = new RejectConfession(confessionRepository);
export const deleteConfession = new DeleteConfession(confessionRepository);
export const exportConfessions = new ExportConfessions(confessionRepository);
export const registerUser = new RegisterUser(userRepository);
export const loginUser = new LoginUser(userRepository);
export const listBadWords = new ListBadWords(badWordRepository);
export const addBadWord = new AddBadWord(badWordRepository);
export const updateBadWord = new UpdateBadWord(badWordRepository);
export const deleteBadWord = new DeleteBadWord(badWordRepository);
export const listUsers = new ListUsers(userRepository);
export const updateUser = new UpdateUser(userRepository);
export const deleteUser = new DeleteUser(userRepository);
