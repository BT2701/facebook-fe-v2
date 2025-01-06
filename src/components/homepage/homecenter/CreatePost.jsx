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
            formData.append("user_id", currentUserId);
            formData.append("post_id", "");
            formData.append("story_id", "");
            console.log("1234567890", currentUserId, postContent, image.name);
            // formData.append("contentPost", postContent);
            if (postEditId) {

            }
            else {
                // Create new post
                const createPostResponse = await axios.post(`${process.env.REACT_APP_API_URL}/post/posts`, {
                    content: postContent,
                    image: `${process.env.REACT_APP_API_URL}/media/uploads/${image.name}`,
                    user_id: currentUserId,
                });
                setPosts((prevPosts) => [createPostResponse?.data.data.post, ...prevPosts]);
                formData.append("post_id", createPostResponse?.data.data.post.id);
                console.log("createPostResponse: ", createPostResponse.data.data);
                if (createPostResponse?.data.data.post.image) {
                    const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/media/image`, formData);
                }
                if(createPostResponse.status === 200){
                    setLastPostId(createPostResponse?.data.data.post.id);
                    toast({
                        title: "Success",
                        description: "Post created successfully",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });
                }
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
