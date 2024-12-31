import { ChatIcon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarBadge,
  Badge,
  Box,
  Center,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getMessagesByUserId, getUserById } from "../../utils/getData";
import { useChatBox } from "../../context/ChatBoxContext";
import { useChatConn } from "../../context/ChatConnContext";
import { useUser } from "../../context/UserContext";
import formatTimeFromDatabase from "../sharedComponents/formatTimeFromDatabase";

export default function ChatMenu() {
  const { setChatInfo } = useChatBox();

  const { chatConn } = useChatConn();

  const { currentUser } = useUser();

  const [messages, setMessages] = useState([]);

  const [unreadChat, setUnreadChat] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChat = (avatar, isOnline, contactId, contactName, status) => {
    setChatInfo({
      isOpen: true,
      avatar,
      isOnline,
      contactId,
      contactName,
      status,
    });
  };

  const getDataForChatMenu = async () => {
    const response = await getMessagesByUserId(currentUser.id);

    if (response && response?.data) {
      const messageArray = [];
      let userId, content;
      for (const msg of response?.data) {
        if (msg.sender === currentUser.id && msg.receiver) {
          // User id not currentUser
          userId = msg.receiver;
          // Content of the message
          content = `You: ${msg.content}`;
        } else if (msg.receiver === currentUser.id && msg.sender) {
          // User id not currentUser
          userId = msg.sender;
          // Content of the message
          content = msg.content;
        }

        // Get user data by user id
        let userData = await getUserById(userId);

        //   Add message to array
        if (userData && userData?.data) {
          messageArray.push({
            id: msg.id,
            contactId: userId,
            contactName: userData?.data.name,
            avatar: userData?.data.avatar,
            isOnline: userData?.data.isOnline,
            lastActive: userData?.data.lastActive,
            content,
          });
        }
      }

      setMessages(messageArray);
    }
    setIsLoading(false);
  };

  // Load data for chat menu
  useEffect(() => {
    if (isLoading) {
      getDataForChatMenu();
    }
  }, [isLoading]);

  useEffect(() => {
    // Listening from server for message to display notification
    if (chatConn) {
      const incrementUnreadChat = () => {
        setUnreadChat((prev) => prev + 1);
      };

      chatConn.on("ReceiveMessage", incrementUnreadChat);

      return () => {
        if (chatConn) {
          chatConn.off("ReceiveMessage", incrementUnreadChat);
        }
      };
    }
  }, [chatConn]);

  return (
    <>
      <Center mr={4}>
        <Menu
          onOpen={() => {
            setUnreadChat(0);
            setIsLoading(true);
          }}
        >
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<ChatIcon />}
            rounded="full"
          ></MenuButton>

          {/* Chat notification */}
          {unreadChat > 0 && (
            <Box position="relative">
              <Box position="absolute" bottom="5px" right="0px" zIndex="1">
                <Badge colorScheme="red" borderRadius="full" px={2} py={0.5}>
                  {unreadChat}
                </Badge>
              </Box>
            </Box>
          )}
          {/* Chat notification */}

          <MenuList
            w="360px"
            maxHeight="93vh"
            boxShadow="2xl"
            p={4}
            overflowY="auto"
            position="absolute"
            left="-260px"
          >
            <Heading as="h2" mb={3}>
              Chat
            </Heading>

            {isLoading && (
              <Box
                display="flex"
                p={3}
                justifyContent="center"
                alignItems="center"
              >
                <Spinner size="md" />
              </Box>
            )}

            <VStack gap={2}>
              {messages.map((msg) => (
                <MenuItem
                  key={msg.id}
                  borderRadius={10}
                  p={3}
                  onClick={() =>
                    handleOpenChat(
                      msg.avatar,
                      msg.isOnline,
                      msg.contactId,
                      msg.contactName,
                      msg.isOnline === 1
                        ? "active"
                        : formatTimeFromDatabase(msg.lastActive)
                    )
                  }
                >
                  <Avatar mr={5} src={msg.avatar} name={msg.contactName}>
                    {msg.isOnline === 1 && (
                      <AvatarBadge boxSize="1.25em" bg="green.500" />
                    )}
                  </Avatar>
                  <Box>
                    <Text fontSize="lg" mb={0}>
                      {msg.contactName}
                    </Text>
                    <Text
                      fontSize="sm"
                      mb={0}
                      noOfLines={1}
                      opacity="85%"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {msg.content}
                    </Text>
                  </Box>
                </MenuItem>
              ))}
            </VStack>
          </MenuList>
        </Menu>
      </Center>
    </>
  );
}
