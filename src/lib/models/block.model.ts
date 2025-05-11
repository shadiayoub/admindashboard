// lib/models/block.model.ts
import { BaseModel } from './base.model';
import { Block } from '../../types/db-types';

export class BlockModel extends BaseModel<Block> {
  static collectionName = 'blocks';

  async getLatest(limit = 10): Promise<Block[]> {
    return this.db.collection<Block>(BlockModel.collectionName)
      .find()
      .sort({ number: -1 })
      .limit(limit)
      .toArray();
  }

  async getByNumber(blockNumber: number): Promise<Block | null> {
    return this.findOne({ number: blockNumber });
  }
}
