import { Button, Card, CardSection, Grid, Text, Stack, Group } from '@mantine/core'
import ContentContainer from '@/components/layout/ContentContainer'
import { useNavigateHelpers } from '@/hooks/useNavigateHelpers'
import TitleBar from '@/components/layout/TitleBar'
import { routes } from '@/lib/routes'
import { useAuth } from '@/hooks/useAuth'
import useAppStore from '@/stores/AppStore'

export default function LandingPage() {
  const { handleNavigate } = useNavigateHelpers()
  const { user } = useAuth()

  return (
    <>
      <TitleBar />
      <ContentContainer>
        {/* Hero Section */}
        <Stack align="center" py="xl">
          <Text size="4xl" mb="md">
            ProductBase
          </Text>
          <Text size="lg" mb="xl" style={{ textAlign: 'center' }}>
            A Product Starter Template for Pocketbase
          </Text>
          <Text size="sm" mb="xl" style={{ textAlign: 'center', maxWidth: '600px' }}>
            Spin up a new Pocketbase project with the base configuration for a product. Features include user signup flow, organizations, user feedback widget, and more.
          </Text>
          {!user ? (
            <Group justify="center">
              <Button size="lg" onClick={handleNavigate(routes.appHome())}>
                Login
              </Button>
              <Button size="lg" variant="outline" onClick={handleNavigate(routes.appHome())}>
                Sign Up
              </Button>
            </Group>
          ): (
            <Group justify="center">
              <Button variant="filled" size="lg" onClick={handleNavigate(routes.appHome())}>
                Get Started
              </Button>
            </Group>
          )}
          
        </Stack>

        {/* Features Section */}
        <Stack align="center" py="xl" mt="lg">
          <Text size="3xl" mb="md">
            Features
          </Text>
          <Text size="sm" mb="xl" style={{ textAlign: 'center', maxWidth: '600px' }}>
            Everything you need to build your next product
          </Text>

          <Grid breakpoints={{ xs: '1', sm: '2', md: '3', lg: '4', xl: '4' }}>
            <Card>
              <CardSection>
                <Text>User Signup Flow</Text>
              </CardSection>
              <CardSection>
                <Text size="sm">
                  Open/Close registrations, email verification, forgot password reset
                </Text>
              </CardSection>
            </Card>

            <Card>
              <CardSection>
                <Text>Organizations</Text>
              </CardSection>
              <CardSection>
                <Text size="sm">
                  Multi-tenant workspaces with role-based access control
                </Text>
              </CardSection>
            </Card>

            <Card>
              <CardSection>
                <Text>User Feedback Widget</Text>
              </CardSection>
              <CardSection>
                <Text size="sm">
                  Prebuilt feedback collection with reply functionality
                </Text>
              </CardSection>
            </Card>

            <Card>
              <CardSection>
                <Text>Frontend</Text>
              </CardSection>
              <CardSection>
                <Text size="sm">
                  React + Mantine with reusable components and TypeScript support
                </Text>
              </CardSection>
            </Card>
          </Grid>
        </Stack>

        {/* Footer */}
        <Stack align="center" py="xl" mt="lg">
          <Text size="sm" style={{ textAlign: 'center' }}>
            Built with ❤️ using PocketBase
          </Text>
          <Text size="xs" style={{ textAlign: 'center', color: 'gray.6' }}>
            ProductBase is a collection of features commonly included when building a new software product
          </Text>
        </Stack>
      </ContentContainer>
    </>
  )
}