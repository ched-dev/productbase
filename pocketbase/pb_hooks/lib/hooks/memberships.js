/// <reference path="../../../pb_data/types.d.ts" />

/**
 * Hook handler: Prevent deleting a membership with role "owner"
 * @param {core.RecordRequestEvent} e
 */
function handleDeleteProtection(e) {
  const { app, auth, record } = e

  if (auth?.isSuperuser()) {
    e.next()
    return
  }

  if (record.get('role') === 'owner') {
    app.logger().warn('Membership delete blocked: owner role',
      'membershipId', record.id,
      'orgId', record.get('organization'),
      'userId', auth.id)
    throw new BadRequestError('Owner membership cannot be deleted', {
      role: new ValidationError('validation_owner_protected', 'Cannot delete the owner. Transfer ownership instead.'),
    })
  }

  e.next()
}

/**
 * Hook handler: Prevent creating a membership with role "owner"
 * Owner memberships are only created automatically on org creation or via ownership transfer.
 * @param {core.RecordRequestEvent} e
 */
function handleCreateProtection(e) {
  const { app, auth, record } = e

  if (auth?.isSuperuser()) {
    e.next()
    return
  }

  if (record.get('role') === 'owner') {
    app.logger().warn('Membership create blocked: owner role',
      'orgId', record.get('organization'),
      'userId', auth.id)
    throw new BadRequestError('Cannot directly assign the owner role.', {
      role: new ValidationError('validation_owner_reserved', 'Owner role can only be assigned via ownership transfer'),
    })
  }

  e.next()
}

/**
 * Hook handler: Enrich membership records with user data (bypasses users API rules)
 * @param {core.RecordEnrichEvent} e
 */
function handleEnrichWithUser(e) {
  const { app, record, requestInfo } = e

  const userId = record.get('user')
  if (!userId) {
    e.next()
    return
  }

  const authId = requestInfo?.auth?.id
  if (!authId) {
    e.next()
    return
  }

  // Only enrich if the requesting user is a member of the same org
  const orgId = record.get('organization')
  try {
    const callerMembership = app.findFirstRecordByFilter(
      'memberships',
      'user = {:userId} && organization = {:orgId}',
      { userId: authId, orgId }
    )
    if (!callerMembership) {
      e.next()
      return
    }
  } catch (_) {
    e.next()
    return
  }

  try {
    const userRecord = app.findRecordById('users', userId)
    record.mergeExpand({ user: userRecord })
  } catch (err) {
    app.logger().warn('handleEnrichWithUser: user not found',
      'membershipId', record.id,
      'userId', userId)
  }

  e.next()
}

module.exports = {
  handleDeleteProtection,
  handleCreateProtection,
  handleEnrichWithUser,
}
