/// <reference path="../../../pb_data/types.d.ts" />

/**
 * Hook handler: Prevent user registration when allow_user_registrations is false
 * @param {core.RecordRequestEvent} e
 */
function handleRegistration(e) {
  const { app, auth, record } = e

  if (auth?.isSuperuser()) {
    e.next()
    return
  }

  // authed user trying to create new user
  if (auth?.id) {
    throw new BadRequestError('User already logged in')
  }

  // custom existing user check
  try {
    // handle email already taken
    const existing = app.findAuthRecordByEmail('users', record.get('email'))
    if (existing) {
      app.logger().info('Registration rejected: duplicate email', 'user.id', existing.get('id'))
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

    app.logger().debug('ProductBase Settings', settings)

    if (settings) {
      const allowRegistrations = settings.get('allow_user_registrations')

      if (!allowRegistrations) {
        app.logger().info('Registration rejected: registrations disabled')
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

  app.logger().info('Registration allowed', 'user.id', record.get('id'))
  // calling `e.next()` triggers validation - will fail if email already exists
  e.next()
}

/**
 * Hook handler: Prevent deleting a user who owns an organization
 * @param {core.RecordRequestEvent} e
 */
function handleDeleteProtection(e) {
  const { app, auth, record } = e

  if (auth?.isSuperuser()) {
    e.next()
    return
  }

  try {
    const ownedOrgs = app.findRecordsByFilter(
      'organizations',
      'owner.id = {:userId}',
      '',
      1,
      0,
      { userId: record.id }
    )
    if (ownedOrgs && ownedOrgs.length > 0) {
      app.logger().warn('User delete blocked: owns organizations',
        'userId', record.id,
        'orgCount', ownedOrgs.length)
      throw new BadRequestError('Cannot delete user who owns organizations. Transfer ownership or delete organizations first.', {
        user: new ValidationError('validation_user_owns_orgs', 'User owns one or more organizations'),
      })
    }
  } catch (err) {
    if (err.status >= 400) {
      throw err
    }
  }

  e.next()
}

module.exports = {
  handleRegistration,
  handleDeleteProtection,
}
