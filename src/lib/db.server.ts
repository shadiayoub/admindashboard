// lib/db.server.ts
import { Db, MongoClient } from 'mongodb';
import { BlockModel } from './models/block.model';

const client = new MongoClient(process.env.MONGODB_URI!);

class DBClient {
  private static instance: DBClient;
  private client: MongoClient;
  private _db: Db | null = null;

  private constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI!);
  }

  static getInstance() {
    if (!DBClient.instance) {
      DBClient.instance = new DBClient();
    }
    return DBClient.instance;
  }

  async connect() {
    if (!this._db) {
      await this.client.connect();
      this._db = this.client.db();
    }
    return this._db;
  }

  get blocks() {
    if (!this._db) throw new Error('Database not connected');
    return new BlockModel(this._db);
  }
}

export const db = DBClient.getInstance();
