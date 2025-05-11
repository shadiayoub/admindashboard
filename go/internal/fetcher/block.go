// internal/fetcher/block.go
package fetcher

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"time"

	ethtypes "github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"chaynops/internal/types"
)

type Config struct {
	StartBlock   *int64        // Nil for auto-resume
	PollInterval time.Duration
	BatchSize    int64
}

const (
	defaultBatchSize    = 100
	defaultPollInterval = 12 * time.Second
	maxRetryAttempts    = 3
	retryBackoffBase    = 1 * time.Second
)

func NewDefaultConfig() Config {
	return Config{
		PollInterval: defaultPollInterval,
		BatchSize:    defaultBatchSize,
	}
}

func Run(ctx context.Context, client *ethclient.Client, db *mongo.Database, cfg Config) error {
	// Validate inputs
	if client == nil {
		return fmt.Errorf("ethereum client cannot be nil")
	}
	if db == nil {
		return fmt.Errorf("database cannot be nil")
	}

	collection := db.Collection("blocks")

	// Get reliable latest block
	latest, err := getVerifiedBlockNumber(ctx, client)
	if err != nil {
		return fmt.Errorf("failed to get latest block: %w", err)
	}

	// Determine safe starting point
	start, err := determineStartBlock(ctx, collection, cfg.StartBlock, latest)
	if err != nil {
		return fmt.Errorf("failed to determine start block: %w", err)
	}

	log.Printf("Starting sync from block %d (latest: %d)", start, latest)

	// Historical sync
	if start <= latest {
		if err := syncHistoricalBlocks(ctx, client, collection, start, latest, cfg.BatchSize); err != nil {
			return fmt.Errorf("historical sync failed: %w", err)
		}
	}

	// Real-time sync
	return syncLiveBlocks(ctx, client, collection, cfg.PollInterval)
}

func syncHistoricalBlocks(ctx context.Context, client *ethclient.Client, coll *mongo.Collection, start, end, batchSize int64) error {
	for blockNum := start; blockNum <= end; blockNum++ {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
			block, err := fetchBlockWithRetry(ctx, client, blockNum)
			if err != nil {
				log.Printf("Skipping block %d after retries: %v", blockNum, err)
				continue
			}

			if err := saveBlock(ctx, coll, block); err != nil {
				return fmt.Errorf("failed to save block %d: %w", blockNum, err)
			}

			if blockNum%100 == 0 || blockNum == end {
				log.Printf("Processed block %d/%d (%.1f%%)", blockNum, end, float64(blockNum)*100/float64(end))
			}
		}
	}
	return nil
}

func syncLiveBlocks(ctx context.Context, client *ethclient.Client, coll *mongo.Collection, interval time.Duration) error {
	var lastSynced int64 = -1
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			header, err := client.HeaderByNumber(ctx, nil)
			if err != nil {
				log.Printf("Failed to get latest header: %v", err)
				continue
			}

			current := header.Number.Int64()
			if current <= lastSynced {
				continue
			}

			block, err := fetchBlockWithRetry(ctx, client, current)
			if err != nil {
				log.Printf("Failed to fetch block %d: %v", current, err)
				continue
			}

			if err := saveBlock(ctx, coll, block); err != nil {
				log.Printf("Failed to save block %d: %v", current, err)
				continue
			}

			lastSynced = current
			log.Printf("Saved new block %d (%d txs)", current, len(block.Transactions()))
		}
	}
}

// Helper functions...

func getVerifiedBlockNumber(ctx context.Context, client *ethclient.Client) (int64, error) {
	for i := 0; i < maxRetryAttempts; i++ {
		header, err := client.HeaderByNumber(ctx, nil)
		if err == nil {
			return header.Number.Int64(), nil
		}
		time.Sleep(time.Duration(i+1) * retryBackoffBase)
	}
	return 0, fmt.Errorf("failed to get verified block number after %d attempts", maxRetryAttempts)
}

func determineStartBlock(ctx context.Context, coll *mongo.Collection, override *int64, latest int64) (int64, error) {
	if override != nil {
		return max(0, min(*override, latest)), nil
	}

	var lastBlock types.Block
	err := coll.FindOne(ctx, bson.M{}, options.FindOne().SetSort(bson.M{"number": -1})).Decode(&lastBlock)

	switch {
	case err == mongo.ErrNoDocuments:
		return max(0, latest-1000), nil // Default to last 1000 blocks
	case err != nil:
		return 0, fmt.Errorf("failed to query last block: %w", err)
	default:
		return min(lastBlock.Number+1, latest), nil
	}
}

func fetchBlockWithRetry(ctx context.Context, client *ethclient.Client, blockNum int64) (*ethtypes.Block, error) {
	for attempt := 0; attempt < maxRetryAttempts; attempt++ {
		block, err := client.BlockByNumber(ctx, big.NewInt(blockNum))
		if err == nil {
			return block, nil
		}
		time.Sleep(time.Duration(attempt+1) * retryBackoffBase)
	}
	return nil, fmt.Errorf("failed after %d retries", maxRetryAttempts)
}

func saveBlock(ctx context.Context, coll *mongo.Collection, block *ethtypes.Block) error {
	doc := types.Block{
		Number:     block.Number().Int64(),
		Hash:       block.Hash().Hex(),
		ParentHash: block.ParentHash().Hex(),
		Timestamp:  time.Unix(int64(block.Time()), 0),
		Miner:      block.Coinbase().Hex(),
		GasUsed:    block.GasUsed(),
		GasLimit:   block.GasLimit(),
		Difficulty: block.Difficulty().String(),
		Size:       block.Size(),
		TxCount:    len(block.Transactions()),
		ExtraData:  block.Extra(),
		Uncles:     make([]string, 0, len(block.Uncles())),
	}

	if baseFee := block.BaseFee(); baseFee != nil {
		doc.BaseFee = baseFee.Uint64()
	}

	for _, uncle := range block.Uncles() {
		doc.Uncles = append(doc.Uncles, uncle.Hash().Hex())
	}

	_, err := coll.UpdateOne(
		ctx,
		bson.M{"number": doc.Number},
		bson.M{"$set": doc},
		options.Update().SetUpsert(true),
	)
	return err
}

func max(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}

func min(a, b int64) int64 {
	if a < b {
		return a
	}
	return b
}
