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
    throw new BadRequestError('Cannot delete the owner membership. Transfer ownership first.', {
      role: new ValidationError('validation_owner_protected', 'Owner membership cannot be deleted'),
    })
  }

  e.next()
}

module.exports = {
  handleDeleteProtection,
}
