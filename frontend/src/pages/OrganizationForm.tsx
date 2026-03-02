import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Fieldset, Group, Select, Stack, Text, TextInput, Textarea } from '@mantine/core'
import ScreenBody from '@/components/layout/ScreenBody'
import SaveButton from '@/components/forms/SaveButton'
import FormError from '@/components/forms/FormError'
import FieldError from '@/components/forms/FieldError'
import CancelButton from '@/components/forms/CancelButton'
import LoadingIcon from '@/components/LoadingIcon'
import { useFormState } from '@/hooks/useFormState'
import { useOrganizationsCollection, useMembershipsCollection } from '@/queryHooks'
import { navigate } from '@/lib/navigate'
import type { PBData, PBDataList } from '@/lib/pb/data'

export default function OrganizationForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const orgs = useOrganizationsCollection()
  const members = useMembershipsCollection()
  const [transferTarget, setTransferTarget] = useState<string | null>(null)

  const { formRef, apiError, handleSubmit } = useFormState({
    onSuccess: () => {
      if (isEdit) {
        navigate(`/organizations/${id}`)
      } else {
        navigate('/organizations')
      }
    },
  })

  const { formRef: transferFormRef, apiError: transferError, handleSubmit: handleTransferSubmit } = useFormState({
    onSuccess: () => {
      navigate(`/organizations/${id}`)
    },
  })

  useEffect(() => {
    if (id) {
      orgs.getOne(id, { expand: 'owner' })
      members.listByOrg(id)
    }
  }, [id])

  if (isEdit && (orgs.loading || !orgs.data)) {
    return <ScreenBody><LoadingIcon /></ScreenBody>
  }

  const org = isEdit ? (orgs.data as PBData) : null
  const memberList = members.data as PBDataList | undefined
  const memberItems = memberList?.items || []
  const nonOwnerMembers = memberItems.filter((m) => m.role !== 'owner' && m.user)

  const onSubmit = async (formData: FormData) => {
    if (isEdit && id) {
      await orgs.update(id, {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      })
    } else {
      await orgs.create(formData)
    }
  }

  const onTransferSubmit = async () => {
    if (transferTarget && id) {
      const membership = nonOwnerMembers.find((m) => m.id === transferTarget)
      if (membership) {
        await orgs.transferOwnership(id, membership.user as string)
      }
    }
  }

  return (
    <ScreenBody>
      <h1>{isEdit ? 'Edit Organization' : 'Create Organization'}</h1>

      <FormError apiError={apiError} />

      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Stack gap="sm">
          <Fieldset legend="Name">
            <TextInput
              name="name"
              required
              defaultValue={org ? (org.name as string) : ''}
              placeholder="Organization name"
            />
            <FieldError name="name" apiError={apiError} />
          </Fieldset>

          <Fieldset legend="Description">
            <Textarea
              name="description"
              defaultValue={org ? ((org.description as string) || '') : ''}
              placeholder="Optional description"
              autosize
              minRows={2}
            />
            <FieldError name="description" apiError={apiError} />
          </Fieldset>

          <Group>
            <CancelButton onClick={() => navigate(isEdit ? `/organizations/${id}` : '/organizations')} />
            <SaveButton submit loading={orgs.loading} label={isEdit ? 'SAVE' : 'CREATE'} />
          </Group>
        </Stack>
      </form>

      {isEdit && org && (
        <>
          <Text fw={600} size="lg" mt="xl" mb="sm">Transfer Ownership</Text>
          <Text size="sm" c="dimmed" mb="sm">
            Transfer ownership to another member. You will become an admin.
          </Text>

          <FormError apiError={transferError} />

          {nonOwnerMembers.length === 0 ? (
            <Text size="sm" c="dimmed">No other members to transfer ownership to. Invite members first.</Text>
          ) : (
            <form
              ref={transferFormRef}
              onSubmit={handleTransferSubmit(onTransferSubmit)}
            >
              <Group>
                <Select
                  placeholder="Select a member"
                  data={nonOwnerMembers.map((m) => ({
                    value: m.id,
                    label: (m.user as Record<string, unknown>)?.name
                      ? `${(m.user as Record<string, unknown>).name} (${m.role})`
                      : `${(m.invite_email as string) || m.user} (${m.role})`,
                  }))}
                  value={transferTarget}
                  onChange={setTransferTarget}
                />
                <SaveButton submit loading={orgs.loading} label="TRANSFER" disabled={!transferTarget} />
              </Group>
            </form>
          )}
        </>
      )}
    </ScreenBody>
  )
}
