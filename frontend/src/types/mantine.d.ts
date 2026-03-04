import { ButtonVariant, ActionIconVariant, BadgeVariant } from '@mantine/core'

type CustomVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'

declare module '@mantine/core' {
  export interface ButtonProps {
    variant?: ButtonVariant | CustomVariant
  }

  export interface ActionIconProps {
    variant?: ActionIconVariant | CustomVariant
  }

  export interface BadgeProps {
    variant?: BadgeVariant | CustomVariant
  }
}
