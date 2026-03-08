import {
  Anchor,
  Badge,
  Button,
  Card,
  CardSection,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import {
  IconShield,
  IconBuilding,
  IconUsers,
  IconBox,
} from '@tabler/icons-react'
import ContentContainer from '@/components/layout/ContentContainer'
import { useNavigateHelpers } from '@/hooks/useNavigateHelpers'
import TitleBar from '@/components/layout/TitleBar'
import { routes } from '@/lib/routes'
import { useAuth } from '@/hooks/useAuth'

const GITHUB_URL = 'https://github.com/ched-dev/productbase'
const RAILWAY_DEPLOY_URL = 'https://railway.com/deploy/DSlwFZ?referralCode=ched_dev&utm_medium=integration&utm_source=template&utm_campaign=landing_page_1'

const features = [
  {
    icon: IconShield,
    title: 'Authentication',
    description:
      'Email/password login out of the box. Enable OAuth, OTP, MFA, and magic links via PocketBase admin panel. Cookie-based sessions, automatic token refresh, and password reset.',
  },
  {
    icon: IconBuilding,
    title: 'Organizations',
    description:
      'Multi-tenant workspaces with Owner, Admin, and Member roles. Enforced permission boundaries. Ownership transfer and admin promotion built-in.',
  },
  {
    icon: IconUsers,
    title: 'Memberships & Invites',
    description:
      'Invite users by email before they have an account. Role-based invite and removal. Unique membership constraints per user/organization.',
  },
  {
    icon: IconBox,
    title: 'One Container',
    description:
      'React frontend + PocketBase backend + SQLite database + file storage + JS hooks. Single Docker image on one port (8100). No microservices.',
  },
]

const techStack = [
  'React 19',
  'TypeScript',
  'Mantine 7',
  'PocketBase',
  'SQLite',
  'Zustand',
  'TanStack Query',
  'Vite',
  'Docker',
  'Railway',
]

const steps = [
  {
    number: 1,
    title: 'Clone',
    description: 'Fork the Railway template or clone the repository to your machine.',
  },
  {
    number: 2,
    title: 'Configure',
    description: 'Set environment variables for SMTP, S3 buckets, and your domain.',
  },
  {
    number: 3,
    title: 'Deploy',
    description: 'Push to Railway. PR preview environments are created automatically.',
  },
]

export default function LandingPage() {
  const { handleNavigate } = useNavigateHelpers()
  const { user } = useAuth()

  return (
    <>
      <TitleBar />
      <ContentContainer>
        {/* Hero Section */}
        <Stack align="center" gap="xl" py="xl" mt="xl" mb="xl">
          <Stack align="center" gap="md" maw={700}>
            <Title order={1} size="3rem" ta="center" fw={800}>
              The SaaS Starter That's Already Done the Boring Parts
            </Title>
            <Text size="lg" ta="center" c="dimmed">
              ProductBase ships with auth, multi-tenant organizations, role-based memberships, and invite flows —
              all in a single Docker container deployable to Railway in minutes.
            </Text>
          </Stack>

          {!user ? (
            <Group justify="center">
              <Button size="lg" onClick={handleNavigate(routes.appHome())}>
                Login
              </Button>
              <Button size="lg" variant="outline" onClick={handleNavigate(routes.appHome())}>
                Sign Up
              </Button>
            </Group>
          ) : (
            <Button size="lg" onClick={handleNavigate(routes.appHome())}>
              Go to App
            </Button>
          )}

          <Group justify="center" gap="sm">
            <Anchor href={GITHUB_URL} target="_blank" size="sm">
              View on GitHub
            </Anchor>
            <Text size="sm" c="dimmed">
              ·
            </Text>
            <Anchor href={RAILWAY_DEPLOY_URL} target="_blank" size="sm">
              Deploy to Railway
            </Anchor>
          </Group>
        </Stack>

        <Divider my="xl" />

        {/* Features Section */}
        <Stack align="center" gap="lg" py="xl" mb="xl">
          <Stack align="center" gap="md">
            <Title order={2} size="2.5rem" ta="center">
              Everything You Need
            </Title>
            <Text size="md" ta="center" c="dimmed" maw={600}>
              Ship faster with auth, organizations, and memberships pre-built and production-ready
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" w="100%">
            {features.map((feature) => (
              <Card key={feature.title} shadow="sm" padding="lg" radius="md" withBorder>
                <CardSection withBorder inheritPadding py="md">
                  <Group justify="flex-start" gap="md">
                    <ThemeIcon size="lg" variant="light" radius="md">
                      <feature.icon size={24} />
                    </ThemeIcon>
                    <Text fw={600} size="lg">
                      {feature.title}
                    </Text>
                  </Group>
                </CardSection>
                <CardSection inheritPadding py="md">
                  <Text size="sm" c="dimmed">
                    {feature.description}
                  </Text>
                </CardSection>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>

        <Divider my="xl" />

        {/* Tech Stack Section */}
        <Stack align="center" gap="lg" py="xl" mb="xl">
          <Title order={2} size="2rem" ta="center">
            Built With Modern Tech
          </Title>
          <Group justify="center" gap="xs" wrap="wrap">
            {techStack.map((tech) => (
              <Badge key={tech} variant="light" size="lg">
                {tech}
              </Badge>
            ))}
          </Group>
        </Stack>

        <Divider my="xl" />

        {/* How It Works Section */}
        <Stack align="center" gap="lg" py="xl" mb="xl">
          <Stack align="center" gap="md">
            <Title order={2} size="2rem" ta="center">
              How It Works
            </Title>
            <Text size="md" ta="center" c="dimmed" maw={600}>
              Get from zero to production-ready in three simple steps
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" w="100%">
            {steps.map((step) => (
              <Card key={step.number} shadow="sm" padding="lg" radius="md" withBorder>
                <CardSection withBorder inheritPadding py="md">
                  <Group justify="flex-start" gap="md">
                    <ThemeIcon size="lg" variant="filled" radius="50%">
                      <Text fw={700} c="white">
                        {step.number}
                      </Text>
                    </ThemeIcon>
                    <Text fw={600} size="lg">
                      {step.title}
                    </Text>
                  </Group>
                </CardSection>
                <CardSection inheritPadding py="md">
                  <Text size="sm" c="dimmed">
                    {step.description}
                  </Text>
                </CardSection>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>

        <Divider my="xl" />

        {/* Footer */}
        <Stack align="center" gap="md" py="xl" mt="xl">
          <Text size="sm" ta="center" c="dimmed">
            Built with PocketBase · React · TypeScript
          </Text>
          <Group justify="center" gap="sm">
            <Anchor href={GITHUB_URL} target="_blank" size="xs" c="dimmed">
              GitHub
            </Anchor>
            <Text size="xs" c="dimmed">
              ·
            </Text>
            <Anchor href={RAILWAY_DEPLOY_URL} target="_blank" size="xs" c="dimmed">
              Railway Template
            </Anchor>
          </Group>
        </Stack>
      </ContentContainer>
    </>
  )
}