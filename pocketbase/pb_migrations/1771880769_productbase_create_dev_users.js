/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const SU_EMAIL = process.env.DEV_SUPERUSER_EMAIL
  const SU_PASSWORD = process.env.DEV_SUPERUSER_PASSWORD
  const DU_NAME = process.env.DEV_MOCK_USER_NAME || 'dev user'
  const DU_EMAIL = process.env.DEV_MOCK_USER_EMAIL
  const DU_PASSWORD = process.env.DEV_MOCK_USER_PASSWORD

  // skip user creation in non-dev environments
  if (!app.isDev) {
    return
  }

  if (SU_EMAIL && SU_PASSWORD) {
    try {
      app.findAuthRecordByEmail('_superusers', SU_EMAIL)
    } catch (e) {
      console.log('ProductBase: Creating Super User |', SU_EMAIL)
      const collection = app.findCollectionByNameOrId('_superusers')
      const record = new Record(collection)
      record.set('email', SU_EMAIL)
      record.set('password', SU_PASSWORD)
      app.save(record)
    }
  }

  if (DU_EMAIL && DU_PASSWORD) {
    try {
      app.findAuthRecordByEmail('users', DU_EMAIL)
    } catch (e) {
      console.log('ProductBase: Creating Dev User |', DU_EMAIL)
      const collection = app.findCollectionByNameOrId('users')
      const record = new Record(collection)
      record.set('name', DU_NAME)
      record.set('email', DU_EMAIL)
      record.set('password', DU_PASSWORD)
      record.set('verified', true)
      app.save(record)
    }
  }

  return
}, (app) => {
  return
})
