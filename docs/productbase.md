# ProductBase

This file is intended to help AI Coding Agents know important information about ProductBase which is referring to this product starter template built on Pocketbase.

This doc will cover developer or code specific ProductBase information. For general information about ProductBase, see the [README.md](../README.md) file.

## ProductBase Purpose

ProductBase is a collection of features commonly included when building a new software product. The latest set of implemented features can be found in the README.md file.

Additional specific feature documentation:
- Information on **organizations** can be found in [organizations.md](./organizations.md)
- Information on **memberships** can be found in [memberships.md](./memberships.md)
- Information on **users** can be found in [users.md](./users.md)
- Information on **migrations** can be found in [migrations.md](./migrations.md)
- Information on **hooks** can be found in [hooks.md](./hooks.md)
- Information on **querying** can be found in [querying.md](./querying.md)
- Information on **collections** can be found in [collections.md](./collections.md)
- Information on **access & permissions** can be found in [access-permissions.md](./access-permissions.md)

## ProductBase Settings Collection

The project uses a singleton collection `_productbase_settings` for ProductBase feature configuration. The latest schema values can be determined by parsing the migration files.

Any changes in the schema for the collection should increase the `_schema_version` property on the settings. Increase by one whole number.