// go/cmd/fetcher/main.go
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
	"fmt"

	"github.com/ethereum/go-ethereum/ethclient"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"chaynops/internal/fetcher"
)

type AppConfig struct {
	RPCURL       string
	MongoURI     string
	StartBlock   *int64        // Nil for auto-resume
	PollInterval time.Duration // 12s for Theta
	BatchSize    int64         // For historical sync
}

func main() {
	// Initialize with graceful shutdown
	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	// Load configuration
	cfg := loadConfig()
	
	// Setup clients
	ethClient, mongoClient := setupClients(ctx, cfg)
	defer cleanupClients(ctx, ethClient, mongoClient)

	// Run fetcher
	runFetcher(ctx, ethClient, mongoClient, cfg)
}

func loadConfig() AppConfig {
	cfg := AppConfig{
		RPCURL:       mustGetEnv("RPC_URL"),
		MongoURI:     mustGetEnv("MONGO_URI"),
		PollInterval: 12 * time.Second,
		BatchSize:    100,
	}

	// Optional start block override
	if startBlock := os.Getenv("START_BLOCK"); startBlock != "" {
		blockNum := mustParseInt64(startBlock)
		cfg.StartBlock = &blockNum
	}

	return cfg
}

func setupClients(ctx context.Context, cfg AppConfig) (*ethclient.Client, *mongo.Client) {
	ethClient, err := ethclient.DialContext(ctx, cfg.RPCURL)
	if err != nil {
		log.Fatalf("Ethereum connection failed: %v", err)
	}

	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatalf("MongoDB connection failed: %v", err)
	}

	if err := mongoClient.Ping(ctx, nil); err != nil {
		log.Fatalf("MongoDB ping failed: %v", err)
	}

	return ethClient, mongoClient
}

func cleanupClients(ctx context.Context, ethClient *ethclient.Client, mongoClient *mongo.Client) {
	if err := mongoClient.Disconnect(ctx); err != nil {
		log.Printf("MongoDB disconnect error: %v", err)
	}
	ethClient.Close()
}

func runFetcher(ctx context.Context, ethClient *ethclient.Client, mongoClient *mongo.Client, cfg AppConfig) {
	db := mongoClient.Database("chaynops")
	fetcherCfg := fetcher.Config{
		StartBlock:   cfg.StartBlock,
		PollInterval: cfg.PollInterval,
		BatchSize:    cfg.BatchSize,
	}

	log.Println("Starting block fetcher...")
	if err := fetcher.Run(ctx, ethClient, db, fetcherCfg); err != nil {
		log.Fatalf("Fetcher failed: %v", err)
	}
}

func mustGetEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("Missing required environment variable: %s", key)
	}
	return val
}

func mustParseInt64(s string) int64 {
	var n int64
	_, err := fmt.Sscanf(s, "%d", &n)
	if err != nil {
		log.Fatalf("Invalid number format: %s", s)
	}
	return n
}
