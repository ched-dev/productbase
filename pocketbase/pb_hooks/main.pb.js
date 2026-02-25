/// <reference path="../pb_data/types.d.ts" />

/**
 * PocketBase Hooks for ProductBase
 * 
 * This file contains hooks to control user registration based on the
 * _productbase_settings singleton collection.
 */

// Hook to prevent user registration when allow_user_registrations is false
onRecordCreateExecute((e) => {
  const { app, auth, record } = e

  // Only apply this check for public registration (non-admin requests)
  if (auth?.isSuperuser()) {
    e.next()
    return
  }

  // custom existing user check
  try {
    // handle email already taken
    const existing = app.findAuthRecordByEmail('users', record.get('email'))
    if (existing) {
      const msg = 'Account already exists'
      throw new BadRequestError(msg, {
        email: new ValidationError('validation_not_unique', 'Email already in use'),
      })
    }
  } catch (err) {
    // re-throw custom errors
    if (err.status >= 400) {
      throw err
    }
    // allow missing row since we are creating
    if (err.value && err.value.toString() !== 'sql: no rows in result set') {
      throw err
    }
  }

  try {
    // Fetch the singleton settings record
    const settings = app.findFirstRecordByFilter('_productbase_settings')
    /**
     * {
     *   "_schema_version": 1,
     *   "allow_admin_panel_updates": false,
     *   "allow_user_registrations": false,
     *   "collectionId": "pbc_3606149187",
     *   "collectionName": "_productbase_settings",
     *   "enable_waitlist": false,
     *   "id": "vc471qe8beknak1"
     * }
     */

    app.logger().debug('ProductBase Settings', settings)

    if (settings) {
      const allowRegistrations = settings.get('allow_user_registrations')

      if (!allowRegistrations) {
        const msg = 'User registrations are currently disabled'
        throw new ForbiddenError(msg, {
          auth: new ValidationError('auth/user_registration_disabled', msg),
        })
      }
    }
  } catch (err) {
    // re-throw custom errors
    if (err.status >= 400) {
      throw err
    }
    // the settings collection doesn't exist, allow registration
    if (err.value && err.value.toString() !== 'sql: no rows in result set') {
      throw err
    }
  }

  // calling `e.next()` triggers validation - will fail if email already exists
  e.next()
}, 'users') // only for users records
