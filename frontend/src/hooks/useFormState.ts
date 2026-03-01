import { useCallback, useRef, useState } from 'react'

interface UseFormStateOptions {
  onSuccess?: () => void
  onError?: (err?: unknown) => void
  onReset?: () => void
}

interface UseFormStateReturn {
  formRef: React.RefObject<HTMLFormElement | null>
  submitted: boolean
  success: boolean
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

  const handleSubmit = useCallback(
    (fn: (formData: FormData) => Promise<unknown>) =>
      async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSuccess(false)
        setSubmitted(true)
        try {
          const result = await fn(new FormData(e.currentTarget))
          if (result !== false) {
            setSuccess(true)
            onSuccessRef.current?.()
          }
          // result === false: validation guard didn't pass — stay silent, no callbacks
        } catch (err) {
          onErrorRef.current?.(err)
        }
      },
    [],
  )

  const reset = useCallback(() => {
    setSubmitted(false)
    setSuccess(false)
    formRef.current?.reset()
    onResetRef.current?.()
  }, [])

  return { formRef, submitted, success, handleSubmit, reset }
}
