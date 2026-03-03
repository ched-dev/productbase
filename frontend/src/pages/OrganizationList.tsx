import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Group, Stack, Text } from '@mantine/core'
import LoadingIcon from '@/components/LoadingIcon'
import ScreenBody from '@/components/layout/ScreenBody'
import MembershipBadge from '@/components/badges/MembershipBadge'
import { useOrganizationsCollection } from '@/queryHooks'
import { usePbClient } from '@/lib/pb/client'
import type { PBDataList } from '@/lib/pb/data'
import ContentContainer from '@/components/layout/ContentContainer'

export default function OrganizationList() {
  const orgs = useOrganizationsCollection()
  const pb = usePbClient()
  const currentUserId = pb.authStore.record?.id

  useEffect(() => {
    orgs.listMyOrgs()
  }, [])

  const orgList = orgs.data as PBDataList | undefined

  return (
    <ScreenBody>
      <ContentContainer>
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
                  {(() => {
                    const memberships = (org.memberships as Array<Record<string, unknown>>) || []
                    const myMembership = memberships.find((m) => {
                      const uid = (m.user as Record<string, unknown>)?.id || m.user
                      return uid === currentUserId
                    })
                    return myMembership ? <MembershipBadge role={myMembership.role as string} /> : null
                  })()}
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </ContentContainer>
    </ScreenBody>
  )
}
