import {
  Avatar,
  AvatarBadge,
  Box,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useChatBox } from "../../context/ChatBoxContext";
import { useUser } from "../../context/UserContext";
import { getFriendsByUserId } from "../../utils/getData";
import { useEffect, useState } from "react";
import formatTimeFromDatabase from "../sharedComponents/formatTimeFromDatabase";

export default function FriendList() {
  const { setChatInfo } = useChatBox();

  // Get current login user
  const { currentUser } = useUser();

  const [friends, setFriends] = useState([]);

  // Fetch current user's friends
  const fetchCurrentUserFriends = async () => {
    const response = await getFriendsByUserId(currentUser);

    const friendList = [];

    try {
      if (response && response?.data) {
        response?.forEach((friend) => {
          friendList.push({
            id: friend.id,
            name: friend.name,
            avatar: friend.avt,
            isOnline: friend.isOnline,
            lastActive: friend.lastActive,
          });
        });
      }
    } catch (error) {
      console.log("Error from fetching friends: " + error);
    }

    setFriends(friendList);
  };

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

  useEffect(() => {
    fetchCurrentUserFriends();
  }, []);

  return (
    <>
      <Box h="100vh" overflowY="auto" p={4} borderRadius="md" w="300px">
        <Stack>
          {friends.map((friend) => (
            <HStack
              key={friend.id}
              spacing={4}
              _hover={{ bg: "gray.300", cursor: "pointer", borderRadius: "md" }}
              p={2}
              onClick={() =>
                handleOpenChat(
                  friend.avatar,
                  friend.isOnline,
                  friend.id,
                  friend.name,
                  friend.isOnline === 1
                    ? "active"
                    : formatTimeFromDatabase(friend.lastActive)
                )
              }
            >
              <Avatar size="sm" src={friend.avatar} name={friend.name}>
                {friend.isOnline === 1 && (
                  <AvatarBadge boxSize="1.25em" bg="green.500" />
                )}
              </Avatar>
              <Text fontWeight="medium" mb={0}>
                {friend.name}
              </Text>
            </HStack>
          ))}
        </Stack>
      </Box>
    </>
  );
}
