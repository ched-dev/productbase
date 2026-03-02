/// <reference path="../../../pb_data/types.d.ts" />

/**
 * Hook handler: Auto-create owner membership when an organization is created
 * @param {core.RecordRequestEvent} e
 */
function handleCreate(e) {
  const { app, auth, record } = e

  if (auth?.isSuperuser()) {
    e.next()
    return
  }

  if (auth.get('verified') !== true) {
    app.logger().debug('Unverified accounts cannot create Organizations', 'auth.id', auth.id)
    throw new ForbiddenError('Account verification is required.', {
      verified: new ValidationError('validation_not_verified', 'Account verification is required'),
    })
  }

  // force authed user as owner
  record.set('owner', auth.id)

  // save the organization first
  e.next()

  app.logger().info('Organization created',
    'orgId', record.id,
    'ownerId', auth.id)

  // create the owner membership
  const membershipsCol = app.findCollectionByNameOrId('memberships')
  const membership = new Record(membershipsCol)
  membership.set('user', auth.id)
  membership.set('organization', record.id)
  membership.set('role', 'owner')
  membership.set('invited_by', auth.id)
  app.save(membership)

  app.logger().info('Owner membership auto-created',
    'orgId', record.id,
    'userId', auth.id)
}

/**
 * Hook handler: Handle ownership transfer when organization owner field changes
 * @param {core.RecordRequestEvent} e
 */
function handleOwnershipTransfer(e) {
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
    app.logger().warn('Ownership transfer blocked: new owner not a member',
      'orgId', record.id,
      'newOwnerId', newOwnerId)
    throw new BadRequestError('New owner must be an existing member of the organization.', {
      owner: new ValidationError('validation_not_member', 'User is not a member of this organization'),
    })
  }

  app.logger().info('Ownership transfer started',
    'orgId', record.id,
    'fromUserId', oldOwnerId,
    'toUserId', newOwnerId)

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

  app.logger().info('Ownership transfer completed',
    'orgId', record.id,
    'newOwnerId', newOwnerId,
    'oldOwnerId', oldOwnerId)
}

module.exports = {
  handleCreate,
  handleOwnershipTransfer,
}
