import { Context } from "hono";
import { listBadWords, addBadWord, updateBadWord, deleteBadWord } from "../container";

export const listBadWordsController = async (c: Context) => {
  try {
    const words = await listBadWords.execute();
    return c.json(words);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const addBadWordController = async (c: Context) => {
  try {
    const { word } = await c.req.json();
    if (!word) {
      return c.json({ error: "Word is required" }, 400);
    }
    const newWord = await addBadWord.execute(word);
    return c.json(newWord, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const updateBadWordController = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    const { word } = await c.req.json();
    if (!word) {
      return c.json({ error: "Word is required" }, 400);
    }
    await updateBadWord.execute(id, word);
    return c.body(null, 204);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const deleteBadWordController = async (c: Context) => {
  try {
    const id = parseInt(c.req.param('id'));
    await deleteBadWord.execute(id);
    return c.body(null, 204);
  } catch (error: any) {
    return c.json({ error: error.message }, 404);
  }
};
