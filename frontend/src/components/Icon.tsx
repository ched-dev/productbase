import { Fragment, ReactNode } from 'react'
import {
  IconAdjustmentsHorizontal,
  IconAlertTriangle,
  IconArrowBackUp,
  IconCalendarEventFilled,
  IconChartBar,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleCheck,
  IconCircleDashedCheck,
  IconCode,
  IconCopy,
  IconCrosshair,
  IconEdit,
  IconGitFork,
  IconHash,
  IconLayoutList,
  IconListTree,
  IconLogout,
  IconMail,
  IconMessage2,
  IconMinus,
  IconMoon,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconSitemap,
  IconSparkles,
  IconSun,
  IconX,
  IconProps as TablerIconProps,
} from '@tabler/icons-react'
import { MantineSize } from '@mantine/core'
import { theme } from '@/theme'

export const defaultFallbackIcon = 'check'

const ICON_MAP = {
  add: IconPlus,
  check: IconCheck,
  checkApprove: IconCircleDashedCheck,
  clone: IconCopy,
  close: IconX,
  code: IconCode,
  create: IconCrosshair,
  darkMode: IconMoon,
  date: IconCalendarEventFilled,
  delete: IconX,
  down: IconChevronDown,
  edit: IconPencil,
  error: IconAlertTriangle,
  hashtag: IconHash,
  home: IconLayoutList,
  feedback: IconMessage2,
  inbox: IconMail,
  left: IconChevronLeft,
  lightMode: IconSun,
  logout: IconLogout,
  minus: IconMinus,
  parser: IconSparkles,
  plus: IconPlus,
  up: IconChevronUp,
  refresh: IconRefresh,
  reset: IconArrowBackUp,
  right: IconChevronRight,
  rules: IconSitemap,
  search: IconSearch,
  settings: IconSettings,
  tagTree: IconListTree,
  sliders: IconAdjustmentsHorizontal,
  tracker: IconChartBar,
}

export const iconNames = Object.keys(ICON_MAP)

export type IconName = keyof typeof ICON_MAP

const ICON_SIZES = theme.other.iconSizes

export interface IconProps {
  type: IconName
  label?: string | ReactNode
  size?: TablerIconProps['size']
  space?: TablerIconProps['spacing']
  stroke?: TablerIconProps['stroke']
  position?: 'left' | 'right'
  className?: string
}

export default function Icon({
  type,
  label,
  size = 'md',
  space = 'sm',
  stroke,
  position = 'left',
  className = '',
}: IconProps) {
  const iconName = type || defaultFallbackIcon
  const IconSVG = ICON_MAP[iconName] || ICON_MAP[defaultFallbackIcon]
  const iconSize =
    typeof size === 'number' ? size : ICON_SIZES[size as MantineSize]

  const IconWrapper = (
    <IconSVG width={iconSize} height={iconSize} stroke={stroke} />
  )

  const els = [IconWrapper, <span key="2">{label}</span>]

  if (position === 'right') {
    els.reverse()
  }

  return label ? (
    <span>
      {els.map((el, i) => (
        <Fragment key={i}>{el}</Fragment>
      ))}
    </span>
  ) : (
    IconWrapper
  )
}
