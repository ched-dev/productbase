import { Button, type ButtonProps } from '@mantine/core'

interface Props {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  label?: string
  loading?: boolean
  disabled?: boolean
  size?: ButtonProps['size']
  invert?: boolean
}

/**
 * A danger button for actions like delete, remove, destroy. used sitewide.
 */
export default function DangerButton({ onClick, label = 'Confirm', loading, disabled, size, invert }: Props) {
  return (
    <Button
      variant={invert ? 'subtle' : 'filled'}
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
