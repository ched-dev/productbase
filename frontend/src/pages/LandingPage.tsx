import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Anchor,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Timeline,
  Title,
} from "@mantine/core";
import {
  IconDatabase,
  IconRocket,
  IconArrowRight,
  IconShieldCheck,
  IconBuildingCommunity,
  IconUsers,
  IconPackage,
  IconCode,
  IconSmartHome,
  IconCircleCheck,
  IconSchema,
  IconGitBranch,
  IconSparkles,
  IconBulb,
} from "@tabler/icons-react";
import { useNavigateHelpers } from "@/hooks/useNavigateHelpers";
import { useAuth } from "@/hooks/useAuth";
import { routes } from "@/lib/routes";
import { FeatureCard } from "./LandingPage/FeatureCard";
import { TechCard } from "./LandingPage/TechCard";
import { AiCard } from "./LandingPage/AiCard";
import { colors as sharedColors } from "./LandingPage/colors";
import ProductBaseLogo from "../components/productbase/ProductBaseLogo";
import ProductBaseRocket from "../components/productbase/ProductBaseRocket";
import styles from "./LandingPage.module.css";

const GITHUB_URL = "https://github.com/ched-dev/productbase";
const RAILWAY_DEPLOY_URL =
  "https://railway.com/deploy/DSlwFZ?referralCode=ched_dev&utm_medium=integration&utm_source=template&utm_campaign=landing_page_1";

// ─── Intersection observer hook ───
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

// ─── Reveal wrapper ───
function Reveal(
  {
  children,
  inView,
  delay = 0,
}: {
  children: ReactNode;
  inView: boolean;
  delay?: number;
}
) {
  return (
    <Box
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.65s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </Box>
  );
}

// ─── Color tokens ───
const C = {
  bg: "#231c0f",
  surface: "#2a2318",
  surfaceHover: "#332b1f",
  border: "#3d3420",
  borderLight: "#4a4028",
  accent: "#f9a406",
  accentBg: "rgba(249,164,6,0.08)",
  accentLight: "rgba(249,164,6,0.1)",
  text: "#f5f3f0",
  textSec: "#c4b8ad",
  textDim: "#8b7f77",
  react: "#61dafb",
  ts: "#3178c6",
  mantine: "#339af0",
  docker: "#2496ed",
};

// ─── Data ───
const FEATURES = [
  {
    icon: IconShieldCheck,
    title: "Auth & Security",
    description:
      "Production-ready authentication flow with magic links, social logins, and secure session management built-in.",
  },
  {
    icon: IconBuildingCommunity,
    title: "Organizations",
    description:
      "Native multi-tenant support. Isolate user data effortlessly and manage multiple workspaces under a single account.",
  },
  {
    icon: IconUsers,
    title: "Memberships",
    description:
      "Granular role-based access control (RBAC). Invite team members and manage permissions with zero extra code.",
  },
  {
    icon: IconPackage,
    title: "Single Container",
    description:
      "The entire stack—database, API, and frontend—optimized to run in a single lightweight Docker container.",
  },
];

const TECH_STACK = [
  {
    title: "React 19",
    description: "Modern UI with Server Components and Actions for maximum performance.",
    color: C.react,
    icon: IconCode,
  },
  {
    title: "TypeScript",
    description: "End-to-end type safety ensuring your code is predictable and robust.",
    color: C.ts,
    icon: IconCode,
  },
  {
    title: "Mantine 7",
    description: "A comprehensive React component library for rapid, beautiful UI development.",
    color: C.mantine,
    icon: IconCode,
  },
  {
    title: "PocketBase",
    description: "Real-time database, auth, and file storage in a single binary.",
    color: C.accent,
    icon: IconDatabase,
  },
  {
    title: "SQLite",
    description: "Zero-config, high-performance database that scales with your app.",
    color: C.textDim,
    icon: IconDatabase,
  },
  {
    title: "Docker",
    description: "Portable deployment for a consistent environment across every stage.",
    color: C.docker,
    icon: IconPackage,
  },
];

const AI_ERA = [
  {
    icon: IconSmartHome,
    title: "Prompt-Friendly Architecture",
    description:
      "Documented code structure that AI agents can easily generate new features that look like components you've written.",
  },
  {
    icon: IconCircleCheck,
    title: "E2E Type Safety",
    description:
      "TypeScript types generated directly from your schema provide the perfect guardrails for LLMs to generate correct code.",
  },
  {
    icon: IconSchema,
    title: "Schema-First Design",
    description:
      "AI-ready data structures that simplify building intelligent features like RAG, semantic search, and automated workflows.",
  },
];

const STEPS = [
  {
    icon: IconRocket,
    title: "Deploy",
    desc: "One-click deploy to Railway. Your entire stack — database, API, and frontend — is live in seconds.",
  },
  {
    icon: IconGitBranch,
    title: "Clone",
    desc: "Fork the repository and clone it locally. The codebase is clean, modular, and ready to customize.",
  },
  {
    icon: IconSparkles,
    title: "Build",
    desc: "Add your features on top of a production-ready foundation. Ship your idea, not the boilerplate.",
    lineVariant: "dashed" as const,
  },
];

// ═══════════════════════════════════════════
// Component
// ═══════════════════════════════════════════
export default function LandingPage() {
  const { user } = useAuth();
  const { handleNavigate } = useNavigateHelpers();

  const [heroRef, heroIn] = useInView(0.1);
  const [probRef, probIn] = useInView(0.15);
  const [featRef, featIn] = useInView(0.1);
  const [stackRef, stackIn] = useInView(0.15);
  const [aiRef, aiIn] = useInView(0.15);
  const [stepsRef, stepsIn] = useInView(0.1);

  const C = sharedColors;
  const fontFamily = "'Plus Jakarta Sans', sans-serif";

  const dynamicGlobalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

body {
  font-family: ${fontFamily};
}

.gradient-line {
  background: linear-gradient(90deg, #9933ff 0%, #ff4d4d 25%, #a855f7 50%, #3b82f6 75%, #10b981 100%);
  height: 2px;
  width: 100%;
}

.glass-card {
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(10px);
}

.code-window {
  background: #000;
  border: 1px solid #262626;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.timeline-line {
  position: absolute;
  left: 47px;
  width: 1px;
  background: rgba(249, 164, 6, 0.2);
}

@media (min-width: 768px) {
  .timeline-line {
    left: 50%;
    transform: translateX(-50%);
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes spin-wobble {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

.hero-layout {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.hero-layout > :first-child {
  order: 2;
}

.hero-layout > :last-child {
  order: 1;
}

@media (min-width: 768px) {
  .hero-layout {
    flex-direction: row-reverse;
    align-items: flex-start;
    justify-content: space-between;
    gap: 48px;
  }

  .hero-layout > :first-child {
    order: 1;
  }

  .hero-layout > :last-child {
    order: 2;
  }
}

.hero-buttons {
  justify-content: flex-end;
}

@media (min-width: 768px) {
  .hero-buttons {
    justify-content: flex-start;
  }
}
`;

  return (
    <>
      <style>{dynamicGlobalStyles}</style>

      <Box bg={C.bg} mih="100vh" style={{ fontFamily }}>
        {/* ═══════════ NAV ═══════════ */}
        <Box
          component="nav"
          pos="sticky"
          top={0}
          style={{
            zIndex: 50,
            background: `${C.bg}cc`,
            backdropFilter: "blur(14px)"
          }}
        >
          <Container size={1140} px="md">
            <Group justify="space-between" h={60}>
              <ProductBaseLogo />

              <Group gap="xl" visibleFrom="sm" ml="auto" mr="xl">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Stack", href: "#stack" },
                  { label: "Deploy", href: "#deploy" },
                ].map((link) => (
                  <Anchor
                    key={link.label}
                    href={link.href}
                    fz={13}
                    fw={500}
                    c={C.textSec}
                    underline="never"
                    style={{
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = C.accent)}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = C.textSec)}
                  >
                    {link.label}
                  </Anchor>
                ))}
              </Group>

              <Button
                component="a"
                href={RAILWAY_DEPLOY_URL}
                target="_blank"
                size="sm"
                radius="md"
                styles={{
                  root: {
                    pointerEvents: "auto",
                    background: C.accent,
                    color: C.text,
                    fontFamily: fontFamily,
                    fontWeight: 600,
                    "&:hover": {
                      filter: "brightness(1.1)",
                    },
                  },
                }}
              >
                Deploy Now
              </Button>
            </Group>
          </Container>
        </Box>

        {/* ═══════════ HERO ═══════════ */}
        <Box ref={heroRef} component="section" pos="relative" py={{ base: 48, md: 96 }} style={{ overflow: 'hidden' }}>
          <Box
            pos="absolute"
            style={{
              bottom: -96,
              right: -96,
              width: 384,
              height: 384,
              background: `${C.accent}40`,
              filter: "blur(128px)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            pos="absolute"
            style={{
              top: -96,
              left: -96,
              width: 384,
              height: 384,
              background: "rgba(168, 85, 247, 0.2)",
              filter: "blur(128px)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Container size={1140} px="md">
            <Box className="hero-layout">
              {/* Left column */}
              <Stack gap={32}>
                <Reveal inView={heroIn}>
                  <Badge
                    variant="outline"
                    radius="xl"
                    size="lg"
                    leftSection={
                      <Box
                        style={{
                          position: "relative",
                          display: "flex",
                          width: 8,
                          height: 8,
                          marginRight: 6,
                        }}
                      >
                        <Box
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            background: C.accentSecondary,
                            opacity: 0.75,
                            animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
                          }}
                        />
                        <Box
                          style={{
                            position: "relative",
                            borderRadius: "50%",
                            background: C.accentSecondary,
                            width: 8,
                            height: 8,
                          }}
                        />
                      </Box>
                    }
                    styles={{
                      root: {
                        background: `${C.accentSecondary}22`,
                        borderColor: `${C.accentSecondary}55`,
                        color: C.accentSecondary,
                        fontFamily: fontFamily,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: "none",
                      },
                    }}
                  >
                    Now in Beta
                  </Badge>
                </Reveal>

                <Reveal inView={heroIn} delay={80}>
                  <Title
                    order={1}
                    c={C.text}
                    style={{
                      fontFamily: fontFamily,
                      fontSize: 'clamp(46px, 5vw, 47px)',
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      lineHeight: 1.1,
                    }}
                  >
                    {/* Ship your multi-tenant SaaS in{" "}
                    <Text component="span" c={C.accentSecondary} inherit>
                      record speed time.
                    </Text> */}
                    <Text component="span" c={C.accentSecondary} inherit>Ship your idea <IconBulb size={54} stroke={1.4} style={{ position: 'relative', top: '10px' }} /></Text><br/>not the boilerplate
                  </Title>
                </Reveal>

                <Reveal inView={heroIn} delay={160}>
                  <Text c={C.textSec} fz={17} lh={1.7}>
                    ProductBase is the high-performance foundation for your next big idea. Built for speed, security, and exploring further than your last project.
                  </Text>
                </Reveal>

                <Reveal inView={heroIn} delay={240}>
                  <Group gap={12} wrap="wrap" className="hero-buttons">
                    {!user ? (
                      <>
                        <Button
                          component="a"
                          href={RAILWAY_DEPLOY_URL}
                          target="_blank"
                          size="md"
                          radius="md"
                          leftSection={<ProductBaseRocket size={26} stroke={1.4} />}
                          styles={{
                            root: {
                              background: C.accent,
                              color: C.text,
                              fontFamily: fontFamily,
                              fontWeight: 600,
                              "&:hover": {
                                filter: "brightness(1.1)",
                              },
                            },
                          }}
                        >
                          Deploy your Product
                        </Button>
                        <Button
                          component="a"
                          href={GITHUB_URL}
                          target="_blank"
                          size="md"
                          radius="md"
                          variant="default"
                          leftSection={<IconCode size={18} />}
                          styles={{
                            root: {
                              background: "transparent",
                              borderColor: C.border,
                              color: C.text,
                              fontFamily: fontFamily,
                              "&:hover": {
                                background: C.surface,
                                borderColor: C.borderLight,
                              },
                            },
                          }}
                        >
                          View on GitHub
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="md"
                        radius="md"
                        leftSection={<IconArrowRight size={18} />}
                        onClick={handleNavigate(routes.appHome())}
                        styles={{
                          root: {
                            background: C.accent,
                            color: C.bg,
                            fontFamily: fontFamily,
                            fontWeight: 600,
                            "&:hover": {
                              filter: "brightness(1.1)",
                            },
                          },
                        }}
                      >
                        Go to App
                      </Button>
                    )}
                  </Group>
                </Reveal>
              </Stack>

              {/* Right column - rocket + floating icons */}
              <Box
                pos="relative"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <style>{`
                  @keyframes float-rocket { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-24px)} }
                  @keyframes float-a { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-16px) rotate(6deg)} }
                  @keyframes float-b { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-22px) rotate(4deg)} }
                  @keyframes float-c { 0%,100%{transform:translateY(0) rotate(5deg)} 50%{transform:translateY(-12px) rotate(-5deg)} }
                  @keyframes float-d { 0%,100%{transform:translateY(0) rotate(-6deg)} 50%{transform:translateY(-18px) rotate(3deg)} }
                  @keyframes rocket-wobble { 0%,100%{rotate:-3deg} 50%{rotate:0deg} }
                  @keyframes big-rocket-wobble { 0%,100%{rotate:-1deg} 50%{rotate:0deg} }
                  @keyframes cloud-flicker { 0%{opacity:1} 25%{opacity:0.75} 50%{opacity:0.6} 75%{opacity:0.8} 100%{opacity:1} }
                  .nav-logo:hover .nav-rocket { animation: rocket-wobble 300ms ease-in-out infinite; }
                `}</style>
                <ProductBaseRocket color={C.accent} size={400} stroke={0.3} className="hero-rocket" style={{ margin: '0 auto', animation: 'float-rocket 8s ease-in-out infinite, big-rocket-wobble 300ms ease-in-out infinite, cloud-flicker 3s ease-in-out infinite' }} />
                {/* Floating icons absolutely positioned around the rocket */}
                {[
                  { Icon: IconDatabase,        top: '8%',  left: '6%',   anim: 'float-a', dur: '5s', delay: '0s',   size: 36, opacity: 0.6 },
                  { Icon: IconShieldCheck,     top: '5%',  right: '10%', anim: 'float-b', dur: '6s', delay: '1.2s', size: 32, opacity: 0.55 },
                  { Icon: IconGitBranch,       top: '42%', right: '2%',  anim: 'float-c', dur: '4.5s', delay: '0.6s', size: 34, opacity: 0.65 },
                  { Icon: IconSparkles,        bottom: '10%', right: '8%', anim: 'float-d', dur: '5.5s', delay: '2s', size: 30, opacity: 0.6 },
                  { Icon: IconSmartHome,       bottom: '8%', left: '4%',  anim: 'float-a', dur: '6.5s', delay: '0.4s', size: 32, opacity: 0.55 },
                  { Icon: IconSchema,          top: '42%', left: '2%',  anim: 'float-b', dur: '5s', delay: '1.8s', size: 36, opacity: 0.6 },
                  { Icon: IconPackage,         top: '18%', left: '20%', anim: 'float-c', dur: '7s', delay: '1s',   size: 28, opacity: 0.5 },
                  { Icon: IconCircleCheck,     bottom: '22%', right: '18%', anim: 'float-d', dur: '4.8s', delay: '2.5s', size: 28, opacity: 0.5 },
                ].map(({ Icon, top, left, right, bottom, anim, dur, delay, size, opacity }, i) => (
                  <Box
                    key={i}
                    pos="absolute"
                    style={{ top, left, right, bottom, animation: `${anim} ${dur} ease-in-out infinite`, animationDelay: delay, opacity, pointerEvents: 'none' }}
                  >
                    <Icon size={size} stroke={1.5} color={C.accent} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>

        {/* ═══════════ GRADIENT LINE ═══════════ */}
        <Box className="gradient-line" />

        {/* ═══════════ PROBLEM / SOLUTION ═══════════ */}
        <Box ref={probRef} component="section" py={{ base: 40, md: 72 }}>
          <Container size={760} px="md" ta="center">
            <Reveal inView={probIn}>
              <Title
                order={2}
                mb={28}
                style={{
                  fontFamily: fontFamily,
                  fontSize: 'clamp(22px, 4vw, 36px)',
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.3,
                  color: C.text,
                }}
              >
                Stop rebuilding the foundation
              </Title>
            </Reveal>

            <Reveal inView={probIn} delay={60}>
              <Text c={C.textSec} fz={16} lh={1.7}>
                When you're most excited to build, you're wasting hours on the same boilerplate: authentication, multi-tenancy, database migrations, and deployment pipelines. ProductBase implements the boilerplate so you can start with what matters — what makes your product unique.
              </Text>
            </Reveal>
          </Container>
        </Box>

        <Divider color={C.accentDivider} w="50%" mx="auto" />

        {/* ═══════════ FEATURES ═══════════ */}
        <Box ref={featRef} component="section" id="features" py={{ base: 40, md: 72 }}>
          <Container size={1140} px="md">
            <Stack align="center" mb={80} gap={10}>
              <Title
                order={2}
                style={{
                  fontFamily: fontFamily,
                  fontSize: 'clamp(22px, 4vw, 36px)',
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: C.text,
                }}
              >
                Everything you need to ship
              </Title>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 44, sm: 16, lg: 16 }}>
              {FEATURES.map((f, i) => (
                <Reveal key={i} inView={featIn} delay={i * 70}>
                  <FeatureCard icon={f.icon} title={f.title} description={f.description} />
                </Reveal>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        <Divider color={C.accentDivider} w="50%" mx="auto" />

        {/* ═══════════ TECH STACK ═══════════ */}
        <Box ref={stackRef} component="section" id="stack" py={{ base: 40, md: 72 }}>
          <Container size={1140} px="md">
            <Stack align="center" mb={48} gap={16}>
              <Title
                order={2}
                style={{
                  fontFamily: fontFamily,
                  fontSize: 'clamp(22px, 4vw, 36px)',
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: C.text,
                }}
              >
                The modern stack, refined
              </Title>
              <Text c={C.textSec} fz={14}>
                Battle-tested tools that developers love, pre-configured for performance.
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={16}>
              {TECH_STACK.map((tech, i) => (
                <Reveal key={i} inView={stackIn} delay={i * 40}>
                  <TechCard icon={tech.icon} title={tech.title} description={tech.description} color={tech.color} />
                </Reveal>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        <Divider color={C.accentDivider} w="50%" mx="auto" />

        {/* ═══════════ AI ERA ═══════════ */}
        <Box ref={aiRef} component="section" py={{ base: 40, md: 72 }}>
          <Container size={1140} px="md">
            <Stack align="center" mb={48} gap={16}>
              <Title
                order={2}
                style={{
                  fontFamily: fontFamily,
                  fontSize: 'clamp(22px, 4vw, 36px)',
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: C.text,
                }}
              >
                Built for the AI Era
              </Title>
              <Text c={C.textSec} fz={14} maw={600} mx="auto">
                Software development has changed. ProductBase is designed from the ground up to be a
                force multiplier for AI-assisted engineering.
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={16}>
              {AI_ERA.map((item, i) => (
                <Reveal key={i} inView={aiIn} delay={i * 70}>
                  <AiCard icon={item.icon} title={item.title} description={item.description} />
                </Reveal>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        <Divider color={C.accentDivider} w="50%" mx="auto" />

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <Box ref={stepsRef} component="section" id="deploy" py={{ base: 40, md: 72 }}>
          <Container size={1140} px="md">
            <Stack align="center" mb={48} gap={16}>
              <Title
                order={2}
                style={{
                  fontFamily: fontFamily,
                  fontSize: 'clamp(22px, 4vw, 36px)',
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: C.text,
                }}
              >
                How it works
              </Title>
              <Text c={C.textSec} fz={14}>
                From zero to production in under 5 minutes.
              </Text>
            </Stack>

            <Box style={{ maxWidth: 600, margin: "0 auto" }}>
              <Timeline
                active={STEPS.length}
                bulletSize={48}
                lineWidth={2}
                styles={{
                  item: { paddingTop: 0, paddingBottom: 32 },
                  itemBullet: {
                    background: "transparent",
                    borderColor: C.accent,
                  },
                  itemTitle: { fontFamily, fontSize: 18, fontWeight: 700, color: C.text },
                  itemContent: { fontFamily },
                }}
              >
                {STEPS.map((step, i) => (
                  <Reveal key={i} inView={stepsIn} delay={i * 100}>
                    <Timeline.Item
                      bullet={<step.icon size={28} color={C.accent} stroke={1.5} />}
                      title={step.title}
                      lineVariant={step.lineVariant}
                    >
                      <Text c={C.textSec} lh={1.65} fz={13} mt={8} mb={4}>
                        {step.desc}
                      </Text>
                    </Timeline.Item>
                  </Reveal>
                ))}
              </Timeline>
            </Box>
          </Container>
        </Box>

        {/* ═══════════ CTA SECTION ═══════════ */}
        <Box
          component="section"
          bg={C.bg}
          py={{ base: 40, md: 72 }}
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            pos="absolute"
            style={{
              bottom: -96,
              right: -96,
              width: 384,
              height: 384,
              background: `${C.accent}40`,
              filter: "blur(128px)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            pos="absolute"
            style={{
              top: -96,
              left: -96,
              width: 384,
              height: 384,
              background: "rgba(168, 85, 247, 0.2)",
              filter: "blur(128px)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />

          <Container size={800} px="md" ta="center" pos="relative" style={{ zIndex: 1 }}>
            <Stack align="center" gap={24}>
              <Title
                order={2}
                style={{
                  fontFamily: fontFamily,
                  fontSize: 'clamp(26px, 5vw, 48px)',
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: C.text,
                }}
              >
                Ready to build <span style={{ color: C.accentSecondary }}>in record speed</span>?
              </Title>
              <Text c={C.textSec} fz={16} lh={1.6}>
                Join <span className={styles.diagonalStrike}>500+</span> 1 developer building their SaaS faster with ProductBase. No more boilerplate,
                just progress.
              </Text>
              <Button
                component="a"
                href={RAILWAY_DEPLOY_URL}
                target="_blank"
                size="lg"
                radius="md"
                leftSection={<ProductBaseRocket size={26} stroke={1.4} />}
                styles={{
                  root: {
                    pointerEvents: "auto",
                    height: "auto",
                    overflow: "visible",
                    background: C.accent,
                    color: C.text,
                    fontFamily: fontFamily,
                    fontWeight: 700,
                    fontSize: 16,
                    paddingLeft: 32,
                    paddingRight: 32,
                    paddingTop: 16,
                    paddingBottom: 16,
                    boxShadow: `0 0 0 1px ${C.accent}, 0 8px 24px ${C.accent}44`,
                    "&:hover": {
                      filter: "brightness(1.1)",
                      boxShadow: `0 0 0 1px ${C.accent}, 0 12px 32px ${C.accent}66`,
                    },
                  },
                  label: {
                    overflow: "visible",
                    height: "auto",
                  },
                }}
              >
                Deploy your own SaaS Product
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* ═══════════ FOOTER ═══════════ */}
        <Box component="footer" py={40}>
          <Container size={1140} px="md">
            <Stack gap={32} align="center">
              <ProductBaseLogo />

              <Group gap={24} wrap="wrap" justify="center">
                <Anchor href="#" fz={13} c={C.textDim} underline="never">
                  Privacy Policy
                </Anchor>
                <Anchor href="#" fz={13} c={C.textDim} underline="never">
                  Terms of Service
                </Anchor>
                <Anchor href="#" fz={13} c={C.textDim} underline="never">
                  Support
                </Anchor>
              </Group>

              <Box style={{ paddingTop: 24 }}>
                <Text fz={11} c={C.textDim} ta="center">
                  © {new Date().getFullYear()} ProductBase
                </Text>
              </Box>
            </Stack>
          </Container>
        </Box>
      </Box>

    </>
  );
}
