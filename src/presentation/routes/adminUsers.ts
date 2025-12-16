import { Hono } from "hono";
import {
  listUsersController,
  updateUserController,
  deleteUserController,
} from "../controllers/UserController";

const usersAdmin = new Hono();

usersAdmin.get("/users", listUsersController);
usersAdmin.put("/users/:id", updateUserController);
usersAdmin.delete("/users/:id", deleteUserController);

export default usersAdmin;
