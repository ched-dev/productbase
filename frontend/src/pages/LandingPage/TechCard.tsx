import { Card, Title, Text, Group, Box } from "@mantine/core";
import { colors } from "./colors";

const fontFamily = "'Plus Jakarta Sans', sans-serif";

interface TechCardProps {
  icon: React.ComponentType<{ size: number; stroke: number }>;
  title: string;
  description: string;
  color: string;
}

export function TechCard({ icon: Icon, title, description, color }: TechCardProps) {
  return (
    <Card
      padding="xl"
      radius={0}
      styles={{
        root: {
          pointerEvents: "auto",
          borderRadius: "10px",
          background: colors.surface,
          // border: `1px solid ${colors.border}`,
          overflow: "visible",
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: colors.borderLight,
            background: colors.surfaceHover,
          },
        },
      }}
    >
      <Group gap={8} mb={10} align="flex-start">
        <Box style={{ color }}>
          <Icon size={24} stroke={1.5} />
        </Box>
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
      </Group>
      <Text fz={13} c={colors.textSec} lh={1.55}>
        {description}
      </Text>
    </Card>
  );
}
