import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { AddBadWord } from './AddBadWord';
import { DeleteBadWord } from './DeleteBadWord';
import { ListBadWords } from './ListBadWords';
import { UpdateBadWord } from './UpdateBadWord';
import { BadWordRepository } from '../../domain/repositories/BadWordRepository';
import { BadWord } from '../../domain/entities/BadWord';
import { BusinessError } from '../../domain/errors/AppError';

const mockBadWordRepository: BadWordRepository = {
  getAll: mock(async () => [new BadWord(1, 'test', new Date())]),
  add: mock(async (word) => new BadWord(2, word, new Date())),
  findById: mock(async (id) => id === 1 ? new BadWord(1, 'test', new Date()) : null),
  findByWord: mock(async (word) => word === 'test' ? new BadWord(1, 'test', new Date()) : null),
  update: mock(async () => {}),
  delete: mock(async () => {}),
};

describe('Bad Word Use Cases', () => {
  const listBadWords = new ListBadWords(mockBadWordRepository);
  const addBadWord = new AddBadWord(mockBadWordRepository);
  const updateBadWord = new UpdateBadWord(mockBadWordRepository);
  const deleteBadWord = new DeleteBadWord(mockBadWordRepository);

  beforeEach(() => {
    mockBadWordRepository.getAll.mockClear();
    mockBadWordRepository.add.mockClear();
    mockBadWordRepository.findById.mockClear();
    mockBadWordRepository.findByWord.mockClear();
    mockBadWordRepository.update.mockClear();
    mockBadWordRepository.delete.mockClear();
  });

  // ListBadWords
  it('List: should return all bad words', async () => {
    const result = await listBadWords.execute();
    expect(result).toHaveLength(1);
    expect(result[0].word).toBe('test');
    expect(mockBadWordRepository.getAll).toHaveBeenCalledTimes(1);
  });

  // AddBadWord
  it('Add: should add a new word', async () => {
    mockBadWordRepository.findByWord.mockResolvedValueOnce(null);
    const newWord = 'newword';
    const result = await addBadWord.execute(newWord);
    expect(result.word).toBe(newWord);
    expect(mockBadWordRepository.add).toHaveBeenCalledWith(newWord);
  });

  it('Add: should throw an error if word already exists', async () => {
    const existingWord = 'test';
    await expect(addBadWord.execute(existingWord)).rejects.toThrow(new BusinessError('Word already exists'));
  });

  // UpdateBadWord
  it('Update: should update a word', async () => {
    const updatedWord = 'updated';
    mockBadWordRepository.findByWord.mockResolvedValueOnce(null);
    await updateBadWord.execute(1, updatedWord);
    expect(mockBadWordRepository.update).toHaveBeenCalledWith(1, updatedWord);
  });

  it('Update: should throw if word to update does not exist', async () => {
    mockBadWordRepository.findById.mockResolvedValueOnce(null);
    await expect(updateBadWord.execute(99, 'any')).rejects.toThrow(new BusinessError('Word not found'));
  });

  it('Update: should throw if new word name already exists', async () => {
    mockBadWordRepository.findByWord.mockResolvedValueOnce(new BadWord(2, 'new', new Date()));
    await expect(updateBadWord.execute(1, 'new')).rejects.toThrow(new BusinessError('New word already exists'));
  });
  
  // DeleteBadWord
  it('Delete: should delete a word', async () => {
    await deleteBadWord.execute(1);
    expect(mockBadWordRepository.delete).toHaveBeenCalledWith(1);
  });

  it('Delete: should throw if word to delete does not exist', async () => {
    mockBadWordRepository.findById.mockResolvedValueOnce(null);
    await expect(deleteBadWord.execute(99)).rejects.toThrow(new BusinessError('Word not found'));
  });
});
