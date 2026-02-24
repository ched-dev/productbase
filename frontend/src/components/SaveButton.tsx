import { Button } from '@mantine/core'

interface Props {
  submit?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  label?: string
}

export default function SaveButton({ submit, onClick, label = 'SAVE' }: Props) {
  return (
    <Button
      type={submit ? 'submit' : undefined}
      variant="filled"
      color="teal"
      onClick={onClick}
    >
      {label}
    </Button>
  )
}
