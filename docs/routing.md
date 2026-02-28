# Routing

This file is intended to help AI Coding Agents know important information about writing hooks in Pocketbase.

## Important Notes

When implementing new features that require new pages, create dedicated URLs for each action. Here's some examples I would prefer:
- Create will be at `*/new`
- View will be at `*/:id`
- Update will be at `*/:id/edit`
- Delete will be a prompt or modal for confirming action
- Nested relations can follow the same pattern
- Action URLs should follow the pattern `*/:id/:action`