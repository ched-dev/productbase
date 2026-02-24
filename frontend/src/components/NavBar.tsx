import React from 'react'
import {
  ActionIcon,
  ActionIconProps,
  Badge,
  Group,
  Menu,
  MenuProps,
} from '@mantine/core'
import Inbox from '@/data/models/Inbox'
import { useNavHelpers } from '@/hooks/useNavHelpers'
import Icon, { IconProps } from './Icon'
import classes from './NavBar.module.css'

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = () => {
  const { routeMatches, navigateTo } = useNavHelpers()
  const inboxCount = Inbox.getAll().length

  const actionIconProps: ActionIconProps = {
    display: 'flex',
    styles: {
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

  return (
    <Group className={classes.navbar}>
      <ActionIcon.Group>
        <ActionIcon
          onClick={navigateTo('/')}
          aria-label="Entries"
          data-active={routeMatches(['/', '/charts'])}
          {...actionIconProps}
        >
          <Icon
            type="home"
            size={actionIconProps.size}
            stroke={actionIconStroke}
          />
          <span>Entries</span>
        </ActionIcon>
        <ActionIcon
          onClick={navigateTo('/parsers')}
          aria-label="Parsers"
          data-active={routeMatches(['/parsers'])}
          {...actionIconProps}
        >
          <Icon
            type="parser"
            size={actionIconProps.size}
            stroke={actionIconStroke}
          />
          <span>Extractions</span>
        </ActionIcon>
        <ActionIcon
          onClick={navigateTo('/trackers')}
          aria-label="Trackers"
          data-active={routeMatches(['/trackers'])}
          {...actionIconProps}
        >
          <Icon
            type="tracker"
            size={actionIconProps.size}
            stroke={actionIconStroke}
          />
          <span>Trackers</span>
        </ActionIcon>
        <ActionIcon
          onClick={navigateTo('/inbox')}
          aria-label="Inbox"
          data-active={routeMatches(['/inbox'])}
          {...actionIconProps}
        >
          <Icon
            type="inbox"
            size={actionIconProps.size}
            stroke={actionIconStroke}
          />
          <span>Inbox</span>
          {inboxCount > 0 && (
            <Badge
              className={classes.iconNotification}
              variant="filled"
              color="red.6"
            >
              {inboxCount}
            </Badge>
          )}
        </ActionIcon>
        <Menu shadow="md" styles={menuStyles}>
          <Menu.Target>
            <ActionIcon
              aria-label="New Entry"
              data-active={routeMatches([
                '/new',
                '/parsers/new',
                '/trackers/new',
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
              onClick={navigateTo('/parsers/new')}
              leftSection={<Icon type="parser" {...menuIconProps} />}
            >
              Extractor
            </Menu.Item>
            <Menu.Item
              onClick={navigateTo('/trackers/new')}
              leftSection={<Icon type="tracker" {...menuIconProps} />}
            >
              Tracker
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
