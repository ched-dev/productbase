import { Container, type ContainerProps } from '@mantine/core'

interface Props extends React.PropsWithChildren, ContainerProps {}

/**
 * A content container constrained to a specific size
 */
export default ({ children, size = 'xl', ...rest }: Props) => (
  <Container w={`var(--container-size-${size})`} size={size} {...rest}>
    {children}
  </Container>
)
