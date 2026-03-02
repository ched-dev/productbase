import '@mantine/core/styles.css'

import { Outlet } from 'react-router-dom'
import Auth from './components/Auth'
import TitleBar from './components/layout/TitleBar'
import classes from './Layout.module.css'

export default function Layout() {
  return (
    <>
      <Auth />
      <TitleBar />
      <main className={classes.mainView}>
        <Outlet />
      </main>
    </>
  )
}
