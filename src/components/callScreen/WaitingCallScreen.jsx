import React from "react";
import { Box, Button, Avatar, Text } from "@chakra-ui/react";

export default function WaitingCallScreen({
  userAvatar,
  userName,
  onCancelCall,
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      h="100vh"
      w="100vw"
      bg="gray.100"
      pos="fixed"
      left={0}
      top={0}
      zIndex="overlay"
    >
      <Box p={6} bg="white" borderRadius="lg" boxShadow="lg" textAlign="center">
        <Avatar size="2xl" name={userName} src={userAvatar} mb={4} />
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          {userName}
        </Text>
        <Text fontSize="lg" mb={6}>
          Calling...
        </Text>
        <Button colorScheme="red" onClick={onCancelCall} size="lg">
          Cancel Call
        </Button>
      </Box>
    </Box>
  );
}
