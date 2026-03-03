/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_memberships");

  collection.deleteRule = '(organization.owner.id = @request.auth.id) || (@request.auth.id != "" && organization.memberships_via_organization.user.id ?= @request.auth.id && organization.memberships_via_organization.role ?= "admin" && role != "owner") || (user.id = @request.auth.id && role != "owner")';

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_memberships");

  collection.deleteRule = '(organization.owner.id = @request.auth.id && role != "owner") || (@request.auth.id != "" && organization.memberships_via_organization.user.id ?= @request.auth.id && organization.memberships_via_organization.role ?= "admin" && role != "owner") || (user.id = @request.auth.id && role != "owner")';

  return app.save(collection);
})
