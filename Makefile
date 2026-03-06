.DEFAULT_GOAL := help
SHELL := /bin/bash

.PHONY: help db-reset migrations-sync collections-sync seed-collection

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

db-reset: ## Tear down stack and delete local pb_data (irreversible)
	@read -p "This will permanently delete pb_data. Continue? [y/N] " confirm && [ "$${confirm}" = "y" ] || (echo "Aborted." && exit 1)
	docker compose down
	rm -rf pocketbase/pb_data
	@echo "Done. Run 'docker compose up' to start fresh."

migrations-sync: ## Sync migration history after deleting migration files
	docker compose exec pocketbase /pb/pocketbase migrate history-sync

collections-sync: ## Snapshot collections schema, generate TypeScript types, and remove migration
	@BEFORE=$$(ls pocketbase/pb_migrations/*.js 2>/dev/null | sort); \
	echo "y" | docker compose exec -T pocketbase /pb/pocketbase migrate collections; \
	AFTER=$$(ls pocketbase/pb_migrations/*.js 2>/dev/null | sort); \
	NEW_FILE=$$(comm -13 <(echo "$$BEFORE") <(echo "$$AFTER")); \
	if [ -z "$$NEW_FILE" ]; then echo "No new migration file created." && exit 1; fi; \
	npm run --prefix frontend generate-pb-types -- $$NEW_FILE; \
	rm $$NEW_FILE; \
	echo "✓ Deleted migration: $$NEW_FILE"

seed-collection: ## Seed a PocketBase collection with fake data (COLLECTION=name COUNT=1)
	@[ "$(COLLECTION)" ] || (echo "Error: COLLECTION is required. Usage: make seed-collection COLLECTION=<name> [COUNT=1]" && exit 1)
	cd frontend && COLLECTION=$(COLLECTION) COUNT=$(COUNT) node tasks/seed-collection.mjs
