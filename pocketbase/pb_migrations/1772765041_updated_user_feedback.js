/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3683687721")

  // remove field
  collection.fields.removeById("relation2484195660")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3683687721")

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2323541961",
    "hidden": false,
    "id": "relation2484195660",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "feedback_actions",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
