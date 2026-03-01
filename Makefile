.DEFAULT_GOAL := help

.PHONY: help db-reset migrations-sync

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

db-reset: ## Tear down stack and delete local pb_data (irreversible)
	@read -p "This will permanently delete pb_data. Continue? [y/N] " confirm && [ "$${confirm}" = "y" ] || (echo "Aborted." && exit 1)
	docker compose down
	rm -rf pocketbase/pb_data
	@echo "Done. Run 'docker compose up' to start fresh."

migrations-sync: ## Sync migration history after deleting migration files
	docker compose exec pocketbase /pb/pocketbase migrate history-sync
