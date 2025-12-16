import { Hono } from "hono";
import {
  listBadWordsController,
  addBadWordController,
  updateBadWordController,
  deleteBadWordController,
} from "../controllers/BadWordController";

const badWordsAdmin = new Hono();

badWordsAdmin.get("/bad-words", listBadWordsController);
badWordsAdmin.post("/bad-words", addBadWordController);
badWordsAdmin.put("/bad-words/:id", updateBadWordController);
badWordsAdmin.delete("/bad-words/:id", deleteBadWordController);

export default badWordsAdmin;
