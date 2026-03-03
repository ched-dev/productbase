import { Modal, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import CancelButton from './CancelButton'
import DestructiveButton from './DestructiveButton'
import FormActionsGroup from './FormActionsGroup'

interface ConfirmationMessageProps {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm(): void
  children: (open: () => void) => React.ReactNode
}

/**
 * Confirmation message used for destructive actions sitewide
 */
export default function ConfirmationMessage({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  children,
}: ConfirmationMessageProps) {
  const [opened, { open, close }] = useDisclosure(false)

  const handleConfirm = () => {
    onConfirm()
    close()
  }

  return (
    <>
      {children(open)}
      <Modal opened={opened} onClose={close} title={title} centered>
        <Text mb="lg">{message}</Text>
        <FormActionsGroup>
          <CancelButton onClick={close} label={cancelLabel} />
          <DestructiveButton onClick={handleConfirm} label={confirmLabel} />
        </FormActionsGroup>
      </Modal>
    </>
  )
}
