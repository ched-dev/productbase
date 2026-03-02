/// <reference path="../pb_data/types.d.ts" />

/**
 * PocketBase Hooks for ProductBase
 *
 * Hook handlers are extracted to lib/hooks/ modules to avoid
 * closure capture issues across GOJA runtime goroutines.
 */

// --- Users ---

onRecordCreateRequest((e) => {
  const Users = require(`${__hooks}/lib/hooks/users.js`)
  Users.handleRegistration(e)
}, 'users')

onRecordDeleteRequest((e) => {
  const Users = require(`${__hooks}/lib/hooks/users.js`)
  Users.handleDeleteProtection(e)
}, 'users')

// --- Organizations ---

onRecordCreateRequest((e) => {
  const Organizations = require(`${__hooks}/lib/hooks/organizations.js`)
  Organizations.handleCreate(e)
}, 'organizations')

onRecordUpdateRequest((e) => {
  const Organizations = require(`${__hooks}/lib/hooks/organizations.js`)
  Organizations.handleOwnershipTransfer(e)
}, 'organizations')

// --- Memberships ---

onRecordDeleteRequest((e) => {
  const Memberships = require(`${__hooks}/lib/hooks/memberships.js`)
  Memberships.handleDeleteProtection(e)
}, 'memberships')
