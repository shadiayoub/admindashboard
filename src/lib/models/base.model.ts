// lib/models/base.model.ts
import { Db, InsertOneResult, WithId, Filter, UpdateFilter } from 'mongodb'

export abstract class BaseModel<T> {
  static collectionName: string;
  
  constructor(protected db: Db) {}
  
  async insert(data: Omit<T, '_id'>): Promise<InsertOneResult<T>> {
    return this.db.collection<T>(this.constructor.collectionName).insertOne(data as T);
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    return this.db.collection<T>(this.constructor.collectionName).findOne(filter);
  }

  async updateOne(filter: Filter<T>, update: UpdateFilter<T>) {
    return this.db.collection<T>(this.constructor.collectionName).updateOne(filter, update);
  }

  // Add more methods as needed (delete, aggregate, etc.)
}
