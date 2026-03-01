import { Link } from 'react-router-dom'
import { Box, Group, useMantineColorScheme } from '@mantine/core'
import * as config from '@/config'
import ActionIconButton, { ActionIconButtonProps } from './ActionIconButton'
import FeedbackWidget from './FeedbackWidget'
import classes from './TitleBar.module.css'
import { userLogout } from '@/lib/pb'

const iconProps: Partial<ActionIconButtonProps> = {
  variant: 'transparent',
  size: 26,
}

export default function TitleBar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  })

  const logoutUser = () => {
    userLogout()
    window.location.reload()
  }

  return (
    <Group className={classes.titleBar}>
      <ActionIconButton
        type={!colorScheme || colorScheme === 'dark' ? 'darkMode' : 'lightMode'}
        onClick={toggleColorScheme}
        ariaLabel="App Settings"
        {...iconProps}
      />
      <Link to="/" className={classes.titleLink}>
        <span>ProductBase</span>
        <sup className={classes.version}>{config.VERSION}</sup>
      </Link>
      <ActionIconButton
        type="search"
        href="/tags"
        ariaLabel="Search Tags"
        {...iconProps}
      />
      <ActionIconButton
        type="settings"
        href="/settings"
        ariaLabel="App Settings"
        {...iconProps}
      />
      <FeedbackWidget />
      <ActionIconButton
        type="logout"
        onClick={logoutUser}
        ariaLabel="Logout"
        {...iconProps}
      />
    </Group>
  )
}
