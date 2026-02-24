import React from 'react'
import moment from 'moment'
import SettingsContext, { SettingsContextType } from '@/context/SettingsContext'

export function getUserDateFormat(): DateDisplayFormat['name'] | undefined {
  return window.localStorage.trackerUserDateFormat
}

export function setUserDateFormat(format: string): void {
  window.localStorage.trackerUserDateFormat = format
}

export interface DateDisplayFormat {
  name: 'time-ago' | 'local'
  formatter: (timestamp: number) => string
}

interface DateDisplayProps {
  timestamp: number | null
}

const dateFormats: DateDisplayFormat[] = [
  {
    name: 'local',
    formatter: (timestamp) =>
      new Date(timestamp).toLocaleString().replace(/\:\d\d\s/, ' '),
  },
  {
    name: 'time-ago',
    formatter: (timestamp) => moment(timestamp, 'x').fromNow(),
  },
]

const DateDisplay: React.FC<DateDisplayProps> = ({ timestamp = null }) => {
  const switchDateFormat = (
    currentDateFormat: string,
    setContextState: (state: Partial<SettingsContextType>) => void
  ) => {
    const currentFormatIndex = dateFormats.findIndex(
      (format) => format.name === currentDateFormat
    )
    const nextFormat = (dateFormats[currentFormatIndex + 1] || dateFormats[0])
      .name
    const newState = { dateFormat: nextFormat }
    setUserDateFormat(nextFormat)
    setContextState(newState)
  }

  return (
    <SettingsContext.Consumer>
      {(settings: SettingsContextType) => {
        const dateFormat =
          dateFormats.find((format) => format.name === settings.dateFormat) ||
          dateFormats[0]

        if (!dateFormat || timestamp === null) {
          return null
        }

        return (
          <span
            onClick={() =>
              switchDateFormat(settings.dateFormat, settings.setContextState)
            }
          >
            {dateFormat.formatter(timestamp)}
          </span>
        )
      }}
    </SettingsContext.Consumer>
  )
}

export default DateDisplay
