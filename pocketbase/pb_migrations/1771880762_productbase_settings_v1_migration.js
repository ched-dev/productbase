/// <reference path="../pb_data/types.d.ts" />

/**
 * ProductBase Schema Version
 */
const SCHEMA_VERSION = 1

migrate((app) => {
  console.log('ProductBase: Creating ProductBase Settings v1')
  const collection = new Collection({
    system: true, // put into system menu
    type: 'base',
    name: '_productbase_settings',
    fields: [
      {
        name: '_schema_version',
        type: 'number',
        required: true,
        onlyInt: true,
      },
      {
        name: 'allow_admin_panel_updates',
        type: 'bool',
        default: false
      },
      {
        name: 'allow_user_registrations',
        type: 'bool',
        default: false
      },
      {
        name: 'enable_waitlist',
        type: 'bool',
        default: false
      },
      
    ],
    indexes: [
      // 'CREATE INDEX idx_clients_company ON clients (company)'
    ],
  })

  app.save(collection)

  const record = new Record(collection)

  record.set('_schema_version', SCHEMA_VERSION)
  record.set('allow_admin_panel_updates', false)
  record.set('allow_user_registrations', false)
  record.set('enable_waitlist', false)

  app.save(record)
}, (app) => {
  const collection = app.findCollectionByNameOrId('_productbase_settings')
  app.delete(collection)
})