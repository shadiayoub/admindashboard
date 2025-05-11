# go/Makefile
.PHONY: run
run:
	go run ./fetchers/blocks.go

.PHONY: build
build:
	go build -o bin/fetcher ./fetchers/blocks.go

.PHONY: test-env
test-env:
	@echo "RPC_URL: $(shell go run ./core/env.go -test)"

.PHONY: testenv
testenv:
	cd cmd/testenv && go run main.go
