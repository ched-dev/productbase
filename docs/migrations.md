# Migrations

This file is intended to help AI Coding Agents know important information about writing and using migrations in Pocketbase.

## Important Tips

Imports do not work in migration files.

## Delete Database and start from base migrations

Delete the data inside the `./pocketbase/pb_data` folder. Run Docker again and it will recreate the data in the folder.
```sh
rm -rf ./pocketbase/pb_data
docker compose up
```

## Remove unwanted migrations

If you've made changes and have since manually reverted them so the migrations no longer apply, you can use the following to reset your migrations table to the proper state. Ex: You added a field to a schema, then later on removed it because you changed your mind.

First, delete any unwanted migrations from `pocketbase/pb_migrations/*.js`. You should only deleted uncommitted migrations. If they were committed, the auto-deployment may have already run the migration.

Then, run the following:
```sh
docker ps
# find the CONTAINER ID (Ex: 41fdf49fb7cd) for productbase_pocketbase
docker exec -it CONTAINER_ID /pb/pocketbase migrate history-sync
```

The `docker exec` command will remove any entry from the `_migrations` table that doesn't have a related migration file associated with it.