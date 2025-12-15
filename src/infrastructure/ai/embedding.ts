import { pipeline, Pipeline } from '@xenova/transformers';
import logger from '../logger';

class EmbeddingPipeline {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: Pipeline | null = null;

  static async getInstance(progress_callback?: Function) {
    if (this.instance === null) {
      logger.info('Initializing embedding model... This may take a moment.');
      this.instance = await pipeline(this.task, this.model, { progress_callback });
      logger.info('Embedding model initialized.');
    }
    return this.instance;
  }
}

export const generateEmbedding = async (text: string): Promise<number[]> => {
  const extractor = await EmbeddingPipeline.getInstance();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  // Convert the Tensor into a normal array
  return Array.from(output.data);
};
