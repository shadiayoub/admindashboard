// scripts/indexTokens.ts
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI!;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'Chaynops';
const RPC_URL = process.env.NEXT_PUBLIC_NODE_1!;
if (!MONGO_URI || !RPC_URL) throw new Error('Missing Mongo or RPC env');

const ERC20_ABI = [
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
];

const client = createPublicClient({
  chain: { ...mainnet, id: 336699, name: 'Route07Testnet' },
  transport: http(RPC_URL),
});

async function fetchTokenMeta(address: `0x${string}`) {
  try {
    const [name, symbol, decimals] = await Promise.all([
      client.readContract({ address, abi: ERC20_ABI, functionName: 'name' }),
      client.readContract({ address, abi: ERC20_ABI, functionName: 'symbol' }),
      client.readContract({ address, abi: ERC20_ABI, functionName: 'decimals' }),
    ]);
    return { address, name, symbol, decimals: Number(decimals) };
  } catch (err) {
    console.warn(`⚠️ Failed to fetch metadata for ${address}:`, err);
    return null;
  }
}

async function main() {
  const mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
  const db = mongo.db(MONGO_DB_NAME);

  const seenTokens = await db.collection('tokens').distinct('address');
  const tokenAddresses = await db.collection('tokentransfers').distinct('tokenAddress');

  const unseen = tokenAddresses.filter((addr) => !seenTokens.includes(addr));
  console.log(`🔍 ${unseen.length} new token(s) to index`);

  for (const address of unseen) {
    const meta = await fetchTokenMeta(address as `0x${string}`);
    if (meta) {
      await db.collection('tokens').insertOne(meta);
      console.log(`✅ Indexed ${meta.symbol} (${meta.address})`);
    }
  }

  await mongo.close();
  console.log('🎉 Token indexing complete');
}

main().catch((err) => {
  console.error('❌ Indexing error:', err);
  process.exit(1);
});
