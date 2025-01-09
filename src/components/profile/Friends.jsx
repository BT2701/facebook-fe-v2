import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Center, Flex, Heading, Image, SimpleGrid, Text, useDisclosure } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addFriend, addRequest, deleteRequestById, deleteRequestBySenderIdAndReceiverId, getFriendByUserId1AndUserId2, getFriendsByUserId, getRequestBySenderAndReceiver, removeFriend } from "../../utils/getData";
import { useOutletContext } from "react-router-dom/dist";
import { useUser } from "../../context/UserContext";
import { handleAcceptRequest, handleCancelRequest, handleRemoveFriend, handleRemoveRequest, handleSendRequest } from "../../utils/handleRequestFriend";


const FriendBox = ({ currentUserId, name, src, friendId, setIsUpdateFriends }) => {
    const navigate = useNavigate();
    const handleOnclick = (id) => {
        navigate("/profile?id=" + id);
    }

    const [friendStatus, setFriendStatus] = useState("notFriend");
    const { isOpen, onOpen, onClose } = useDisclosure(); // Dialog quản lý xóa bạn bè
    const cancelRef = React.useRef();

    useEffect(() => {
        const handleRequestAndFriend = async () => {
            const resGetReq3 = await getFriendByUserId1AndUserId2(currentUserId, friendId);
            if(resGetReq3 && resGetReq3.length !== 0) {
                setFriendStatus("friend");
                return;
            }

            const resGetReq = await getRequestBySenderAndReceiver(friendId, currentUserId);
            if(resGetReq && resGetReq.length !== 0) {
                setFriendStatus("waiting");
                return;
            }

            const resGetReq2 = await getRequestBySenderAndReceiver(currentUserId, friendId);
            if(resGetReq2 && resGetReq2.length !== 0) {
                setFriendStatus("requestFriend");
                return;
            }
        }
        handleRequestAndFriend();
    }, [currentUserId, friendId])

    return (
        <Box border={'1px solid #e4e4e4'} h={'120px'} rounded={6} p={3}>
            <Flex alignItems={"center"} justifyContent={"space-between"}>
                <Flex onClick={() => handleOnclick(friendId)} >
                    <Center w={'95px'} h={'95px'} overflow={'hidden'} rounded={10} mr={5}>
                        <Image w={'100%'} height={'100%'} src={src} objectFit={'cover'} />
                    </Center>
                    <Center h={'95px'}>
                        <Heading cursor={'pointer'} fontSize={16}>{name}</Heading>
                    </Center>
                </Flex>
                <>
                    {friendStatus === "notFriend" && (
                        <Button colorScheme="blue" onClick={() => handleSendRequest(currentUserId, friendId, setFriendStatus, setIsUpdateFriends)}>
                            Add friend
                        </Button>
                    )}
                    {friendStatus === "friend" && (
                        <>
                            <Button colorScheme="green" onClick={onOpen}>
                                Friend
                            </Button>
                            <AlertDialog
                                isOpen={isOpen}
                                leastDestructiveRef={cancelRef}
                                onClose={onClose}
                            >
                                <AlertDialogOverlay>
                                    <AlertDialogContent>
                                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                            Remove friend
                                        </AlertDialogHeader>
                                        <AlertDialogBody>
                                            Are you sure you want to remove friends?
                                        </AlertDialogBody>
                                        <AlertDialogFooter>
                                            <Button ref={cancelRef} onClick={onClose}>
                                                Cancel
                                            </Button>
                                            <Button colorScheme="red" onClick={() => handleRemoveFriend(currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose)} ml={3}>
                                                Remove
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialogOverlay>
                            </AlertDialog>
                        </>
                    )}
                    {friendStatus === "waiting" && (
                        <>
                            {/* <Button colorScheme="green" onClick={onOpen}>
                                Waiting for response
                            </Button>
                            <AlertDialog
                                isOpen={isOpen}
                                leastDestructiveRef={cancelRef}
                                onClose={onClose}
                            >
                                <AlertDialogOverlay>
                                    <AlertDialogContent>
                                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                            Remove friend request
                                        </AlertDialogHeader>
                                        <AlertDialogBody>
                                            Are you sure you want to remove friend request?
                                        </AlertDialogBody>
                                        <AlertDialogFooter>
                                            <Button ref={cancelRef} onClick={onClose}>
                                                Cancel
                                            </Button>
                                            <Button colorScheme="red" onClick={() => handleRemoveRequest(currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose)} ml={3}>
                                                Remove
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialogOverlay>
                            </AlertDialog> */}
                        <Button 
                            colorScheme="blue" 
                            onClick={() => handleRemoveRequest(currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose)} ml={3}>
                            Cancel Request
                        </Button>
                        </>
                    )}
                    {friendStatus === "requestFriend" && (
                        <>
                            {/* <Button colorScheme="green" onClick={() => handleAcceptRequest(currentUserId, friendId, setFriendStatus, setIsUpdateFriends)}>
                                Accept
                            </Button>
                            <Button colorScheme="red" onClick={() => handleCancelRequest(currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose)} ml={2}>
                                Refuse
                            </Button> */}

                            <Button 
                                colorScheme="blue" 
                                onClick={() => handleAcceptRequest(currentUserId, friendId, setFriendStatus, setIsUpdateFriends)}>
                                Confirm
                            </Button>
                            <Button 
                                onClick={() => handleCancelRequest(currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose)} ml={2}
                                _hover={{ bg: "#d3d3d3" }}
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                </>
            </Flex>
        </Box>
    );
};

const NewText = () => {
    return (
        <Flex justify={'center'} mt={'50px'}>
            <Text fontSize={20} color={'grey'} fontWeight={800}>No friends to show</Text>
        </Flex>
    )
}

export const Friends = () => {
    const { currentUser } = useUser();
    const [ user, setUser, isRefreshFriends ] = useOutletContext();
    const [friends, setFriends] = useState([]);
    const [isUpdateFriends, setIsUpdateFriends] = useState(false);
    
    useEffect(() => {
        if(user?.id) {
            const getFriends = async () => {
                const friendRes = await getFriendsByUserId(user?.id);
                setFriends(friendRes);
                console.log("danh sach ban be",friendRes);
            }
            getFriends();
        }
    }, [user, isRefreshFriends, isUpdateFriends])

    return (
        <>
            <Box bg={'#f0f2f5'} minH={'300px'} pt={5} pb={'100px'} >

                <Box w={'950px'} m={'auto'} bg={'white'} rounded={6} minH={'200px'} p={5}>

                    <Heading fontSize={23}>Friends</Heading>
                    {
                        friends.filter(fr => fr?.id !== currentUser.id).length === 0 ? (
                            <NewText /> 
                        ) : (
                            <SimpleGrid columns={2} spacing={10} mt={8}>
                                {
                                    friends.filter(fr => fr?.id !== currentUser.id).map((f) => (
                                        <FriendBox currentUserId={currentUser.id} setIsUpdateFriends={setIsUpdateFriends} friendId={f?.id} key={f?.id} name={f?.name} src={f?.avatar  || "https://archive.org/download/placeholder-image/placeholder-image.jpg"} />
                                    ))
                                }
                            </SimpleGrid>
                        )
                    }
                </Box>
            </Box>
        </>
    );
};

//"https://via.placeholder.com/200"