import { useCallback } from 'react'
import type { OrganizationsRecord } from '@/types'
import { AUTH_USER, usePocketbaseCollection, UsePocketbaseCollectionReturn } from './usePocketbaseCollection'

export interface UseOrganizationsCollectionReturn extends UsePocketbaseCollectionReturn<OrganizationsRecord> {
  listMyOrgs: () => void
  transferOwnership: (orgId: string, newOwnerId: string) => Promise<void>
}

export function useOrganizationsCollection(): UseOrganizationsCollectionReturn {
  const base = usePocketbaseCollection<OrganizationsRecord>('organizations', {
    sort: '-created',
    attachOnCreate: { owner: AUTH_USER },
  })

  const listMyOrgs = useCallback(() => {
    base.all({ expand: 'owner,memberships_via_organization' })
  }, [base.all])

  const transferOwnership = useCallback(
    async (orgId: string, newOwnerId: string) => {
      await base.update(orgId, { owner: newOwnerId })
    },
    [base.update],
  )

  return {
    ...base,
    listMyOrgs,
    transferOwnership,
  }
}
