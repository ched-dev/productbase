import { useCallback } from 'react'
import type { MembershipsRecord } from '@/types'
import { usePocketbaseCollection, UsePocketbaseCollectionReturn } from './usePocketbaseCollection'

export interface UseMembershipsCollectionReturn extends UsePocketbaseCollectionReturn<MembershipsRecord> {
  listByOrg: (orgId: string) => void
  invite: (orgId: string, email: string, role: string) => Promise<void>
}

export function useMembershipsCollection(): UseMembershipsCollectionReturn {
  const base = usePocketbaseCollection<MembershipsRecord>('memberships', {
    sort: '-created',
    expand: 'user,organization',
  })

  const listByOrg = useCallback(
    (orgId: string) => {
      base.all({ filter: `organization.id = "${orgId}"`, expand: 'user,invited_by' })
    },
    [base.all],
  )

  const invite = useCallback(
    async (orgId: string, email: string, role: string) => {
      await base.create({
        organization: orgId,
        invite_email: email,
        role,
      } as unknown as Omit<MembershipsRecord, 'id' | 'collectionId' | 'collectionName' | 'created' | 'updated'>)
    },
    [base.create],
  )

  return {
    ...base,
    listByOrg,
    invite,
  }
}
