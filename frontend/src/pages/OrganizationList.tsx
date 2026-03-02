import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Group, Stack, Text, Badge } from '@mantine/core'
import LoadingIcon from '@/components/LoadingIcon'
import ScreenBody from '@/components/layout/ScreenBody'
import { useOrganizationsCollection } from '@/queryHooks'
import type { PBDataList } from '@/lib/pb/data'

export default function OrganizationList() {
  const orgs = useOrganizationsCollection()

  useEffect(() => {
    orgs.listMyOrgs()
  }, [])

  const orgList = orgs.data as PBDataList | undefined

  return (
    <ScreenBody>
      <Group justify="space-between" mb="lg">
        <h1>Organizations</h1>
        <Button component={Link} to="/organizations/new">
          Create Organization
        </Button>
      </Group>

      {orgs.loading || !orgList ? (
        <LoadingIcon />
      ) : orgList.items.length === 0 ? (
        <Text c="dimmed">No organizations yet. Create one to get started.</Text>
      ) : (
        <Stack gap="sm">
          {orgList.items.map((org) => (
            <Card key={org.id} shadow="xs" padding="md" withBorder component={Link} to={`/organizations/${org.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Group justify="space-between">
                <div>
                  <Text fw={600}>{org.name as string}</Text>
                  {org.description ? (
                    <Text size="sm" c="dimmed">{String(org.description)}</Text>
                  ) : null}
                </div>
                <Badge variant="light" color="blue">
                  {(org.owner as Record<string, unknown>)?.name
                    ? `Owner: ${(org.owner as Record<string, unknown>).name}`
                    : 'Owner'}
                </Badge>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </ScreenBody>
  )
}
