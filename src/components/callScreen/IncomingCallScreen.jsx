import React from "react";
import { Box, Button, Text, VStack, Avatar, HStack } from "@chakra-ui/react";
import { PhoneIcon, CloseIcon } from "@chakra-ui/icons";

export default function IncomingCallScreen({
  userAvatar,
  userName,
  onAccept,
  onDecline,
}) {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.700"
      display="flex"
      justifyContent="center"
      alignItems="center"
      color="white"
      textAlign="center"
      zIndex="overlay"
    >
      <VStack
        p={6}
        spacing={6}
        borderRadius="lg"
        boxShadow="xl"
        bg="gray.800"
        w="90%"
        maxW="400px"
      >
        {/* User Info */}
        <Avatar size="xl" name={userName} src={userAvatar} />
        <Text fontSize="2xl" fontWeight="bold">
          {userName}
        </Text>

        {/* Accept and Decline Buttons */}
        <HStack spacing={4} w="100%">
          <Button
            leftIcon={<PhoneIcon />}
            colorScheme="green"
            flex="1"
            onClick={onAccept}
          >
            Accept
          </Button>
          <Button
            leftIcon={<CloseIcon />}
            colorScheme="red"
            flex="1"
            onClick={onDecline}
          >
            Decline
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
