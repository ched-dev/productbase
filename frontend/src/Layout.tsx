import '@mantine/core/styles.css'

import { Outlet } from 'react-router-dom'
import TitleBar from './components/layout/TitleBar'
import classes from './Layout.module.css'
import { Box } from '@mantine/core'

export default function Layout() {
  return (
    <Box>
      <TitleBar />
      <main className={classes.mainView}>
        <Outlet />
      </main>
    </Box>
  )
}
