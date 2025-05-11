// syncState.ts
import fs from 'fs/promises';
import path from 'path';

const SYNC_STATE_FILE = path.join(process.cwd(), 'sync-state.json');

interface SyncState {
  lastSyncedBlock: number;
  [key: string]: unknown;
}

/**
 * Reads the current sync state from the state file
 */
export async function readSyncState(): Promise<SyncState> {
  try {
    const data = await fs.readFile(SYNC_STATE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default state if file doesn't exist or is invalid
    return { lastSyncedBlock: 0 };
  }
}

/**
 * Writes the sync state to the state file, safely handling BigInt conversion
 */
export async function writeSyncState(state: SyncState): Promise<void> {
  // Create a replacer function to handle BigInt serialization
  const replacer = (key: string, value: any) => {
    // Convert BigInt to string
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };

  // Serialize with the custom replacer
  const serialized = JSON.stringify(state, replacer, 2);

  // Write to file atomically by writing to temp file first
  const tempFile = `${SYNC_STATE_FILE}.tmp`;
  await fs.writeFile(tempFile, serialized, 'utf-8');
  await fs.rename(tempFile, SYNC_STATE_FILE);
}