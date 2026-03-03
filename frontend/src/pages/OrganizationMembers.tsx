import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, Fieldset, Group, Select, Stack, Text } from '@mantine/core'
import LoadingIcon from '@/components/LoadingIcon'
import MembershipBadge from '@/components/badges/MembershipBadge'
import SelfBadge from '@/components/badges/SelfBadge'
import ScreenBody from '@/components/layout/ScreenBody'
import SaveButton from '@/components/forms/SaveButton'
import FormError from '@/components/forms/FormError'
import FieldError from '@/components/forms/FieldError'
import EmailInput from '@/components/forms/EmailInput'
import { useFormState } from '@/hooks/useFormState'
import { useOrganizationsCollection, useMembershipsCollection } from '@/queryHooks'
import { usePbClient } from '@/lib/pb/client'
import type { PBData, PBDataList } from '@/lib/pb/data'
import ContentContainer from '@/components/layout/ContentContainer'
import ConfirmationMessage from '@/components/forms/ConfirmationMessage'

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

  if (orgs.loading || !org) {
    return <ScreenBody><LoadingIcon /></ScreenBody>
  }

  const ownerId = (org.owner as Record<string, unknown>)?.id || (org.owner as string)
  const isOwner = ownerId === currentUserId
  const memberItems = memberList?.items || []

  // check if current user is admin
  const currentMembership = memberItems.find(
    (m) => {
      const memberUserId = (m.user as Record<string, unknown>)?.id || (m.user as string)
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
              const memberUserId = (member.user as Record<string, unknown>)?.id || (member.user as string)
              const isCurrentUser = memberUserId === currentUserId
              const isMemberOwner = member.role === 'owner'

              return (
                <Card key={member.id} shadow="xs" padding="sm" withBorder>
                  <Group justify="space-between">
                    <Group>
                      <Text>
                        {(member.user as Record<string, unknown>)?.name as string
                          || (member.user as Record<string, unknown>)?.email as string
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
                            <Button variant="subtle" color="red" size="xs" onClick={open}>
                              Remove
                            </Button>
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
                            <Button variant="subtle" color="red" size="xs" onClick={open}>
                              Leave
                            </Button>
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
