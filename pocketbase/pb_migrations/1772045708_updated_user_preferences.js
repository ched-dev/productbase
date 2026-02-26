/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1581634021")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool1924208976",
    "name": "alert_phone_number_subscribed",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1581634021")

  // remove field
  collection.fields.removeById("bool1924208976")

  return app.save(collection)
})
