"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Stack,
  HStack,
  Text,
  IconButton,
  Card,
  Icon,
  Spinner,
  Link as ChakraLink,
  Image,
} from "@chakra-ui/react";
import { User, Lock, ArrowRight, Home, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toaster } from "@/components/ui/toaster";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toaster.create({
        title: "Validation Error",
        description: "Please enter both username and password.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await login(username, password, role);
      if (result.success) {
        toaster.create({
          title: "Login Successful",
          description: `Welcome back, ${role}!`,
          type: "success",
        });
        // Navigation is handled in AuthContext, but just in case:
        // window.location.href = role === "teacher" ? "/dashboard" : "/";
      } else {
        toaster.create({
          title: "Login Failed",
          description: result.error || "Invalid credentials. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      toaster.create({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      _dark={{ bg: "gray.900" }}
      position="relative"
      overflow="hidden"
      py={12}
      px={4}
    >
      {/* Background Orbs for Premium Look */}
      <Box
        position="absolute"
        top="-10%"
        left="-10%"
        w="40%"
        h="40%"
        bg="brand.500"
        filter="blur(120px)"
        opacity="0.1"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-10%"
        w="40%"
        h="40%"
        bg="brand.600"
        filter="blur(120px)"
        opacity="0.1"
        zIndex={0}
      />

      <Container maxW="md" zIndex={1}>
        <Stack gap={8} align="center">
          {/* Logo / Brand */}
          <Link href="#">
            <Stack direction="row" align="center" gap={3} cursor="pointer">
              <Image
                src="/logo.png"
                alt="Mockmee Logo"
                h="10"
                w="auto"
              />
              <Heading size="lg" fontWeight="bold" color="brand.600">
                Mockmee Exam
              </Heading>
            </Stack>
          </Link>

          <Card.Root
            variant="elevated"
            width="full"
            borderRadius="2xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor="whiteAlpha.300"
            _dark={{ borderColor: "gray.700" }}
            shadow="xl"
          >
            <Card.Header pb={2} pt={8} px={8}>
              <Stack gap={1} align="center">
                <Heading size="xl" textAlign="center">
                  Welcome Back
                </Heading>
                <Text color="gray.500" fontSize="sm" textAlign="center">
                  Sign in to continue your IELTS Exam Platform
                </Text>
              </Stack>
            </Card.Header>

            <Card.Body px={8} pb={8} pt={4}>
              <Stack gap={6}>
                <form onSubmit={handleLogin}>
                  <Stack gap={5}>
                    {/* Username Field */}
                    <Stack gap={1.5}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="gray.700"
                        _dark={{ color: "gray.300" }}
                      >
                        Username
                      </Text>
                      <Box position="relative">
                        <Box
                          position="absolute"
                          left="3"
                          top="50%"
                          transform="translateY(-50%)"
                          color="gray.400"
                          zIndex={2}
                        >
                          <User size={18} />
                        </Box>
                        <Input
                          placeholder="Enter your username"
                          pl="10"
                          h="12"
                          borderRadius="xl"
                          bg="gray.50"
                          _dark={{ bg: "gray.800" }}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          _focus={{
                            borderColor: "brand.500",
                            bg: "white",
                            _dark: { bg: "gray.700" },
                          }}
                        />
                      </Box>
                    </Stack>

                    {/* Password Field */}
                    <Stack gap={1.5}>
                      <Flex justify="space-between" align="center">
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.700"
                          _dark={{ color: "gray.300" }}
                        >
                          Password
                        </Text>
                        <ChakraLink
                          fontSize="xs"
                          color="brand.500"
                          asChild
                          pointerEvents="auto"
                        >
                          <Link href="/auth/forgot-password">
                            Forgot Password?
                          </Link>
                        </ChakraLink>
                      </Flex>
                      <Box position="relative">
                        <Box
                          position="absolute"
                          left="3"
                          top="50%"
                          transform="translateY(-50%)"
                          color="gray.400"
                          zIndex={2}
                        >
                          <Lock size={18} />
                        </Box>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          pl="10"
                          pr="10"
                          h="12"
                          borderRadius="xl"
                          bg="gray.50"
                          _dark={{ bg: "gray.800" }}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          _focus={{
                            borderColor: "brand.500",
                            bg: "white",
                            _dark: { bg: "gray.700" },
                          }}
                        />
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          variant="ghost"
                          size="sm"
                          position="absolute"
                          right="1"
                          top="50%"
                          transform="translateY(-50%)"
                          onClick={() => setShowPassword(!showPassword)}
                          color="gray.400"
                          zIndex={2}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </Box>
                    </Stack>

                    <Button
                      type="submit"
                      colorPalette="brand"
                      size="lg"
                      h="12"
                      borderRadius="xl"
                      loading={loading}
                      width="full"
                      mt={2}
                      disabled={loading}
                    >
                      <HStack gap={2} justify="center" width="full">
                        {loading ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            Sign In
                          </>
                        )}
                      </HStack>
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Stack>
      </Container>
    </Box>
  );
}
