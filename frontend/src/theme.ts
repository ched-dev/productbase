import {
  createTheme,
  defaultVariantColorsResolver,
  Loader,
  MantineSize,
  MantineThemeOverride,
  rem,
  VariantColorsResolver,
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


const variantColorResolver: VariantColorsResolver = (input) => {
  const defaultResolvedColors = defaultVariantColorsResolver(input)

  if (input.variant === 'primary') {
    return {
      background: 'var(--mantine-color-blue-6)',
      hover: 'var(--mantine-color-blue-7)',
      color: 'var(--mantine-color-white)',
      border: 'none',
    }
  }

  if (input.variant === 'secondary') {
    return {
      background: 'var(--mantine-color-gray-6)',
      hover: 'var(--mantine-color-gray-7)',
      color: 'var(--mantine-color-white)',
      border: 'none',
    }
  }

  if (input.variant === 'success') {
    return {
      background: 'var(--mantine-color-teal-6)',
      hover: 'var(--mantine-color-teal-7)',
      color: 'var(--mantine-color-white)',
      border: 'none',
    }
  }

  if (input.variant === 'danger') {
    return {
      background: 'var(--mantine-color-red-6)',
      hover: 'var(--mantine-color-red-7)',
      color: 'var(--mantine-color-white)',
      border: 'none',
    }
  }

  if (input.variant === 'warning') {
    return {
      background: 'var(--mantine-color-yellow-6)',
      hover: 'var(--mantine-color-yellow-7)',
      color: 'var(--mantine-color-black)',
      border: 'none',
    }
  }

  if (input.variant === 'info') {
    return {
      background: 'var(--mantine-color-cyan-6)',
      hover: 'var(--mantine-color-cyan-7)',
      color: 'var(--mantine-color-white)',
      border: 'none',
    }
  }

  return defaultResolvedColors
}

export const theme = createTheme({
  variantColorResolver,
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
