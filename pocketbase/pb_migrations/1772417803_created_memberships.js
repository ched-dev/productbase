/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "pbc_memberships",
    "indexes": [
      "CREATE UNIQUE INDEX idx_membership_user_org ON memberships (user, organization) WHERE user != ''"
    ],
    "name": "memberships",
    "system": false,
    "type": "base",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation_membership_user",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "user",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": true,
        "collectionId": "pbc_organizations",
        "hidden": false,
        "id": "relation_membership_org",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "organization",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_membership_role",
        "max": 20,
        "min": 1,
        "name": "role",
        "pattern": "",
        "presentable": true,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation_membership_invited_by",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "invited_by",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text_membership_invite_email",
        "max": 255,
        "min": 0,
        "name": "invite_email",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "createRule": 'organization.owner.id = @request.auth.id || (@request.auth.id != "" && organization.memberships_via_organization.user.id ?= @request.auth.id && organization.memberships_via_organization.role ?= "admin")',
    "listRule": 'user.id = @request.auth.id || organization.owner.id = @request.auth.id || (@request.auth.id != "" && organization.memberships_via_organization.user.id ?= @request.auth.id)',
    "deleteRule": '(organization.owner.id = @request.auth.id && role != "owner") || (@request.auth.id != "" && organization.memberships_via_organization.user.id ?= @request.auth.id && organization.memberships_via_organization.role ?= "admin" && role != "owner") || (user.id = @request.auth.id && role != "owner")',
    "updateRule": 'organization.owner.id = @request.auth.id',
    "viewRule": 'user.id = @request.auth.id || organization.owner.id = @request.auth.id || (@request.auth.id != "" && organization.memberships_via_organization.user.id ?= @request.auth.id)'
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_memberships");

  return app.delete(collection);
})
