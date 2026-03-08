import { Card, ThemeIcon, Title, Text, Group, Stack } from "@mantine/core";
import { colors } from "./colors";

const fontFamily = "'Plus Jakarta Sans', sans-serif";

interface AiCardProps {
  icon: React.ComponentType<{ size: number; stroke: number }>;
  title: string;
  description: string;
}

export function AiCard({ icon: Icon, title, description }: AiCardProps) {
  return (
    <Card
      padding="xl"
      radius={0}
      styles={{
        root: {
          pointerEvents: "auto",
          borderRadius: "10px",
          background: `${colors.accent}12`,
          border: `1px solid ${colors.accent}28`,
          transition: "all 0.3s ease",
          position: "relative",
          flexDirection: "row",
          "&:hover": {
            borderColor: colors.accent,
            background: colors.accentBg,
          },
        },
      }}
    >
      <Group align="flex-start" wrap="nowrap">
        <ThemeIcon
          size={70}
          radius={10}
          variant="light"
          styles={{
            root: {
              background: 'none',
              border: 'none',
              color: colors.accent,
              position: 'relative',
              left: '-20px',
              top: '-23px',
              marginRight: '-25px'
            },
          }}
        >
          <Icon size={48} stroke={1.5} />
        </ThemeIcon>

        <Stack style={{ flex: 1 }}>
          <Title
            order={3}
            style={{
              fontFamily: fontFamily,
              fontSize: 16,
              fontWeight: 700,
              color: colors.text,
            }}
          >
            {title}
          </Title>

          <Text fz={13} c={colors.textSec} lh={1.55}>
            {description}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
