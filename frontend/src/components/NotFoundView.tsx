import { Link } from 'react-router-dom'
import { Alert, Button } from '@mantine/core'
import ContentContainer from '@/components/layout/ContentContainer'
import Icon from '@/components/Icon'
import { routes } from '@/lib/routes'
import FormActionsGroup from './forms/FormActionsGroup'
import SecondaryButton from './forms/SecondaryButton'

interface NotFoundViewProps {
  message?: string
  backTo: string
  backLabel?: string
}

export default function NotFoundView({ message = 'Not found.', backTo, backLabel = 'Go Back' }: NotFoundViewProps) {
  return (
    <ContentContainer size="xs" my="md" mx="auto">
      <Alert color="red" title="Not Found" icon={<Icon type="error" size="sm" />}>
        {message}
        <FormActionsGroup>
          <Button component={Link} to={backTo}>
            {backLabel}
          </Button>
          <SecondaryButton label="Go Home" href={routes.home()} />
        </FormActionsGroup>
      </Alert>
    </ContentContainer>
  )
}
