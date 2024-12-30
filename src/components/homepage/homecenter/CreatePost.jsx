import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    Divider,
    Textarea,
    VStack,
    HStack,
    Text,
    useToast,
    IconButton,
    Input
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { CloseIcon } from "@chakra-ui/icons";
import { useUser } from "../../../context/UserContext";
import { useNotification } from "../../../context/NotificationContext";

export const CreatePost = ({ setPosts, isOpen, onClose, postEditId, postEditContent, postEditImage, currentUserId, setLastPostId, updatePostInfor }) => {
    const [postContent, setPostContent] = useState(postEditContent ? postEditContent : "");
    const [image, setImage] = useState(postEditImage);
    //0 : không tác động đến image, 1: xóa image, 2: thay đổi image. 
    const [discriptionActionToImage, setDiscriptionActionToImage] = useState(0);
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { friendList } = useUser();
    const { createNotification, deleteNotification } = useNotification();

    const handlePostSubmit = async () => {

        if (!postContent.trim() && !image) {
            toast({
                title: "Error",
                description: "Post content cannot be empty",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        //thực hiện block chức năng nhập content, chọn ảnh, click submit 
        setIsLoading(true);
        try {

            const formData = new FormData();
            formData.append("imageFile", typeof (image) === "string" ? null : image);
            formData.append("contentPost", postContent);
            formData.append("userId", currentUserId);
            if (postEditId)
                formData.append("discriptionActionToImage", discriptionActionToImage);
            const url = postEditId
                ? `${process.env.REACT_APP_API_URL}/post/${postEditId}`
                : `${process.env.REACT_APP_API_URL}/post`;
            const method = postEditId ? 'put' : 'post';
            const response = await axios({
                method,
                url,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.status === 200) {
                onClose();
                setPostContent("");
                setImage(null);
                setIsLoading(false);
                toast({
                    title: postEditId ? 'Post updated' : 'Post created',
                    description: postEditId ? 'Your post has been successfully updated.' : 'Your post has been successfully created.',
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });

                const postCreated = response?.data;
                updatePostInfor(postCreated.userId, postCreated)
                    .then((data) => {
                        if (postEditId) {
                            // Update only the edited post in the list
                            setPosts((prevPosts) =>
                                prevPosts.map((post) => (post.id === postEditId ? data : post))
                            );
                        } else {

                            setPosts((prevPosts) => {
                                if (prevPosts.length === 0) {
                                    setLastPostId(data.id);
                                }
                                return [data, ...prevPosts];
                            })
                        }
                    })
                    friendList.forEach(friend => {
                        if (friend.id !== currentUserId) {
                            createNotification(friend.id, postCreated.id, 'created a new post', 5);
                        }
                    });
            }
        } catch (error) {
            setIsLoading(false);
            toast({
                title: "Error",
                description: error.response?.data?.message || `There was an error ${postEditId ? "edit" : "create"} your post. Please try again.`,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleChangeImage = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
            setImage(file);
            setDiscriptionActionToImage(2);
        } else {
            alert("Please select a valid image file (PNG or JPEG)");
        }
    };

    const handleRemoveImage = () => {
        setImage(""); // Clear the selected image
        setDiscriptionActionToImage(1);
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} size={"lg"}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{postEditId ? 'Edit Post' : 'Create Post'}</ModalHeader>
                <ModalCloseButton />
                <Divider />
                <ModalBody>
                    <VStack gap={3} mb={"20px"}>
                        <Textarea
                            autoFocus
                            minH={"200px"}
                            fontSize={23}
                            resize="none"
                            maxLength={999}
                            placeholder="What's on your mind?"
                            value={postContent}
                            isDisabled={isLoading}
                            onChange={(e) => setPostContent(e.target.value)}

                        />
                        <HStack>
                            <Text fontSize={20} fontWeight={500}>
                                Add Image:
                            </Text>
                            <Input type={"file"} isDisabled={isLoading} accept="image/png, image/jpeg" onChange={handleChangeImage} />
                        </HStack>
                        {image && (
                            <div style={{ position: "relative", display: "inline-block" }}>
                                <img
                                    src={typeof image === "string" ? image : URL.createObjectURL(image)}
                                    alt="Selected"
                                    style={{ width: "300px", marginTop: "10px" }}
                                />
                                <IconButton
                                    icon={<CloseIcon />}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={handleRemoveImage}
                                    aria-label="Remove image"
                                    isDisabled={isLoading}
                                    style={{
                                        position: "absolute",
                                        top: "5px",
                                        right: "5px",
                                        backgroundColor: "#80807f"
                                    }}
                                    _hover={{
                                        backgroundColor: isLoading ? "#80807f" : "red!important",
                                    }}

                                />
                            </div>
                        )}
                        <Button
                            colorScheme="blue"
                            w="100%"
                            onClick={handlePostSubmit}
                            isDisabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner-border text-light" role="status"></div>
                                    <span>{postEditId ? " Editing..." : " Creating..."}</span>
                                </>
                            ) : (
                                <span>{postEditId ? "Edit Post" : "Create Post"}</span>
                            )}
                        </Button>

                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
