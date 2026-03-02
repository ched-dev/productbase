import type { UserPreferencesRecord } from '@/types'
import { AUTH_USER, usePocketbaseCollection, UsePocketbaseCollectionReturn } from './usePocketbaseCollection'

export type UseUserPreferencesCollectionReturn = UsePocketbaseCollectionReturn<UserPreferencesRecord>

export function useUserPreferencesCollection(): UseUserPreferencesCollectionReturn {
  return usePocketbaseCollection<UserPreferencesRecord>('user_preferences', {
    sort: '-created',
    attachOnCreate: { user: AUTH_USER },
  })
}
