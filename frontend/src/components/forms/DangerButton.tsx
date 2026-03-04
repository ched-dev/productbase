import { Button, type ButtonProps } from '@mantine/core'

interface Props {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  label?: string
  loading?: boolean
  disabled?: boolean
  size?: ButtonProps['size']
}

/**
 * A danger button for actions like delete, remove, destroy. used sitewide.
 */
export default function DangerButton({ onClick, label = 'Confirm', loading, disabled, size }: Props) {
  return (
    <Button
      variant="subtle"
      color="red"
      size={size}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
    >
      {label}
    </Button>
  )
}
