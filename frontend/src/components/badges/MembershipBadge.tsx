import { Badge } from '@mantine/core'

const ROLE_COLORS: Record<string, string> = {
  owner: 'yellow',
  admin: 'blue',
  member: 'gray',
}

export default function MembershipBadge({ role }: { role: string }) {
  return (
    <Badge variant="light" color={ROLE_COLORS[role] || 'gray'}>
      {role}
    </Badge>
  )
}
