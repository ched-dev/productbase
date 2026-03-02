import { Text } from '@mantine/core'
import type { ApiError } from '@/lib/pb/errors'

interface FieldErrorProps {
  /** The field name to look up in the errors object */
  name: string
  /** ApiError instance from getApiError() */
  apiError: ApiError | null | undefined
}

const FieldError = ({ name, apiError }: FieldErrorProps) => {
  const errors = apiError?.validationErrors()
  const error = errors ? errors[name] : undefined

  if (!error) {
    return null
  }

  return <Text c="red" size="sm">{error.message}</Text>
}

export default FieldError
