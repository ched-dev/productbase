import { Group } from '@mantine/core'

interface Props {
  children: React.ReactNode
  justify?: string
}

/**
 * A simple wrapper component to allow for modifications in one place sitewide
 */
export default function FormActionsGroup({ children, justify = 'flex-end' }: Props) {
  return <Group justify={justify}>{children}</Group>
}
