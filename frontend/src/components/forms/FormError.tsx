import { Alert } from '@mantine/core'
import Icon from '@/components/Icon'
import type { ApiError } from '@/lib/pb/errors'

interface FormErrorProps {
  apiError: ApiError | null | undefined
  title?: string
}

const FormError = ({ apiError, title = 'Error' }: FormErrorProps) => {
  if (!apiError) {
    return null
  }

  return (
    <Alert color="red" title={title} mb="md" icon={<Icon type="error" size="sm" />}>
      {apiError.message}
    </Alert>
  )
}

export default FormError