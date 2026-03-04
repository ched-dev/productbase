import { useState } from 'react'
import { Fieldset, Group, Loader, Text, TextInput } from '@mantine/core'
import classes from './AuthGate.module.css'
import * as config from '@/config'
import CancelButton from './forms/CancelButton'
import EmailInput from './forms/EmailInput'
import FieldError from './forms/FieldError'
import FormError from './forms/FormError'
import SaveButton from './forms/SaveButton'
import { useFormState } from '@/hooks/useFormState'
import { useAuth } from '@/hooks/useAuth'
import type { SignUpInfo } from '@/types/Auth'

const mockAccount = config.MOCK_ACCOUNT
const hasDevAccount = Boolean(mockAccount.email && mockAccount.password)
console.log('hasDevAccount', hasDevAccount)

type AuthMode = 'login' | 'signup'

const AuthGate = ({ children }: React.PropsWithChildren) => {
  const [mode, setMode] = useState<AuthMode>('login')
  const { loading, user, login, signup } = useAuth()
  const { formRef, submitted, success, apiError, handleSubmit, reset } = useFormState()

  const isSubmitting = submitted && !success && !apiError

  const handleModeSwitch = (mode: AuthMode) => {
    reset()
    setMode(mode)
  }

  const onSubmit = async (formData: FormData) => {
    const account: SignUpInfo = {
      name: (formData.get('name') as string) || mockAccount.name,
      email: (formData.get('email') as string) || mockAccount.email,
      password: (formData.get('password') as string) || mockAccount.password,
    }

    if (mode === 'login') {
      await login(account)
    } else if (mode === 'signup') {
      await signup(account)
      handleModeSwitch('login')
    }
  }

  const renderForm = () => {
    if (loading) {
      return null
    }

    return (
      <>
        <FormError apiError={apiError} />
        {isSubmitting && (
          <p className={classes.errorMessage}>
            <Loader
              type="ring"
              color="white"
              size="xl"
              aria-label="Logging In"
            />
          </p>
        )}
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          {mode == 'signup' && (
            <Fieldset legend="Name" className={classes.fieldset}>
              <TextInput name="name" type="text" required />
              <FieldError name="name" apiError={apiError} />
            </Fieldset>
          )}
          <Fieldset legend="Email" className={classes.fieldset}>
            <EmailInput name="email" required={!hasDevAccount} />
            <FieldError name="email" apiError={apiError} />
          </Fieldset>
          <Fieldset legend="Password" className={classes.fieldset}>
            <TextInput name="password" type="password" required={!hasDevAccount} />
            <FieldError name="password" apiError={apiError} />
          </Fieldset>
          <Group className={classes.loginButton}>
            <SaveButton submit loading={isSubmitting} label={mode === 'login' ? 'Login' : 'Sign Up'} />
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
    return <>{children}</>
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

export default AuthGate
