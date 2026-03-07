"use client";

import {
  Box,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Menu,
  Portal,
  Text,
  Image,
} from "@chakra-ui/react";
import {
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "User";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box
      as="header"
      h="16"
      bg="white"
      _dark={{ bg: "gray.800" }}
      borderBottomWidth="1px"
      position="sticky"
      top={0}
      zIndex={100}
      px={{ base: 4, md: 8 }}
    >
      <Flex h="full" align="center" justify="space-between" maxW="1400px" mx="auto">
        {/* Brand */}
        <Link href="/">
          <HStack gap={2}>
            <Image
              src="/logo.png"
              alt="Mockmee Logo"
              h="8"
              w="auto"
            />
            <Heading size="md" display={{ base: "none", sm: "block" }}>
              Mockmee Exam
            </Heading>
          </HStack>
        </Link>

        {/* Actions */}
        <HStack gap={4}>  
          <Menu.Root>
            <Menu.Trigger asChild>
              <HStack
                cursor="pointer"
                py={1}
                px={2}
                rounded="lg"
                _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}
                transition="all 0.2s"
              >
                {user?.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={fullName}
                    w={8}
                    h={8}
                    rounded="full"
                    objectFit="cover"
                  />
                ) : (
                  <Box
                    w={8}
                    h={8}
                    rounded="full"
                    bg="brand.500"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontWeight="bold" fontSize="xs">
                      {initials}
                    </Text>
                  </Box>
                )}
                <HStack gap={1} display={{ base: "none", md: "flex" }}>
                  <Text fontWeight="medium" fontSize="sm">
                    {fullName.split(" ")[0]}
                  </Text>
                  <ChevronDown size={14} color="gray.500" />
                </HStack>
              </HStack>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW="200px">
                  <Menu.Item value="settings" asChild>
                    <Link href="/settings">
                      <HStack gap={2}>
                        <Icon as={Settings} fontSize="md" />
                        <Text>Settings</Text>
                      </HStack>
                    </Link>
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item
                    value="logout"
                    color="fg.error"
                    _hover={{ bg: "bg.error", color: "fg.error" }}
                    onClick={logout}
                  >
                    <HStack gap={2}>
                      <Icon as={LogOut} fontSize="md" />
                      <Text>Log out</Text>
                    </HStack>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>
      </Flex>
    </Box>
  );
}
