import { Link } from 'react-router-dom'
import { Button } from '@mantine/core'

interface Props {
  label: string
  href?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/**
 * A secondary action button used sitewide for non-primary actions such as
 * navigation, settings, or alternative paths. Styled with the subtle variant
 * to visually distinguish from primary actions.
 */
export default function SecondaryButton({ label, href, onClick }: Props) {
  if (href) {
    return (
      <Button variant="subtle" component={Link} to={href}>
        {label}
      </Button>
    )
  }

  return (
    <Button variant="subtle" onClick={onClick}>
      {label}
    </Button>
  )
}
