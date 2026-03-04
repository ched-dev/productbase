import { Button } from '@mantine/core'

interface Props {
  submit?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  label?: string
  loading?: boolean
  disabled?: boolean
}

export default function SaveButton({ submit, onClick, label = 'Save', loading, disabled }: Props) {
  return (
    <Button
      type={submit ? 'submit' : undefined}
      variant="success"
      onClick={onClick}
      loading={loading}
      disabled={disabled}
    >
      {label}
    </Button>
  )
}
