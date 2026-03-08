"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Text,
  VStack,
  Badge
} from "@chakra-ui/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Headphones,
  BookOpen,
  PenTool,
  Lock,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/layout/Header";
import { ieltsMockTestsAPI, ieltsTestsAPI } from "@/lib/ielts-api";
import { toaster } from "@/components/ui/toaster";

// ── Types ──────────────────────────────────────────────────────────────────

interface MockTestDetail {
  id: string;
  title: string;
  test_id?: string;
  listening_confirmed?: boolean;
  reading_confirmed?: boolean;
  writing_confirmed?: boolean;
  listening_finished?: boolean;
  reading_finished?: boolean;
  writing_finished?: boolean;
  archived?: boolean;
  meta?: {
    listening_videoUrl?: string;
    reading_videoUrl?: string;
    writing_videoUrl?: string;
  };
  test?: {
    id: string;
    title?: string;
    listening?: { id: string; title?: string; parts?: unknown[] };
    reading?: { id: string; title?: string; parts?: unknown[] };
    writing?: { id: string; title?: string; tasks?: unknown[] };
  };
}

type Skill = "listening" | "reading" | "writing";

// ── Page ───────────────────────────────────────────────────────────────────

export default function MockTestDashboardPage() {
  return (
    <ProtectedRoute>
      <MockTestDashboard />
    </ProtectedRoute>
  );
}

interface TestModules {
  listeningId?: string;
  readingId?: string;
  writingId?: string;
}

function MockTestDashboard() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mockTestId = params?.id;
  const testId = searchParams?.get("testId") ?? undefined;

  const [mockTest, setMockTest] = useState<MockTestDetail | null>(null);
  const [modules, setModules] = useState<TestModules>({});
  const [loading, setLoading] = useState(true);

  // Which skill sections are expanded
  const [expanded, setExpanded] = useState<Record<Skill, boolean>>({
    listening: false,
    reading: false,
    writing: false,
  });

  const fetchMockTest = useCallback(async () => {
    if (!mockTestId) return;
    setLoading(true);
    try {
      const res = await ieltsMockTestsAPI.getById(mockTestId);
      const data = res?.data ?? res;
      setMockTest(data);

      // Fetch the IELTS test to get module IDs
      const tId = testId ?? data?.test_id;
      if (tId) {
        const testRes = await ieltsTestsAPI.getById(tId);
        const testData = testRes?.data ?? testRes;
        setModules({
          listeningId: testData?.listenings?.[0]?.id,
          readingId: testData?.readings?.[0]?.id,
          writingId: testData?.writings?.[0]?.id,
        });
      }
    } catch {
      toaster.create({ title: "Failed to load mock test", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [mockTestId, testId]);

  useEffect(() => {
    fetchMockTest();
  }, [fetchMockTest]);

  // ── Confirm handler ────────────────────────────────────────────────────

  const handleConfirm = async (skill: Skill) => {
    if (!mockTest) return;
    const field = `${skill}_confirmed` as keyof MockTestDetail;
    if (mockTest[field]) return; // already confirmed
    try {
      await ieltsMockTestsAPI.update(mockTest.id, {
        [`${skill}_confirmed`]: true,
      });
      setMockTest((prev) =>
        prev ? { ...prev, [`${skill}_confirmed`]: true } : prev,
      );
    } catch {
      toaster.create({ title: "Failed to confirm", type: "error" });
    }
  };

  // ── Skill timing ──────────────────────────────────────────────────────

  const skillTimings: Record<Skill, number> = {
    listening: 30,
    reading: 60,
    writing: 60,
  };

  const skillIcons: Record<Skill, React.ReactNode> = {
    listening: <Headphones size={22} />,
    reading: <BookOpen size={22} />,
    writing: <PenTool size={22} />,
  };

  const skillColors: Record<Skill, string> = {
    listening: "orange",
    reading: "purple",
    writing: "green",
  };

  const skillPosters: Record<Skill, string> = {
    listening: "/listening.png",
    reading: "/reading.png",
    writing: "/writing.png",
  };

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
        <Header />
        <Flex h="calc(100vh - 64px)" align="center" justify="center">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      </Box>
    );
  }

  if (!mockTest) {
    return (
      <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
        <Header />
        <Box p={8} textAlign="center">
          <Text color="red.500" fontSize="lg" mb={4}>Mock test not found.</Text>
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft size={16} /> Back to Mock Tests
          </Button>
        </Box>
      </Box>
    );
  }

  const skills: Skill[] = ["listening", "reading", "writing"];

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <Header />
      <Box pb={12}>
        {/* Sub Header Content Bar */}
        <Box bg="white" _dark={{ bg: "gray.800" }} borderBottomWidth="1px" mb={8}>
          <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} h="16" display="flex" alignItems="center" justifyContent="space-between">
            <HStack gap={4}>
              <IconButton
                aria-label="Back"
                size="sm"
                variant="ghost"
                onClick={() => router.push("/")}
                rounded="full"
              >
                <ArrowLeft size={20} />
              </IconButton>
              <Heading size="md" lineClamp={1}>{mockTest.title}</Heading>
            </HStack>
          </Box>
        </Box>

        {/* Content */}
        <Box p={{ base: 4, md: 6 }} maxW="1000px" mx="auto">
          <VStack gap={8} align="stretch">
            {/* Intro Card */}
            <Card.Root p={6} borderRadius="2xl" shadow="sm">
              <Heading size="lg" mb={2}>Instructions</Heading>
              <Text color="gray.600" _dark={{ color: "gray.400" }}>
                Practice all skills for this mock test. Each module follows authentic IELTS timing and format.
                Modules must be completed sequentially: Listening → Reading → Writing.
              </Text>
            </Card.Root>

            {/* Skill Sections */}
            {skills.map((skill) => {
              const confirmed =
                !!mockTest[`${skill}_confirmed` as keyof MockTestDetail];
              const finished =
                !!mockTest[`${skill}_finished` as keyof MockTestDetail];
              const videoUrl =
                mockTest.meta?.[
                  `${skill}_videoUrl` as keyof NonNullable<
                    MockTestDetail["meta"]
                  >
                ];
              const isExpanded = expanded[skill];

              // Sequential unlock: listening → reading → writing
              const locked =
                (skill === "reading" && !mockTest.listening_finished) ||
                (skill === "writing" && !mockTest.reading_finished);

              return (
                <Card.Root
                  key={skill}
                  borderRadius="2xl"
                  borderWidth="1px"
                  overflow="hidden"
                  variant="elevated"
                  shadow={locked ? "none" : "sm"}
                  opacity={locked ? 0.7 : 1}
                >
                  <Flex>
                    <Box
                      w="6px"
                      bg={locked ? "gray.300" : `${skillColors[skill]}.500`}
                      flexShrink={0}
                    />
                    <Card.Body p={{ base: 5, md: 8 }} flex="1">
                      <VStack align="stretch" gap={5}>
                        {/* Header */}
                        <Flex align="center" justify="space-between">
                          <HStack gap={4}>
                            <Box
                              p={2.5}
                              bg={locked ? "gray.100" : `${skillColors[skill]}.50`}
                              _dark={{ bg: locked ? "gray.800" : `${skillColors[skill]}.900/30` }}
                              borderRadius="xl"
                              color={locked ? "gray.400" : `${skillColors[skill]}.500`}
                            >
                              {skillIcons[skill]}
                            </Box>
                            <Box>
                              <Heading
                                size="xl"
                                textTransform="capitalize"
                                color={locked ? "gray.400" : "inherit"}
                              >
                                {skill}
                              </Heading>
                              <Text fontSize="sm" color="gray.500">
                                Timing: {skillTimings[skill]} minutes
                              </Text>
                            </Box>
                          </HStack>

                          {finished ? (
                            <Badge colorPalette="green" variant="solid" size="lg" px={3} py={1} borderRadius="full">
                              <HStack gap={1}>
                                <Check size={14} />
                                <Text>Completed</Text>
                              </HStack>
                            </Badge>
                          ) : locked ? (
                            <HStack gap={2} bg="gray.100" _dark={{ bg: "gray.800" }} px={3} py={1.5} borderRadius="lg">
                              <Lock size={16} color="gray" />
                              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                                Locked
                              </Text>
                            </HStack>
                          ) : (
                            <Badge colorPalette="orange" variant="outline" size="lg" px={3} py={1} borderRadius="full">
                              In Progress
                            </Badge>
                          )}
                        </Flex>

                        {locked && (
                          <Text fontSize="sm" color="gray.400" fontStyle="italic">
                            Please complete {(skill === "reading" ? "Listening" : "Reading")} to unlock this module.
                          </Text>
                        )}

                        {/* Expandable content */}
                        {!locked && (
                          <Box mt={2}>
                            <Box
                              p={4}
                              bg="gray.50"
                              _dark={{ bg: "gray.800/50" }}
                              borderRadius="xl"
                              cursor="pointer"
                              onClick={() =>
                                setExpanded((prev) => ({
                                  ...prev,
                                  [skill]: !prev[skill],
                                }))
                              }
                              _hover={{ bg: "gray.100", _dark: { bg: "gray.800" } }}
                              transition="all 0.2s"
                            >
                              <HStack justify="space-between">
                                <HStack gap={3}>
                                  {isExpanded ? (
                                    <ChevronUp size={20} />
                                  ) : (
                                    <ChevronDown size={20} />
                                  )}
                                  <Text fontWeight="semibold">
                                    Module Instructions & Material
                                  </Text>
                                </HStack>
                                {!confirmed && (
                                  <Badge colorPalette="red" variant="subtle">
                                    Confirmation Required
                                  </Badge>
                                )}
                              </HStack>
                            </Box>

                            {isExpanded && (
                              <Box p={6} borderTopWidth="0">
                                {/* Video Material */}
                                {videoUrl && (
                                  <Box mb={6}>
                                    <Text fontWeight="bold" mb={3} fontSize="sm" color="gray.500" textTransform="uppercase">
                                      Video Instruction / Material
                                    </Text>
                                    <Box borderRadius="2xl" overflow="hidden" bg="black" shadow="lg">
                                      <video
                                        src={videoUrl}
                                        poster={skillPosters[skill]}
                                        controls
                                        controlsList="nofullscreen"
                                        disablePictureInPicture
                                        onContextMenu={(e) => e.preventDefault()}
                                        style={{
                                          width: "100%",
                                          maxHeight: "450px",
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                )}

                                {/* Confirm and Start Actions */}
                                {!confirmed ? (
                                  <Box p={6} bg="orange.50" _dark={{ bg: "orange.900/10" }} borderRadius="2xl" border="1px solid" borderColor="orange.200">
                                    <Heading size="sm" mb={2}>Ready to start?</Heading>
                                    <Text fontSize="sm" mb={4}>
                                      Please confirm that you have understood the instructions and are ready for the timed {skill} test.
                                    </Text>
                                    <Button
                                      size="lg"
                                      colorPalette={skillColors[skill]}
                                      onClick={() => handleConfirm(skill)}
                                      width="full"
                                      shadow="md"
                                    >
                                      <HStack gap={2}>
                                        <Check size={18} />
                                        <Text>I've understood and I'm ready</Text>
                                      </HStack>
                                    </Button>
                                  </Box>
                                ) : (
                                  !finished && (
                                    <Box p={6} bg="green.50" _dark={{ bg: "green.900/10" }} borderRadius="2xl" border="1px solid" borderColor="green.200">
                                      <Heading size="sm" mb={4}>Requirement Met</Heading>
                                      <Button
                                        size="lg"
                                        bg="gray.900"
                                        color="white"
                                        _hover={{ bg: "gray.700" }}
                                        _dark={{
                                          bg: "white",
                                          color: "black",
                                          _hover: { bg: "gray.200" },
                                        }}
                                        width="full"
                                        shadow="lg"
                                        disabled={
                                          (skill === "listening" && !modules.listeningId) ||
                                          (skill === "reading" && !modules.readingId) ||
                                          (skill === "writing" && !modules.writingId)
                                        }
                                        onClick={() => {
                                          const tId = testId ?? mockTest?.test_id;
                                          const qs = tId ? `?testId=${tId}` : "";
                                          router.push(
                                            `/mock-tests/${mockTestId}/${skill}${qs}`,
                                          );
                                        }}
                                      >
                                        <HStack gap={2}>
                                          <ArrowRight size={20} />
                                          <Text>Start {skill.charAt(0).toUpperCase() + skill.slice(1)} Test</Text>
                                        </HStack>
                                      </Button>
                                    </Box>
                                  )
                                )}
                              </Box>
                            )}
                          </Box>
                        )}
                      </VStack>
                    </Card.Body>
                  </Flex>
                </Card.Root>
              );
            })}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
