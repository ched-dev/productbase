import { useCallback, useRef, useState } from 'react'
import type { ApiError } from '@/lib/pb/errors'
import { getApiError } from '@/lib/pb/errors'

interface UseFormStateOptions {
  onSuccess?: () => void
  onError?: (err?: unknown) => void
  onReset?: () => void
}

interface UseFormStateReturn {
  formRef: React.RefObject<HTMLFormElement | null>
  submitted: boolean
  success: boolean
  apiError: ApiError | null
  handleSubmit: (fn: (formData: FormData) => Promise<unknown>) => (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  reset: () => void
}

export function useFormState(options?: UseFormStateOptions): UseFormStateReturn {
  const formRef = useRef<HTMLFormElement>(null)
  const onSuccessRef = useRef(options?.onSuccess)
  onSuccessRef.current = options?.onSuccess
  const onErrorRef = useRef(options?.onError)
  onErrorRef.current = options?.onError
  const onResetRef = useRef(options?.onReset)
  onResetRef.current = options?.onReset

  const [submitted, setSubmitted] = useState(false)
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<ApiError | null>(null)

  const handleSubmit = useCallback(
    (fn: (formData: FormData) => Promise<unknown>) =>
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSuccess(false)
        setSubmitted(true)
        setApiError(null)
        try {
          const result = await fn(new FormData(e.currentTarget))
          if (result !== false) {
            setSuccess(true)
            onSuccessRef.current?.()
          }
          // result === false: validation guard didn't pass — stay silent, no callbacks
        } catch (err) {
          const error = getApiError(err)
          setApiError(error)
          onErrorRef.current?.(err)
        }
      },
    [],
  )

  const reset = useCallback(() => {
    setSubmitted(false)
    setSuccess(false)
    setApiError(null)
    formRef.current?.reset()
    onResetRef.current?.()
  }, [])

  return { formRef, submitted, success, apiError, handleSubmit, reset }
}
