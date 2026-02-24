import { Button } from '@mantine/core'

interface Props {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  label?: string
}

export default function CancelButton({ onClick, label = 'Cancel' }: Props) {
  return (
    <Button variant="subtle" onClick={onClick}>
      {label}
    </Button>
  )
}
