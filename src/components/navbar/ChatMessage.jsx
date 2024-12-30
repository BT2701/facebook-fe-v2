import { Avatar, Box, Text } from "@chakra-ui/react";

export default function ChatMessage({ message, isFromYou }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      mb={2} // Margin bottom for spacing between messages
      flexDirection={isFromYou ? "row-reverse" : "row"} // Change direction based on sender
    >
      {/* Avatar */}
      {!isFromYou && (
        <Avatar
          size="sm"
          name={message.senderName}
          src={message.senderAvatar}
          mr={2} // Margin right for spacing
        />
      )}

      {/* Message Bubble */}
      <Box
        bg={isFromYou ? "blue.500" : "gray.200"} // Different colors for sender and receiver
        color={isFromYou ? "white" : "black"}
        borderRadius="lg"
        p={2}
        maxWidth="70%" // Control the width of the message bubble
      >
        <Text m={0}>{message.text}</Text>
      </Box>
    </Box>
  );
}
