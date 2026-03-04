import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, Group, Stack, Text } from '@mantine/core'
import { routes } from '@/lib/routes'
import { useNavigateHelpers } from '@/hooks/useNavigateHelpers'
import MembershipBadge from '@/components/badges/MembershipBadge'
import SelfBadge from '@/components/badges/SelfBadge'
import LoadingIcon from '@/components/LoadingIcon'
import NotFoundView from '@/components/NotFoundView'
import ScreenBody from '@/components/layout/ScreenBody'
import SecondaryButton from '@/components/forms/SecondaryButton'
import { useOrganizationsCollection, useMembershipsCollection } from '@/queryHooks'
import { usePbClient } from '@/lib/pb/client'
import type { PBData, PBDataList } from '@/lib/pb/data'
import type { User } from '@/types/User'
import ContentContainer from '@/components/layout/ContentContainer'

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>()
  const { navigate } = useNavigateHelpers()
  const orgs = useOrganizationsCollection()
  const members = useMembershipsCollection()
  const pb = usePbClient()
  const currentUserId = pb.authStore.record?.id

  useEffect(() => {
    if (id) {
      orgs.getOne(id, { expand: 'owner' })
      members.listByOrg(id)
    }
  }, [id])

  const org = orgs.data as PBData | undefined
  const memberList = members.data as PBDataList | undefined

  if (!id) {
    navigate(routes.organizations.list())
    return null
  }

  if (orgs.loading) {
    return <ScreenBody><LoadingIcon /></ScreenBody>
  }

  if (orgs.error?.status === 404 || !org) {
    return (
      <NotFoundView
        message="Organization not found."
        backTo={routes.organizations.list()}
        backLabel="Back to Organizations"
      />
    )
  }

  const ownerId = (org.owner as User)?.id || (org.owner as string)
  const isOwner = ownerId === currentUserId
  const memberItems = memberList?.items || []

  return (
    <ScreenBody>
      <ContentContainer>
        <Group justify="space-between" mb="lg">
          <div>
            <h1>{org.name as string}</h1>
            {org.description ? (
              <Text c="dimmed">{String(org.description)}</Text>
            ) : null}
          </div>
          <Group>
            {isOwner && (
              <SecondaryButton label="Settings" href={routes.organizations.edit({ id })} />
            )}
            <Button component={Link} to={routes.organizations.members({ id })}>
              Members ({memberItems.length})
            </Button>
          </Group>
        </Group>

        <Text fw={600} size="lg" mb="sm">Members</Text>
        {members.loading ? (
          <LoadingIcon />
        ) : memberItems.length === 0 ? (
          <Text c="dimmed">No members yet.</Text>
        ) : (
          <Stack gap="xs">
            {memberItems.slice(0, 5).map((member) => (
              <Card key={member.id} shadow="xs" padding="sm" withBorder>
                <Group justify="space-between">
                  <Group gap="xs">
                    <Text>
                      {(member.user as User)?.name as string
                        || (member.user as User)?.email as string
                        || (member.invite_email as string)
                        || 'Hidden Member'}
                    </Text>
                    {((member.user as User)?.id || (member.user as string)) === currentUserId && (
                      <SelfBadge />
                    )}
                  </Group>
                  <MembershipBadge role={member.role as string} />
                </Group>
              </Card>
            ))}
            {memberItems.length > 5 && (
              <SecondaryButton label={`View all ${memberItems.length} members`} href={routes.organizations.members({ id })} />
            )}
          </Stack>
        )}
      </ContentContainer>
    </ScreenBody>
  )
}
