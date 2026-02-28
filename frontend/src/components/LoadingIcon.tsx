import { Loader, LoaderProps } from '@mantine/core'

interface Props extends LoaderProps {
  ariaLabel?: string
}

export default function LoadingIcon({
  ariaLabel = 'Loading',
  color = 'var(--mantine-color-default-color)',
  ...props
}: Props) {
  return <Loader type="ring" color={color} aria-label={ariaLabel} {...props} />
}
