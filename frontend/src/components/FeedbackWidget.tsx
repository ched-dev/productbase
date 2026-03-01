import { useState } from 'react'
import { Alert, Button, Group, Popover, Radio, Stack, Switch, Text, Textarea } from '@mantine/core'
import { useUserFeedbackCollection } from '@/queryHooks'
import { useFormState } from '@/hooks/useFormState'
import CancelButton from './CancelButton'
import FieldError from './FieldError'
import Icon from './Icon'

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report', description: 'Something isn\'t working as expected' },
  { value: 'feature', label: 'Feature Request', description: 'Suggest an improvement or new capability' },
  { value: 'general', label: 'General Feedback', description: 'Anything else on your mind' },
]

export default function FeedbackWidget() {
  const feedback = useUserFeedbackCollection()

  const [opened, setOpened] = useState(false)
  const [feedbackType, setFeedbackType] = useState<string | null>(null)

  const form = useFormState({
    onSuccess: () => setTimeout(() => setOpened(false), 10_000),
    onReset: () => setFeedbackType(null),
  })

  const onSubmit = form.handleSubmit(async (formData) => {
    if (!feedbackType) return false
    formData.set('feedback_type', feedbackType)
    formData.set('reply_desired', String(formData.has('reply_desired')))
    return await feedback.create(formData)
  })

  const renderForm = () => (
    <form ref={form.formRef} onSubmit={onSubmit}>
      <Stack gap="sm">
        <Radio.Group
          label="Type"
          value={feedbackType ?? ''}
          onChange={setFeedbackType}
          error={form.submitted && !feedbackType ? 'Please select a type' : undefined}
        >
          <Stack gap="xs" mt="xs">
            {FEEDBACK_TYPES.map(({ value, label, description }) => (
              <Radio.Card key={value} value={value} radius="sm">
                <Group wrap="nowrap" align="flex-start" p="xs">
                  <Radio.Indicator mt={2} />
                  <div>
                    <Text size="sm">{label}</Text>
                    <Text size="xs" c="dimmed">{description}</Text>
                  </div>
                </Group>
              </Radio.Card>
            ))}
          </Stack>
        </Radio.Group>
        <div>
          <Textarea
            name="message"
            label="Message"
            placeholder="Describe your feedback..."
            required
            minRows={3}
          />
          <FieldError name="message" apiError={feedback.error} />
        </div>
        <Switch
          name="reply_desired"
          label="I'd like a reply"
        />
        {feedback.error && !feedback.error.hasValidationErrors() && (
          <Alert color="red" icon={<Icon type="error" size="sm" />}>
            {feedback.error.message}
          </Alert>
        )}
        <Group justify="flex-end">
          <CancelButton onClick={() => setOpened(false)} />
          <Button type="submit" color="teal" loading={feedback.loading}>
            Submit
          </Button>
        </Group>
      </Stack>
    </form>
  )

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      transitionProps={{ onExited: form.reset }}
      position="bottom-end"
      withArrow
      shadow="md"
      width={360}
    >
      <Popover.Target>
        <Button
          variant="transparent"
          size="sm"
          leftSection={<Icon type="feedback" size="sm" />}
          onClick={() => setOpened(o => !o)}
        >
          Provide Feedback
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        {form.success ? (
          <Alert color="teal" icon={<Icon type="check" size="sm" />}>
            Feedback sent. Thank you!
          </Alert>
        ) : (
          renderForm()
        )}
      </Popover.Dropdown>
    </Popover>
  )
}
