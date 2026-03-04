import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Fieldset, Group, Select, Stack, Text } from '@mantine/core'
import LoadingIcon from '@/components/LoadingIcon'
import NotFoundView from '@/components/NotFoundView'
import MembershipBadge from '@/components/badges/MembershipBadge'
import SelfBadge from '@/components/badges/SelfBadge'
import ScreenBody from '@/components/layout/ScreenBody'
import SaveButton from '@/components/forms/SaveButton'
import FormError from '@/components/forms/FormError'
import FieldError from '@/components/forms/FieldError'
import EmailInput from '@/components/forms/EmailInput'
import { useFormState } from '@/hooks/useFormState'
import { routes } from '@/lib/routes'
import { useOrganizationsCollection, useMembershipsCollection } from '@/queryHooks'
import { usePbClient } from '@/lib/pb/client'
import type { PBData, PBDataList } from '@/lib/pb/data'
import type { User } from '@/types/User'
import ContentContainer from '@/components/layout/ContentContainer'
import ConfirmationMessage from '@/components/forms/ConfirmationMessage'
import DangerButton from '@/components/forms/DangerButton'

export default function OrganizationMembers() {
  const { id } = useParams<{ id: string }>()
  const orgs = useOrganizationsCollection()
  const members = useMembershipsCollection()
  const pb = usePbClient()
  const currentUserId = pb.authStore.record?.id
  const [inviteRole, setInviteRole] = useState<string | null>('member')

  const { formRef, apiError, handleSubmit, reset } = useFormState({
    onSuccess: () => {
      reset()
      if (id) members.listByOrg(id)
    },
  })

  useEffect(() => {
    if (id) {
      orgs.getOne(id, { expand: 'owner' })
      members.listByOrg(id)
    }
  }, [id])

  const org = orgs.data as PBData | undefined
  const memberList = members.data as PBDataList | undefined

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

  // check if current user is admin
  const currentMembership = memberItems.find(
    (m) => {
      const memberUserId = (m.user as User)?.id || (m.user as string)
      return memberUserId === currentUserId
    },
  )
  const isAdmin = currentMembership?.role === 'admin'
  const canManageMembers = isOwner || isAdmin

  const handleRemoveMember = async (membershipId: string) => {
    await members.delete(membershipId)
    if (id) members.listByOrg(id)
  }

  return (
    <ScreenBody>
      <ContentContainer>
        <Group justify="space-between" mb="lg">
          <h1>Members</h1>
          <Text c="dimmed">{org.name as string ?? ''}</Text>
        </Group>

        {canManageMembers && (
          <>
            <Text fw={600} mb="sm">Invite Member</Text>
            <FormError apiError={apiError} />
            <form
              ref={formRef}
              onSubmit={handleSubmit(async (formData) => {
                if (id) {
                  await members.invite(
                    id,
                    formData.get('invite_email') as string,
                    inviteRole || 'member',
                  )
                }
              })}
            >
              <Group align="flex-end" mb="lg">
                <Fieldset legend="Email">
                  <EmailInput name="invite_email" required placeholder="user@example.com" />
                  <FieldError name="invite_email" apiError={apiError} />
                </Fieldset>
                <Select
                  label="Role"
                  data={[
                    { value: 'member', label: 'Member' },
                    { value: 'admin', label: 'Admin' },
                  ]}
                  value={inviteRole}
                  onChange={setInviteRole}
                  w={120}
                />
                <SaveButton submit loading={members.loading} label="Invite" />
              </Group>
            </form>
          </>
        )}

        <Text fw={600} mb="sm">Current Members</Text>
        {members.error && (
          <FormError apiError={members.error} />
        )}
        {members.loading ? (
          <LoadingIcon />
        ) : memberItems.length === 0 ? (
          <Text c="dimmed">No members.</Text>
        ) : (
          <Stack gap="xs">
            {memberItems.map((member) => {
              const memberUserId = (member.user as User)?.id || (member.user as string)
              const isCurrentUser = memberUserId === currentUserId
              const isMemberOwner = member.role === 'owner'

              return (
                <Card key={member.id} shadow="xs" padding="sm" withBorder>
                  <Group justify="space-between">
                    <Group>
                      <Text>
                        {(member.user as User)?.name as string
                          || (member.user as User)?.email as string
                          || (member.invite_email as string)
                          || 'Pending'}
                      </Text>
                      {isCurrentUser && <SelfBadge />}
                    </Group>
                    <Group>
                      {canManageMembers && !isMemberOwner && !isCurrentUser && (
                        <ConfirmationMessage
                          message="Are you sure you want to remove this member?"
                          confirmLabel="Remove"
                          onConfirm={() => handleRemoveMember(member.id)}
                        >
                          {(open) => (
                            <DangerButton label="Remove" size="xs" onClick={open} />
                          )}
                        </ConfirmationMessage>
                      )}
                      {isCurrentUser && !isMemberOwner && (
                        <ConfirmationMessage
                          message="Are you sure you want to leave this organization?"
                          confirmLabel="Leave"
                          onConfirm={() => handleRemoveMember(member.id)}
                        >
                          {(open) => (
                            <DangerButton label="Leave" size="xs" onClick={open} />
                          )}
                        </ConfirmationMessage>
                      )}
                      <MembershipBadge role={member.role as string} />
                    </Group>
                  </Group>
                </Card>
              )
            })}
          </Stack>
        )}
      </ContentContainer>
    </ScreenBody>
  )
}
