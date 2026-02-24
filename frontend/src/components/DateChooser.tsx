import React, { useRef, useState } from 'react'
import { Box, Button, ButtonProps, Fieldset, Group, Text } from '@mantine/core'
import ActionIconButton from './ActionIconButton'
import Icon from './Icon'

// Utility functions
const getLastSelectedDate = (): string => {
  return window.localStorage.trackerLastSelectedDate
}

const setLastSelectedDate = (date: string): void => {
  window.localStorage.trackerLastSelectedDate = date
}

const getToday = (): string => {
  return getDateStringValue(new Date())
}

const getDateStringValue = (date: Date): string => {
  return [
    date.getFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

const getDateDisplay = (date: Date): string => {
  return date.toLocaleDateString(undefined, { timeZone: 'UTC' })
}

const addDays = (date: Date, days: number): Date => {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + days,
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  )
}

interface DateChooserFieldProps {
  onChange: (timestamp: number) => void
}

const DateChooserField: React.FC<DateChooserFieldProps> = ({
  onChange = () => {},
}) => {
  const [lastSelectedDate, setLastSelectedDateState] =
    useState<string>(getToday())
  const inputRef = useRef<HTMLInputElement>(null)

  const getLastSelectedDateFormatted = (): string => {
    return getDateDisplay(new Date(getLastSelectedDate()))
  }

  const setToLastSelectedDate = (): void => {
    updateDate(getLastSelectedDate())
  }

  const updateDate = (date: string): void => {
    setLastSelectedDate(date)
    setLastSelectedDateState(date)

    // use current timestamp if today
    if (date === getToday()) {
      onChange(Date.now())
      return
    }

    // fix date/time for older dates
    const [, month, day] = date.split('-')
    const newDate = new Date(date)
    newDate.setHours(12) // set to noon
    newDate.setDate(Number(day))
    newDate.setMonth(Number(month) - 1)
    const timestamp = newDate.getTime()
    onChange(timestamp)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newDate = e.target.value
    updateDate(newDate)
  }

  const setToToday = (): void => {
    updateDate(getToday())
  }

  const setDayBefore = (): void => {
    const date = addDays(new Date(lastSelectedDate), -1)
    updateDate(getDateStringValue(date))
  }

  const setDayAfter = (): void => {
    const date = addDays(new Date(lastSelectedDate), 1)
    updateDate(getDateStringValue(date))
  }

  const selectorButtonProps: ButtonProps = {
    variant: 'filled',
    color: 'gray',
    size: 'compact-sm',
  }

  return (
    <Fieldset legend="Date">
      <Group gap="sm" p="sm">
        <small>Set to:</small>
        <Button
          {...selectorButtonProps}
          onClick={setToToday}
          leftSection={<Icon type="date" />}
        >
          Today
        </Button>
        {getLastSelectedDate() &&
          getLastSelectedDate() !== lastSelectedDate && (
            <Button {...selectorButtonProps} onClick={setToLastSelectedDate}>
              Last Selected ({getLastSelectedDateFormatted()})
            </Button>
          )}
      </Group>
      <Group gap="xs">
        <ActionIconButton
          type="left"
          onClick={setDayBefore}
          ariaLabel="Back one day"
        />
        <input
          ref={inputRef}
          type="date"
          name="timestamp"
          onChange={handleChange}
          value={lastSelectedDate}
        />
        <ActionIconButton
          type="right"
          onClick={setDayAfter}
          ariaLabel="Add one day"
        />
      </Group>
    </Fieldset>
  )
}

export default DateChooserField
