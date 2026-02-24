import {
  createTheme,
  Loader,
  MantineSize,
  MantineThemeOverride,
  rem,
} from '@mantine/core'
import RingLoader from '@/components/RingLoader'

const ICON_SIZES: Record<MantineSize, number> = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 26,
  xl: 40,
}

const additionalSettings = {
  iconSizes: ICON_SIZES,
}

const chartColors = ['red','pink','grape','violet','indigo','blue','cyan','teal','green','lime','yellow','orange']
const shades = { light: [3,4,5,6,7,8,9], dark: [1,2,3,4,5,6,7] }

export function getRandomChartColor(colorScheme: 'light' | 'dark', usedColors: string[]): string | null {
  const availableColors = chartColors.flatMap(color =>
    shades[colorScheme].map(shade => `${color}-${shade}`)
  ).filter(colorShade => !usedColors.includes(colorShade))

  if (availableColors.length === 0) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * availableColors.length)
  return availableColors[randomIndex]
}


export const theme = createTheme({
  primaryColor: 'dark',
  fontFamily: 'Roboto Condensed, sans-serif',
  spacing: {
    xxs: rem(2),
    xs: rem(4),
    sm: rem(6),
    md: rem(10),
  },
  colors: {
    brand: [
      'seagreen',
      'seagreen',
      'seagreen',
      'seagreen',
      'seagreen',
      'seagreen',
      'seagreen',
      'seagreen',
      'seagreen',
      'seagreen',
    ],
  },
  components: {
    Loader: Loader.extend({
      defaultProps: {
        loaders: { ...Loader.defaultLoaders, ring: RingLoader },
      },
    }),
  },
  other: additionalSettings,
}) as MantineThemeOverride & { other: typeof additionalSettings }
