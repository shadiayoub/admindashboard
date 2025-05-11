// scripts/blockListener.ts
import { createPublicClient, webSocket } from 'viem';
import { mainnet } from 'viem/chains';
import dotenv from 'dotenv';
import { setTimeout } from 'timers/promises';
import { readSyncState, writeSyncState } from './syncState';
import mongoose from 'mongoose';
import { connectDB, getBlockModel, getTransactionModel, getContractModel, getTokenTransferModel } from '@/lib/db.server';

dotenv.config({ path: './.env' });

const WS_RPC_URL = process.env.WS_RPC_URL!;
const MONGO_URI = process.env.MONGO_URI!;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'Chaynops';
const POLLING_INTERVAL = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

if (!WS_RPC_URL) throw new Error('Missing WS_RPC_URL in .env');

const client = createPublicClient({
  chain: { ...mainnet, id: 336699, name: 'Route07Testnet' },
  transport: webSocket(WS_RPC_URL),
});

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    console.warn(`Retrying (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}) after error:`, err);
    await setTimeout(RETRY_DELAY);
    return withRetry(fn, retries - 1);
  }
}

async function processBlock(blockNumber: number) {
  // Get Mongoose models
  const BlockModel = getBlockModel();
  const TransactionModel = getTransactionModel();
  const ContractModel = getContractModel();
  const TokenTransferModel = getTokenTransferModel();

  // 1) Fetch the block (header only)
  const block = await withRetry(() =>
    client.getBlock({ blockNumber, includeTransactions: false })
  );

  const blockDoc = {
    number:              Number(block.number),
    hash:                block.hash,
    parent_hash:         block.parentHash,
    miner:               block.miner,
    timestamp:           Number(block.timestamp),
    gas_limit:           block.gasLimit.toString(),
    gas_used:            block.gasUsed.toString(),
    tx_count:            block.transactions.length,
    base_fee_per_gas:    block.baseFeePerGas?.toString() || null,
    difficulty:          block.difficulty.toString(),
  };

  await BlockModel.updateOne(
    { number: blockDoc.number },
    { $set: blockDoc },
    { upsert: true }
  );

  if (block.transactions.length === 0) {
    console.log(`✅ Processed block ${blockDoc.number} (0 txs)`);
    return;
  }

  // 2) Fetch txs and receipts
  const txHashes = block.transactions;
  const txs = await Promise.all(txHashes.map(h => client.getTransaction({ hash: h })));
  const receipts = await Promise.all(txHashes.map(h => client.getTransactionReceipt({ hash: h }).catch(() => null)));

  // 3) Detect contract creations
  const creations = txs
    .map((tx, i) => ({ tx, receipt: receipts[i] }))
    .filter(({ receipt }) => receipt && !receipt.to);

  if (creations.length > 0) {
    const contractDocs = creations.map(({ tx, receipt }) => ({
      address:     receipt!.contractAddress!,
      creator:     tx.from,
      blockNumber: blockDoc.number,
      txHash:      tx.hash,
      timestamp:   blockDoc.timestamp,
      bytecode:    '',
    }));
    try {
      await ContractModel.insertMany(contractDocs);
    } catch (err) {
      console.error('Failed to insert contracts:', err);
    }
  }

  // 4) Store normal transactions
  const txDocs = txs.map((tx, i) => ({
    hash:                     tx.hash,
    block_number:             blockDoc.number,
    from_address:             tx.from,
    to_address:               tx.to || null,
    value:                    tx.value.toString(),
    gas:                      tx.gas.toString(),
    gas_price:                tx.gasPrice?.toString() || null,
    max_fee_per_gas:          tx.maxFeePerGas?.toString() || null,
    max_priority_fee_per_gas: tx.maxPriorityFeePerGas?.toString() || null,
    input:                    tx.input,
    status:                   receipts[i]?.status ?? null,
  }));

  if (txDocs.length > 0) {
    try {
      await TransactionModel.insertMany(txDocs, { ordered: false });
    } catch (err) {
      console.error('Failed to insert transactions:', err);
    }
  }

  // 5) Parse logs for ERC20 token transfers
  const tokenTransfers: any[] = [];

  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    if (!receipt || !receipt.logs?.length) continue;

    console.log(`🔍 Logs in tx ${receipt.transactionHash}:`, receipt.logs);

    for (const log of receipt.logs) {
      const isTransfer =
        log.topics?.[0] ===
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

      if (isTransfer && log.topics.length === 3) {
        const from = `0x${log.topics[1].slice(26)}`;
        const to = `0x${log.topics[2].slice(26)}`;
        const value = BigInt(log.data).toString();

        tokenTransfers.push({
          txHash: receipt.transactionHash,
          tokenAddress: log.address,
          from,
          to,
          value,
          blockNumber: Number(block.number),
          timestamp: Number(block.timestamp),
        });
      }
    }
  }

   if (tokenTransfers.length > 0) {
      console.log('📦 Token transfers detected:', tokenTransfers);
      await TokenTransferModel.insertMany(tokenTransfers, { ordered: false }).catch((err) => {
        console.error('❌ Failed to insert token transfers:', err);
      });
      console.log(`🟢 Inserted ${tokenTransfers.length} token transfers`);
    } else {
      console.log(`🔍 No token transfers in block ${blockDoc.number}`);
    }


  console.log(`✅ Processed block ${blockDoc.number} (${blockDoc.tx_count} txs)`);
}

async function main() {
  // Connect to MongoDB using Mongoose
  await mongoose.connect(MONGO_URI, {
    dbName: MONGO_DB_NAME
  });
  console.log('✅ Connected to MongoDB using Mongoose');

  const BlockModel = getBlockModel();

  let { lastSyncedBlock } = await readSyncState();

  const lastInDb = await BlockModel.findOne().sort({ number: -1 }).limit(1);
  if (lastInDb?.number > lastSyncedBlock) {
    lastSyncedBlock = lastInDb.number;
  }

  console.log(`🔄 Catch‑up from block #${lastSyncedBlock + 1}`);
  const chainHead = await client.getBlockNumber();

  for (let bn = lastSyncedBlock + 1; bn <= chainHead; bn++) {
    try {
      await processBlock(bn);
      lastSyncedBlock = bn;
      await writeSyncState({ lastSyncedBlock });
    } catch (err) {
      console.error(`❌ Catch‑up failed at block ${bn}:`, err);
      break;
    }
  }

  console.log('✅ Caught up. Now listening in real‑time.');

  client.watchBlockNumber({
    emitOnBegin: true,
    pollingInterval: POLLING_INTERVAL,
    onBlockNumber: async (blockNumber) => {
      try {
        await processBlock(blockNumber);
        lastSyncedBlock = blockNumber;
        await writeSyncState({ lastSyncedBlock });
      } catch (err) {
        console.error('❌ Error processing block:', err);
      }
    },
    onError: (err) => console.error('WebSocket Error:', err),
  });

  process.on('SIGINT', async () => {
    console.log('🛑 Shutting down...');
    await mongoose.disconnect();
    process.exit(0);
  });
}

main().catch(err => {
  console.error('Fatal listener error:', err);
  process.exit(1);
});