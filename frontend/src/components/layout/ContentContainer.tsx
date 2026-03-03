import { Container, type MantineSpacing } from '@mantine/core'

interface Props extends React.PropsWithChildren {
  size?: MantineSpacing
}

/**
 * A content container constrained to a specific size
 */
export default ({ children, size = 'xl' }: Props) => (
  <Container w={`var(--container-size-${size})`} size={size}>
    {children}
  </Container>
)
