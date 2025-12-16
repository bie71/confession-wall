import { Context } from "hono";
import { listUsers, updateUser, deleteUser } from "../container";

export const listUsersController = async (c: Context) => {
  try {
    const url = new URL(c.req.url);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");
    const users = await listUsers.execute({ page, limit });
    return c.json(users);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const updateUserController = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    await updateUser.execute(id, body);
    return c.body(null, 204);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const deleteUserController = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    await deleteUser.execute(id);
    return c.body(null, 204);
  } catch (error: any) {
    return c.json({ error: error.message }, 404);
  }
};
