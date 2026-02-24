import { FormEventHandler, useEffect, useRef, useState } from 'react'
import { Button, Fieldset, Group, Loader, Text, TextInput } from '@mantine/core'
import type { CachedUser } from '@/types'
import Icon from './Icon'
import classes from './Auth.module.css'
import * as config from '@/config'
import { refreshAuth, userLogin } from '@/lib/pb/auth'
import { getCachedUser } from '@/lib/pb'

type SignInInfo = typeof emptyAccount
const emptyAccount = { email: '', password: '' }
const mockAccount = config.MOCK_ACCOUNT

type ErrorMessages = keyof typeof errorMessages
// TODO: convert to pb
const errorMessages = {
  'auth/user-not-found': 'Email invalid',
  'auth/wrong-password': 'Bad password',
  'auth/invalid-email': 'Email invalid',
  'auth/too-many-requests': 'Too many failed attempts',
  'auth/unknown-error': 'An unknown error occurred'
}

const Auth = () => {
  const [loading, setLoading] = useState(true)
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [user, setUser] = useState<CachedUser | null>(null)
  const [error, setError] = useState<{ code: ErrorMessages } | null>(null)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // check auth
  useEffect(() => {
    refreshAuth().then(x => {
      setLoading(false)
      setLoadingAuth(false)
      const user = getCachedUser()
      setUser(user)
      console.log({ user })
    })
  }, [])

  const signIn = (account: SignInInfo) => {
    setError(null)
    setLoadingAuth(true)

    userLogin(account.email, account.password)
      .then((result) => {
        // logged in
        if ('user' in result) {
          const user = result.user
          setUser(user)
          console.log({ user })
        }
        if ('error' in result) {
          setError({ code: 'auth/unknown-error' })
          console.log('auth/unknown-error', result.error)
        }
      })
      .catch((error) => {
        setError(error)
        setLoadingAuth(false)
        console.error(error)
      })
  }

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const accountData = {
      email: emailRef.current?.value || mockAccount.email,
      password: passwordRef.current?.value || mockAccount.password,
    }

    signIn(accountData)
  }

  const renderForm = () => {
    if (loading) {
      return null
    }

    return (
      <>
        {error && (
          <Group className={classes.errorMessage}>
            <Icon type="error" size={30} stroke={1.4} />
            <span>{errorMessages[error.code] || error.code}</span>
          </Group>
        )}
        {loadingAuth && (
          <p className={classes.errorMessage}>
            <Loader
              type="ring"
              color="white"
              size="xl"
              aria-label="Logging In"
            />
          </p>
        )}
        <form onSubmit={onSubmit}>
          <Fieldset legend="Email" className={classes.fieldset}>
            <TextInput ref={emailRef} type="text" />
          </Fieldset>
          <Fieldset legend="Password" className={classes.fieldset}>
            <TextInput ref={passwordRef} type="password" />
          </Fieldset>
          <Group className={classes.loginButton}>
            <Button type="submit">Login</Button>
          </Group>
        </form>
      </>
    )
  }

  if (user) {
    return null
  }

  return (
    <section className={classes.authScreen}>
      <Text component="h1" className={classes.title}>
        ProductBase
      </Text>
      {loading && (
        <Loader type="ring" color="white" size="xl" aria-label="Loading App" />
      )}
      {renderForm()}
    </section>
  )
}

export default Auth
