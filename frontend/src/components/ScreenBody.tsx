import { Box } from '@mantine/core'
import NavBar from './NavBar'
import classes from './ScreenBody.module.css'

interface Props extends React.PropsWithChildren {
  hideNav?: boolean
}

export default ({ hideNav = false, children }: Props) => (
  <Box className={classes.screenBody}>
    <div className={classes.contentBody}>{children}</div>
    {hideNav != true && <NavBar />}
  </Box>
)
