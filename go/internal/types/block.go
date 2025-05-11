// internal/types/block.go
package types

import "time"

type Block struct {
	Number     int64     `bson:"number"`
	Hash       string    `bson:"hash"`
	ParentHash string    `bson:"parentHash"`
	Timestamp  time.Time `bson:"timestamp"`
	Miner      string    `bson:"miner"`
	GasUsed    uint64    `bson:"gasUsed"`
	GasLimit   uint64    `bson:"gasLimit"`
	BaseFee    uint64    `bson:"baseFee,omitempty"`
	Difficulty string    `bson:"difficulty"`
	Size       uint64    `bson:"size"`
	TxCount    int       `bson:"txCount"`
	Uncles     []string  `bson:"uncles"`
	ExtraData  []byte    `bson:"extraData"`
}
