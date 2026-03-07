"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Heading,
  Grid,
  Card,
  Badge,
  HStack,
  VStack,
  Button,
  Icon,
  Flex,
  Input,
  Spinner,
  Text,
  ButtonGroup,
  IconButton,
  Pagination,
  EmptyState,
} from "@chakra-ui/react";
import {
  ClipboardList,
  Clock,
  BookOpen,
  Headphones,
  PenTool,
  Search,
  Play,
} from "lucide-react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/layout/Header";
import { ieltsMockTestsAPI } from "@/lib/ielts-api";

const PAGE_SIZE = 9;

interface MockTest {
  id: string;
  title: string;
  test_id?: string;
  group_id?: string;
  teacher_id?: string;
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
    category?: string;
    reading?: { id: string; title?: string; parts?: unknown[] };
    listening?: { id: string; title?: string; parts?: unknown[] };
    writing?: { id: string; title?: string; tasks?: unknown[] };
  };
  createdAt?: string;
}

const categoryLabels: Record<string, string> = {
  authentic: "Authentic",
  "pre-test": "Pre-test",
  "cambridge books": "Cambridge",
};

export default function MockTestsPage() {
  return (
    <ProtectedRoute>
      <MockTestsContent />
    </ProtectedRoute>
  );
}

function MockTestsContent() {
  const router = useRouter();
  const [allTests, setAllTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    requestAnimationFrame(() => {
      if (!cancelled) setLoading(true);
    });
    ieltsMockTestsAPI
      .getMy()
      .then((res: MockTest[] | { data?: MockTest[] }) => {
        if (!cancelled) {
          const list = Array.isArray(res) ? res : res?.data || [];
          setAllTests(list.filter((t) => !t.archived));
        }
      })
      .catch(() => {
        if (!cancelled) setAllTests([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTests = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return allTests;
    return allTests.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.test?.title?.toLowerCase().includes(q) ||
        t.test?.category?.toLowerCase().includes(q),
    );
  }, [allTests, debouncedSearch]);

  const totalCount = filteredTests.length;
  const tests = filteredTests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getModuleBadges = (test: MockTest) => {
    const badges: { label: string; icon: typeof BookOpen; color: string }[] =
      [];
    if (test.test?.reading)
      badges.push({ label: "Reading", icon: BookOpen, color: "#4F46E5" });
    if (test.test?.listening)
      badges.push({ label: "Listening", icon: Headphones, color: "#D97706" });
    if (test.test?.writing)
      badges.push({ label: "Writing", icon: PenTool, color: "#059669" });
    return badges;
  };

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <Header />
      <Box pb={8}>
        {/* Main Content */}
        <Box p={{ base: 4, md: 8 }} maxW="1400px" mx="auto">
          {/* Hero */}
          <Box
            bg="linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
            borderRadius="2xl"
            p={{ base: 8, md: 10 }}
            mb={8}
            color="white"
            shadow="lg"
          >
            <HStack gap={3} mb={3}>
              <Flex
                align="center"
                justify="center"
                w="56px"
                h="56px"
                borderRadius="xl"
                bg="whiteAlpha.200"
              >
                <ClipboardList size={28} />
              </Flex>
              <Heading size={{ base: "xl", md: "2xl" }}>
                Full IELTS Mock Tests
              </Heading>
            </HStack>
            <Text
              color="whiteAlpha.800"
              fontSize={{ base: "md", md: "lg" }}
              maxW="700px"
              mb={6}
            >
              Your assigned mock tests. Each test includes Reading, Listening,
              and Writing modules with timed conditions.
            </Text>
            <HStack gap={8}>
              <HStack gap={2} color="whiteAlpha.700" fontSize="md">
                <Clock size={20} />
                <Text>~2h 45min</Text>
              </HStack>
              <HStack gap={2} color="whiteAlpha.700" fontSize="md">
                <BookOpen size={20} />
                <Text>3 Modules</Text>
              </HStack>
            </HStack>
          </Box>

          {/* Filters and Header */}
          <Flex
            mb={8}
            gap={6}
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
          >
            <Heading size="lg">
              {totalCount > 0
                ? `${totalCount} Mock Test${totalCount !== 1 ? "s" : ""}`
                : "Mock Tests"}
            </Heading>

            <Box position="relative" width={{ base: "100%", md: "320px" }}>
              <Box
                position="absolute"
                left="12px"
                top="50%"
                transform="translateY(-50%)"
                color="gray.400"
                zIndex={1}
                pointerEvents="none"
              >
                <Search size={18} />
              </Box>
              <Input
                size="lg"
                pl="42px"
                placeholder="Search mock tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                borderRadius="xl"
                bg="white"
                _dark={{ bg: "gray.800" }}
                shadow="sm"
              />
            </Box>
          </Flex>

          {/* Grid */}
          {loading ? (
            <Flex justify="center" py={20}>
              <Spinner size="xl" color="brand.500" />
            </Flex>
          ) : tests.length === 0 ? (
            <EmptyState.Root py={20}>
              <EmptyState.Content>
                <EmptyState.Indicator />
                <EmptyState.Title fontSize="xl">No mock tests found</EmptyState.Title>
                <EmptyState.Description>
                  There are no mock tests available at the moment. Check back
                  later!
                </EmptyState.Description>
              </EmptyState.Content>
            </EmptyState.Root>
          ) : (
            <>
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                }}
                gap={8}
              >
                {tests.map((test) => {
                  const testId = test.id;
                  const moduleBadges = getModuleBadges(test);
                  const allDone =
                    test.listening_finished &&
                    test.reading_finished &&
                    test.writing_finished;

                  return (
                    <Card.Root
                      key={testId}
                      transition="all 0.3s"
                      borderRadius="2xl"
                      overflow="hidden"
                      variant="elevated"
                      _hover={{ transform: "translateY(-4px)", shadow: "2xl" }}
                    >
                      {/* Header banner */}
                      <Flex
                        align="center"
                        justify="center"
                        bg="linear-gradient(135deg, #0f172a 0%, #334155 100%)"
                        py={12}
                        position="relative"
                      >
                        <Flex
                          align="center"
                          justify="center"
                          w="80px"
                          h="80px"
                          borderRadius="2xl"
                          bg="whiteAlpha.200"
                          backdropFilter="blur(8px)"
                        >
                          <ClipboardList size={40} color="white" />
                        </Flex>
                        {test.test?.category && (
                          <Badge
                            position="absolute"
                            top={4}
                            right={4}
                            fontSize="xs"
                            px={3}
                            py={1}
                            borderRadius="full"
                            bg="whiteAlpha.300"
                            color="white"
                            fontWeight="bold"
                            backdropFilter="blur(4px)"
                          >
                            {categoryLabels[test.test.category] ||
                              test.test.category}
                          </Badge>
                        )}
                        {allDone && (
                          <Badge
                            position="absolute"
                            top={4}
                            left={4}
                            fontSize="xs"
                            colorPalette="green"
                            variant="solid"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            Completed
                          </Badge>
                        )}
                      </Flex>

                      <Card.Body p={6}>
                        <VStack align="stretch" gap={4}>
                          <Box>
                            <Heading size="md" mb={1} lineClamp={2}>
                              {test.title}
                            </Heading>
                            {test.test?.title &&
                              test.test.title !== test.title && (
                                <Text fontSize="sm" color="gray.500" lineClamp={1}>
                                  {test.test.title}
                                </Text>
                              )}
                          </Box>

                          {/* Module badges */}
                          <HStack gap={2} flexWrap="wrap">
                            {moduleBadges.map((badge) => {
                              const BadgeIcon = badge.icon;
                              return (
                                <Badge
                                  key={badge.label}
                                  fontSize="xs"
                                  px={2.5}
                                  py={1}
                                  borderRadius="lg"
                                  variant="subtle"
                                  colorPalette={
                                    badge.label === "Reading"
                                      ? "purple"
                                      : badge.label === "Listening"
                                        ? "orange"
                                        : "green"
                                  }
                                >
                                  <HStack gap={1}>
                                    <BadgeIcon size={12} />
                                    <Text>{badge.label}</Text>
                                  </HStack>
                                </Badge>
                              );
                            })}
                          </HStack>

                          {/* Skill progress */}
                          <HStack gap={2} flexWrap="wrap">
                            {test.listening_finished != null && (
                              <Badge
                                size="sm"
                                variant={
                                  test.listening_finished ? "solid" : "outline"
                                }
                                colorPalette={
                                  test.listening_finished ? "orange" : "gray"
                                }
                              >
                                L:{" "}
                                {test.listening_finished ? "Done" : "Pending"}
                              </Badge>
                            )}
                            {test.reading_finished != null && (
                              <Badge
                                size="sm"
                                variant={
                                  test.reading_finished ? "solid" : "outline"
                                }
                                colorPalette={
                                  test.reading_finished ? "purple" : "gray"
                                }
                              >
                                R: {test.reading_finished ? "Done" : "Pending"}
                              </Badge>
                            )}
                            {test.writing_finished != null && (
                              <Badge
                                size="sm"
                                variant={
                                  test.writing_finished ? "solid" : "outline"
                                }
                                colorPalette={
                                  test.writing_finished ? "green" : "gray"
                                }
                              >
                                W: {test.writing_finished ? "Done" : "Pending"}
                              </Badge>
                            )}
                          </HStack>

                          <Button
                            size="lg"
                            colorPalette="brand"
                            variant={allDone ? "subtle" : "solid"}
                            width="full"
                            onClick={() =>
                              router.push(
                                `/mock-tests/${testId}${test.test_id ? `?testId=${test.test_id}` : ""}`,
                              )
                            }
                          >
                            <HStack gap={2}>
                              <Play size={18} fill={allDone ? "currentColor" : "none"} />
                              <Text>{allDone ? "Review Test" : "Start Test"}</Text>
                            </HStack>
                          </Button>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  );
                })}
              </Grid>

              {/* Pagination */}
              {totalCount > PAGE_SIZE && (
                <Flex justify="center" mt={12}>
                  <Pagination.Root
                    count={totalCount}
                    pageSize={PAGE_SIZE}
                    page={page}
                    onPageChange={(e) => setPage(e.page)}
                  >
                    <ButtonGroup variant="outline" size="md" attached>
                      <Pagination.PrevTrigger asChild>
                        <IconButton aria-label="Previous page">
                          <LuChevronLeft />
                        </IconButton>
                      </Pagination.PrevTrigger>

                      <Pagination.Items
                        render={(item) => (
                          <IconButton
                            key={item.value}
                            variant={item.value === page ? "solid" : "outline"}
                            colorPalette={item.value === page ? "brand" : "gray"}
                          >
                            {item.value}
                          </IconButton>
                        )}
                      />

                      <Pagination.NextTrigger asChild>
                        <IconButton aria-label="Next page">
                          <LuChevronRight />
                        </IconButton>
                      </Pagination.NextTrigger>
                      </ButtonGroup>
                  </Pagination.Root>
                </Flex>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
