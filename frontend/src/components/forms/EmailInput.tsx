import { TextInput, type TextInputProps } from '@mantine/core'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INVALID_EMAIL_ADDRESS_MESSAGE = 'Please enter a valid email address'

type EmailInputProps = Omit<TextInputProps, 'type'>

export default function EmailInput({ onBlur, onChange, ...props }: EmailInputProps) {
  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = e.currentTarget.value
    if (value && !EMAIL_REGEX.test(value)) {
      e.currentTarget.setCustomValidity(INVALID_EMAIL_ADDRESS_MESSAGE)
    }
    onBlur?.(e)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.currentTarget.setCustomValidity('')
    onChange?.(e)
  }

  return <TextInput type="email" onBlur={handleBlur} onChange={handleChange} {...props} />
}
