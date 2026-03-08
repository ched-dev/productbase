import { Card, ThemeIcon, Title, Text } from "@mantine/core";
import { colors } from "./colors";

const fontFamily = "'Plus Jakarta Sans', sans-serif";

interface FeatureCardProps {
  icon: React.ComponentType<{ size: number; stroke: number }>;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card
      padding="xl"
      radius={0}
      h="100%"
      styles={{
        root: {
          pointerEvents: "auto",
          borderRadius: "10px",
          background: colors.surface,
          // border: `1px solid ${colors.border}`,
          transition: "all 0.35s cubic-bezier(.16,1,.3,1)",
          overflow: "visible",
          position: "relative",
          paddingTop: "50px",
          "&:hover": {
            borderColor: colors.borderLight,
            background: colors.surfaceHover,
            transform: "translateY(-3px)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
          },
        },
      }}
    >
      <ThemeIcon
        size={80}
        radius={10}
        variant="light"
        style={{
          position: "absolute",
          top: "-36px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
        styles={{
          root: {
            background: `${colors.surface}ff`,
            // border: `1px solid ${colors.border}`,
            color: colors.accent,
            transition: "transform 0.3s ease",
          },
        }}
      >
        <Icon size={48} stroke={1.5} />
      </ThemeIcon>

      <Title
        order={3}
        mb={14}
        ta="center"
        style={{
          fontFamily: fontFamily,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: colors.text,
        }}
      >
        {title}
      </Title>

      <Text fz={13} c={colors.textSec} lh={1.55} ta="center">
        {description}
      </Text>
    </Card>
  );
}
