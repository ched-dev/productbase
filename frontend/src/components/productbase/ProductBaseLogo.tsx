import { Box, Group, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { routes } from "@/lib/routes";
import ProductBaseRocket from "./ProductBaseRocket";
import { colors as sharedColors } from "../../pages/LandingPage/colors";

const FONT_FAMILY = "'Plus Jakarta Sans', sans-serif";

export default function ProductBaseLogo() {
  const C = sharedColors;

  return (
    <Link to={routes.publicLanding()} className="nav-logo" style={{ textUnderlineOffset: "4px", textDecorationColor: C.accent }}>
      <Group gap={3}>
        <Box
          w={32}
          h={32}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.accent,
          }}
        >
          <ProductBaseRocket
            size={32}
            stroke={1}
            className="nav-rocket"
            style={{ rotate: "-3deg" }}
          />
        </Box>
        <Text
          fw={700}
          fz={18}
          c="white"
          style={{ fontFamily: FONT_FAMILY, letterSpacing: "-0.02em" }}
        >
          ProductBase
        </Text>
      </Group>
    </Link>
  );
}
