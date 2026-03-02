/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_organizations");

  collection.listRule = 'owner.id = @request.auth.id || @request.auth.id ?= memberships_via_organization.user.id';
  collection.viewRule = 'owner.id = @request.auth.id || @request.auth.id ?= memberships_via_organization.user.id';

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_organizations");

  collection.listRule = 'owner.id = @request.auth.id';
  collection.viewRule = 'owner.id = @request.auth.id';

  return app.save(collection);
})
