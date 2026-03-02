import { useNavigate } from 'react-router-dom'
import { ActionIcon, ActionIconProps } from '@mantine/core'
import Icon, { IconName } from '../Icon'
import classes from './ActionIconButton.module.css'

export interface ActionIconButtonProps {
  type: IconName
  ariaLabel: string
  variant?: ActionIconProps['variant']
  color?: ActionIconProps['color']
  size?: ActionIconProps['size']
  href?: string
  onClick?(): void | false
  confirmation?: string
}

function ActionIconButton({
  type,
  ariaLabel,
  variant = 'transparent',
  color,
  size,
  href,
  onClick,
  confirmation,
}: ActionIconButtonProps) {
  const navigate = useNavigate()
  const handleClick = () => {
    if (confirmation && !window.confirm(confirmation)) {
      return
    }
    Boolean(href) ? linkTo() : onClick?.()
  }
  const linkTo = () => {
    const continueLink = onClick?.()
    if (continueLink !== false) {
      navigate(href as string)
    }
  }
  return (
    <ActionIcon
      className={classes.button}
      variant={variant}
      color={color}
      size={size}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      <Icon type={type} size={size} />
    </ActionIcon>
  )
}

export default ActionIconButton
