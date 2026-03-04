import React, { useEffect } from 'react'
import {
  ActionIcon,
  ActionIconProps,
  Badge,
  Group,
  Menu,
  MenuProps,
} from '@mantine/core'
import { useNavHelpers } from '@/hooks/useNavHelpers'
import Icon, { IconProps } from '../Icon'
import classes from './NavBar.module.css'
import { routes } from '@/lib/routes'
import { useOrganizationsCollection } from '@/queryHooks'
import { PBDataList } from '@/lib/pb/data'

// custom styles for this component
const actionIconProps: ActionIconProps = {
  display: 'flex',
  styles: {
    root: {
      overflow: 'visible'
    },
    icon: {
      flexDirection: 'column',
      fontSize: 'var(--mantine-font-size-xs)',
    },
  },
  variant: 'transparent',
  color: 'var(--mantine-color-default-color)',
  size: 60,
  p: 5,
}
const actionIconStroke = 1.2

const menuStyles: MenuProps['styles'] = {
  item: {
    fontSize: 'var(--mantine-font-size-md)',
    padding: 'var(--mantine-spacing-sm)',
  },
}
const menuIconProps: Partial<IconProps> = {
  size: 20,
  stroke: 1,
}


interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = () => {
  const { routeMatches, navigateTo } = useNavHelpers()
  const organizations = useOrganizationsCollection()
  const orgsCount = organizations.data instanceof PBDataList ? organizations.data.getTotalItems() : undefined

  useEffect(() => {
    organizations.count()
  }, [])

  return (
    <Group className={classes.navbar}>
      <ActionIcon.Group>
        <ActionIcon
          onClick={navigateTo('/')}
          aria-label="Home"
          data-active={routeMatches(['/'])}
          {...actionIconProps}
        >
          <Icon
            type="home"
            size={actionIconProps.size}
            stroke={actionIconStroke}
          />
          <span>Home</span>
        </ActionIcon>
        <ActionIcon
          onClick={navigateTo(routes.organizations.list())}
          aria-label="Organizations"
          data-active={routeMatches([routes.organizations.list()])}
          {...actionIconProps}
        >
          <Icon
            type="organization"
            size={actionIconProps.size}
            stroke={actionIconStroke}
          />
          <span>Organizations</span>
          {orgsCount != null && orgsCount > 0 && (
            <Badge
              className={classes.iconNotification}
              variant="filled"
              color="red.6"
            >
              {orgsCount}
            </Badge>
          )}
        </ActionIcon>
        <Menu shadow="md" styles={menuStyles}>
          <Menu.Target>
            <ActionIcon
              aria-label="New Entry"
              data-active={routeMatches([
                '/new',
              ])}
              {...actionIconProps}
            >
              <Icon
                type="create"
                size={actionIconProps.size}
                stroke={actionIconStroke}
              />
              <span>New</span>
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              onClick={navigateTo(routes.organizations.new())}
              leftSection={<Icon type="organization" {...menuIconProps} />}
            >
              Organization
            </Menu.Item>
            <Menu.Item
              onClick={navigateTo('/new')}
              leftSection={<Icon type="create" {...menuIconProps} />}
            >
              Entry
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </ActionIcon.Group>
    </Group>
  )
}

export default NavBar
