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


// --- Organizations & Memberships Hooks ---

// Auto-create owner membership when an organization is created
onRecordCreateRequest((e) => {
  const { app, auth, record } = e

  if (auth?.isSuperuser()) {
    e.next()
    return
  }

  // force authed user as owner
  record.set('owner', auth.id)

  // save the organization first
  e.next()

  // create the owner membership
  const membershipsCol = app.findCollectionByNameOrId('memberships')
  const membership = new Record(membershipsCol)
  membership.set('user', auth.id)
  membership.set('organization', record.id)
  membership.set('role', 'owner')
  membership.set('invited_by', auth.id)
  app.save(membership)
}, 'organizations')

// Prevent deleting a membership with role "owner"
onRecordDeleteRequest((e) => {
  const { auth, record } = e

  if (auth?.isSuperuser()) {
    e.next()
    return
  }

  if (record.get('role') === 'owner') {
    throw new BadRequestError('Cannot delete the owner membership. Transfer ownership first.', {
      role: new ValidationError('validation_owner_protected', 'Owner membership cannot be deleted'),
    })
  }

  e.next()
}, 'memberships')

// Prevent deleting a user who owns an organization
onRecordDeleteRequest((e) => {
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
}, 'users')

// Handle ownership transfer when organization owner field changes
onRecordUpdateRequest((e) => {
  const { app, auth, record } = e

  if (auth?.isSuperuser()) {
    e.next()
    return
  }

  const newOwnerId = record.get('owner')
  const originalRecord = record.original()
  const oldOwnerId = originalRecord ? originalRecord.get('owner') : null

  // only run if owner actually changed
  if (!oldOwnerId || newOwnerId === oldOwnerId) {
    e.next()
    return
  }

  // verify new owner has an existing membership in this org
  var newOwnerMembership
  try {
    newOwnerMembership = app.findFirstRecordByFilter(
      'memberships',
      'user.id = {:userId} && organization.id = {:orgId}',
      { userId: newOwnerId, orgId: record.id }
    )
  } catch (err) {
    if (err.status >= 400) {
      throw err
    }
  }

  if (!newOwnerMembership) {
    throw new BadRequestError('New owner must be an existing member of the organization.', {
      owner: new ValidationError('validation_not_member', 'User is not a member of this organization'),
    })
  }

  // save the org update first
  e.next()

  // update old owner membership to admin
  try {
    var oldOwnerMembership = app.findFirstRecordByFilter(
      'memberships',
      'user.id = {:userId} && organization.id = {:orgId}',
      { userId: oldOwnerId, orgId: record.id }
    )
    if (oldOwnerMembership) {
      oldOwnerMembership.set('role', 'admin')
      app.save(oldOwnerMembership)
    }
  } catch (err) {
    if (err.status >= 400) {
      throw err
    }
  }

  // update new owner membership to owner
  newOwnerMembership.set('role', 'owner')
  app.save(newOwnerMembership)
}, 'organizations')
