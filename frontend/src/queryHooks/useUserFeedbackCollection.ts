import { useCallback } from 'react'
import type { UserFeedbackRecord } from '@/types'
import { usePocketbaseCollection, UsePocketbaseCollectionReturn } from './usePocketbaseCollection'

export interface UseUserFeedbackCollectionReturn extends UsePocketbaseCollectionReturn<UserFeedbackRecord> {
  uploadAttachment: (id: string, file: File) => Promise<void>
}

export function useUserFeedbackCollection(): UseUserFeedbackCollectionReturn {
  const base = usePocketbaseCollection<UserFeedbackRecord>('user_feedback', {
    sort: '-created',
    attachUserOnCreate: true,
  })

  const uploadAttachment = useCallback(
    async (id: string, file: File) => {
      const form = new FormData()
      form.append('attachment', file)
      await base.update(id, form)
    },
    [base.update],
  )

  return {
    ...base,
    uploadAttachment,
  }
}
