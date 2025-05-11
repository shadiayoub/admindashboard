#!/bin/bash
# cd $(dirname "$0")

export $(grep -E '^(RPC_URL|MONGO_URI)=' ../.env | xargs)
go run ./cmd/fetcher
