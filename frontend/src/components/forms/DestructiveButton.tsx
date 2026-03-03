import { Button } from '@mantine/core'

interface Props {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  label?: string
  loading?: boolean
  disabled?: boolean
}

/**
 * A destructive button for actions like delete, remove, destroy. used sitewide.
 */
export default function DestructiveButton({ onClick, label = 'Confirm', loading, disabled }: Props) {
  return (
    <Button
      variant="filled"
      color="red"
      onClick={onClick}
      loading={loading}
      disabled={disabled}
    >
      {label}
    </Button>
  )
}
