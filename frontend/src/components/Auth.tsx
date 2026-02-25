import { FormEventHandler, useEffect, useRef, useState } from 'react'
import { Button, Fieldset, Group, Loader, Text, TextInput } from '@mantine/core'
import type { CachedUser } from '@/types'
import Icon from './Icon'
import classes from './Auth.module.css'
import * as config from '@/config'
import { refreshAuth, userLogin, userSignUp } from '@/lib/pb/auth'
import { getCachedUser } from '@/lib/pb'
import CancelButton from './CancelButton'
import { ApiError, getApiError } from '@/lib/pb/errors'
import FieldError from './FieldError'
import { SignInInfo, SignUpInfo } from '@/types/Auth'
import type { ClientResponseError } from 'pocketbase'

const mockAccount = config.MOCK_ACCOUNT

type AuthMode = 'login' | 'signup'

const Auth = () => {
  const [loading, setLoading] = useState(true)
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [user, setUser] = useState<CachedUser | null>(null)
  const [error, setError] = useState<ClientResponseError | null>(null)
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [mode, setMode] = useState<AuthMode>('login')

  const nameRef = useRef<HTMLInputElement>(null)
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

  // copy and log apiError changes
  useEffect(() => {
    if (error) {
      const apiError = getApiError(error)
      setApiError(apiError)
      console.log('Auth Failure', apiError)
    } else {
      setApiError(error)
    }
  }, [error])

  const handleModeSwitch = (mode: AuthMode) => {
    setError(null)
    setMode(mode)
  }

  const handleApiError = (error: ClientResponseError) => {
    setError(error)
    setLoadingAuth(false)
    console.error(error)
  }

  const handleSignIn = (account: SignInInfo) => {
    setApiError(null)
    setLoadingAuth(true)

    userLogin(account)
      .then((result) => {
        setLoadingAuth(false)
        const user = result.user
        setUser(user ?? null)
        console.log({ user })
      })
      .catch(handleApiError)
  }

  const handleSignUp = (account: SignUpInfo) => {
    setApiError(null)
    setLoadingAuth(true)

    userSignUp(account)
      .then((result) => {
        setLoadingAuth(false)
        handleModeSwitch('login')
      })
      .catch(handleApiError)
  }

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    const account: SignUpInfo = {
      name: nameRef.current?.value || mockAccount.name,
      email: emailRef.current?.value || mockAccount.email,
      password: passwordRef.current?.value || mockAccount.password,
    }

    if (mode === 'login') {
      handleSignIn(account)
    } else if (mode === 'signup') {
      handleSignUp(account)
    }
  }

  const renderForm = () => {
    if (loading) {
      return null
    }

    return (
      <>
        {apiError && (
          <Group className={classes.errorMessage}>
            <Icon type="error" size={30} stroke={1.4} />
            <span>{apiError.message}</span>
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
          {mode == 'signup' && (
            <Fieldset legend="Name" className={classes.fieldset}>
              <TextInput ref={nameRef} name="name" type="text" required />
              <FieldError name="name" apiError={apiError} />
            </Fieldset>
          )}
          <Fieldset legend="Email" className={classes.fieldset}>
            <TextInput ref={emailRef} name="email" type="text" required />
            <FieldError name="email" apiError={apiError} />
          </Fieldset>
          <Fieldset legend="Password" className={classes.fieldset}>
            <TextInput ref={passwordRef} name="password" type="password" required />
            <FieldError name="password" apiError={apiError} />
          </Fieldset>
          <Group className={classes.loginButton}>
            <Button type="submit">{mode === 'login' ? 'Login' : 'Sign Up'}</Button>
          </Group>
          <Group className={classes.loginButton}>
            {mode === 'login' ? (
              <CancelButton onClick={() => handleModeSwitch('signup')} label="Don't have an account? Sign up" />
            ) : (
              <CancelButton onClick={() => handleModeSwitch('login')} label="Already have an account? Login" />
            )}
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
