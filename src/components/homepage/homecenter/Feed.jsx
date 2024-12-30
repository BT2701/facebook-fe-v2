import React, { useState } from "react";
import { Avatar, Box, Input, Button, HStack, Text, Flex, useDisclosure, useToast } from "@chakra-ui/react";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { FiThumbsUp } from "react-icons/fi";
import { AiFillLike } from "react-icons/ai";
import { FaRegCommentAlt } from "react-icons/fa";
import { RiShareForwardLine } from "react-icons/ri";
import { CreatePost } from "./CreatePost";
import "./feed.css";
import axios from "axios";
import { useNotification } from "../../../context/NotificationContext";
import confirmDialog from '../../sharedComponents/confirmDialog';
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

export const Feed = ({
    postId,
    profilePic,
    postImage,
    userName,
    timeStamp,
    content,
    likedByCurrentUser,
    likeCount,  // khuyến khích thay đổi thành reactionList để đọc được người dùng
    commentList,
    currentUserId,
    userCreatePost,
    setPosts,
    posts,
    updateComments,
    updatePostInfor,
    updateCommentInfor,
    // userId
}) => {
    const [comments, setComments] = useState(commentList); // Stores comments
    const [newCommentContent, setNewComment] = useState(""); // New comment input
    const [commentVisible, setCommentVisible] = useState(false); // Toggles comment section visibility
    const [currentUserLiked, setCurrentUserLiked] = useState(likedByCurrentUser); // Toggles like
    const [numberLiked, setNumberLiked] = useState(likeCount);
    const [editingCommentId, setEditingCommentId] = useState(null); // Track the comment currently being edited
    const [editedContentComment, setEditedContentComment] = useState(""); // Track the content of the comment being edited
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const { createNotification, deleteNotification } = useNotification();
    const { friendList } = useUser();

    const handleLikeClicked = async () => {
        currentUserLiked ? handleUnLike() : handleLike();
    };

    const handleLike = async () => {
        const likeData = {
            UserId: currentUserId,
            Timeline: new Date().toISOString(), // Current timestamp
            PostId: postId,
        };

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/reaction`,
                likeData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    validateStatus: (status) => {
                        // Resolve only if the status code is within the range of 2xx or any specific ones you want to handle
                        return status >= 200 && status < 300; // This ensures only 2xx status codes trigger success response
                    }
                }
            );
            console.log(response.status);

            // Handle different response statuses
            if (response.status === 200) {
                // Optimistically update the UI
                setCurrentUserLiked(true);
                setNumberLiked((prev) => prev + 1); // Increment the local like count

                // Update posts state to reflect the like
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId
                            ? {
                                ...post,
                                likedByCurrentUser: true,
                                reactions: {
                                    $values: Array.from({ length: numberLiked + 1 }),
                                }, // Increment like count
                            }
                            : post
                    )
                );
            }

            // Trigger notification creation
            createNotification(userCreatePost, postId, "Liked your post", 1);
        } catch (error) {
            console.error("Error: ", error);
            // Optional: revert optimistic UI updates if there's an error
            // setCurrentUserLiked(false);
            if (error.status === 404) {
                toast({
                    title: "Error",
                    description: "The post does not exist.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
            else {
                toast({
                    title: "Error",
                    description: "Sorry! The system encountered an error during the process.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };


    const handleUnLike = async () => {
        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_API_URL}/reaction/${postId}/${currentUserId}`
            );

            // Check if the response indicates success
            if (response.status === 204) {
                // Optimistically update the UI
                setCurrentUserLiked(false);
                setNumberLiked((prev) => prev - 1); // Decrement local like count

                // Update posts state to reflect the unlike action
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId ? { ...post, likedByCurrentUser: false, reactions: { $values: Array.from({ length: numberLiked - 1 }) } } : post
                    )
                );
            }
            deleteNotification(null, userCreatePost, postId, 1);
        } catch (error) {
            console.error("Error: ", error);
            // Optional: revert optimistic update if there's an error
            // setCurrentUserLiked(true);
            if (error.status === 404) {
                toast({
                    title: "Error",
                    description: "The post does not exist.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
            else {
                toast({
                    title: "Error",
                    description: "Sorry! The system encountered an error during the process.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const handleCommentSubmit = async () => {
        if (!newCommentContent.trim()) {
            toast({
                title: "Error",
                description: "Comment content cannot be empty.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const commentInfo = {
            UserId: currentUserId,
            PostId: postId,
            Content: newCommentContent,
        };
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/comment`, commentInfo, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 201) {
                const commentCreated = response?.data;
                updateCommentInfor(commentCreated.userId, commentCreated).then((data) => {
                    const updatedComments = [data, ...comments];
                    setComments(updatedComments);
                    setNewComment("");
                    updateComments(postId, updatedComments); // Call update function
                })

            }
            createNotification(userCreatePost, postId, "Commented your post", 2);

        } catch (error) {
            console.error("Error: ", error);
            if (error.status === 404) {
                toast({
                    title: "Error",
                    description: "The post does not exist.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
            else {
                toast({
                    title: "Error",
                    description: "Sorry! The system encountered an error during the process.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const handleCommentOperation = async (action, commentId) => {
        if (action === "edit") {
            setEditingCommentId(commentId);
            const commentToEdit = comments.find((comment) => comment.id === commentId);
            setEditedContentComment(commentToEdit.content);
        } else if (action === "delete") {
            try {
                const confirmDelete = await confirmDialog(
                    'Permanently delete comment?',// Tiêu đề
                    'The comment will be permanently deleted and cannot be recovered.',// Nội dung
                    'warning' // Icon (có thể sử dụng 'warning', 'info', 'success', 'error', 'question')
                );
                if (!confirmDelete) return;
                const response = await axios.delete(`${process.env.REACT_APP_API_URL}/comment/${commentId}`);
                if (response.status === 204) {
                    const updatedComments = comments?.filter((comment) => comment.id !== commentId);
                    setComments(updatedComments);
                    updateComments(postId, updatedComments); // Call update function
                }
            } catch (error) {
                console.error("Error: ", error);
                console.log(error.status);
                if (error.status === 404) {
                    toast({
                        title: "Error",
                        description: "The post does not exist.",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                }
                else {
                    toast({
                        title: "Error",
                        description: "Sorry! The system encountered an error during the process.",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            }
        }
    };

    const handleSaveEditComment = async (commentEditId) => {
        if (!editedContentComment.trim()) {
            toast({
                title: "Error",
                description: "Comment content cannot be empty.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/comment/${commentEditId}`,
                {
                    Content: editedContentComment
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 204) {
                const updatedComments = comments?.map((comment) =>
                    comment.id === commentEditId ? { ...comment, content: editedContentComment } : comment

                );
                setComments(updatedComments);
                setEditingCommentId(null);
                updateComments(postId, updatedComments); // Call update function
            }
        } catch (error) {
            console.error("Error: ", error);
            console.log(error.status);
            if (error.status === 404) {
                toast({
                    title: "Error",
                    description: "The post does not exist.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
            else {
                toast({
                    title: "Error",
                    description: "Sorry! The system encountered an error during the process.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };


    const handleDeletePost = async (postDeleteId) => {
        const confirmDelete = await confirmDialog(
            'Permanently delete post?', // Tiêu đề
            'The post will be permanently deleted and cannot be recovered.', // Nội dung
            'warning' // Icon (có thể sử dụng 'warning', 'info', 'success', 'error', 'question')
        );
        if (!confirmDelete) return;

        try {
            setIsDeleting(true);
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/post/${postDeleteId}`);
            if (response.status === 204) {
                setIsDeleting(false);
                toast({
                    title: "Post deleted",
                    description: "Your post has been successfully deleted",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                const updatePosts = posts.filter((post) => post.id !== postDeleteId);
                setPosts(updatePosts);
                friendList.forEach(friend => {
                    if (friend.id !== currentUserId) {
                        deleteNotification(currentUserId, friend.id,  postDeleteId, 5);
                    }
                });
                
            } else {
                console.error("Error deleting post");
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    const nav = useNavigate();

    return (
        <Box w="100%" my="7px" position={"relative"}>

            <div className="feed" id={postId}>
                {/* Feed Header */}
                <div className="feed__top">
                    <div
                        onClick={() => {
                            nav("/profile?id=" + userCreatePost)
                        }}
                        style={{
                            display: "flex",
                            cursor: "pointer"
                        }}
                    >
                        <Avatar src={profilePic} className="feed__avatar" />
                        <div className="feed__topInfo">
                            <h3 style={{ marginBottom: "0px" }}>{userName}</h3>
                            <span>{timeStamp}</span>
                        </div>
                    </div>
                    {currentUserId === userCreatePost && (
                        <Menu>
                            <MenuButton as={Button} ms="auto">...</MenuButton>
                            <MenuList>
                                <MenuItem
                                    onClick={onOpen} // Open the modal when clicked
                                >
                                    Edit
                                </MenuItem>
                                <MenuItem onClick={() => handleDeletePost(postId)}>
                                    Delete
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    )}
                </div>

                {/* Feed Content */}
                <div className="feed__bottom">
                    <p>{content}</p>
                </div>

                {/* Feed Image */}
                <div className="feed__image">
                    <img src={postImage} alt="" />
                </div>


                {/* Feed Options (Like, Comment, Share) */}
                <div className="feed__options">
                    <div className="feed__option" onClick={handleLikeClicked}>
                        {currentUserLiked ? <AiFillLike style={{ color: "#0866fa" }} /> : <FiThumbsUp />}
                        <span style={{ paddingLeft: "10px", userSelect: "none", webkitUserSelect: "none", mozUserSelect: "none" }}>{numberLiked} Like</span>
                    </div>
                    <div
                        className="feed__option"
                        onClick={() => {
                            setCommentVisible(!commentVisible);
                            setEditingCommentId(null);
                        }}
                    >
                        <FaRegCommentAlt />
                        <span style={{ paddingLeft: "10px", userSelect: "none", webkitUserSelect: "none", mozUserSelect: "none" }}>{comments?.length} Comment</span>
                    </div>
                    <div className="feed__option">
                        <RiShareForwardLine />
                        <span style={{ paddingLeft: "10px", userSelect: "none", webkitUserSelect: "none", mozUserSelect: "none" }}>Share</span>
                    </div>
                </div>

                {/* Comment Section */}
                {commentVisible && (
                    <Box mt={4} className="comment-section">
                        {/* Input field for new comments */}
                        <HStack px={4}>
                            <Input
                                autoFocus
                                maxLength={499}
                                placeholder="Write a comment..."
                                value={newCommentContent}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <Button onClick={handleCommentSubmit} colorScheme="blue">
                                Post Comment
                            </Button>
                        </HStack>

                        {/* Display list of comments */}
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id}>
                                    <Flex padding="15px">
                                        <Avatar
                                            src={comment.profilePic}
                                            size="md"
                                        />
                                        <Box ml={2} bgColor="#f1f2f6" borderRadius="20px" padding="10px">
                                            <Text as="h5" fontSize='md' bgColor="none" >{comment.profileName}</Text>
                                            {/* Conditionally show the textarea if the comment is being edited */}
                                            {editingCommentId === comment.id ? (
                                                <Input
                                                    autoFocus
                                                    value={editedContentComment}
                                                    onChange={(e) => setEditedContentComment(e.target.value)}
                                                    mb={4}
                                                    maxLength={499}
                                                />
                                            ) : (
                                                <Text mb={4} as="span">{comment.content}</Text>
                                            )}

                                            {/* Show Save/Cancel buttons if editing */}
                                            {editingCommentId === comment.id && (
                                                <Box mt={3}>
                                                    <Button
                                                        size="sm"
                                                        colorScheme="blue"
                                                        onClick={() => handleSaveEditComment(comment.id)}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        ml={2}
                                                        onClick={() => setEditingCommentId(null)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Menu only shown if the logged-in user is the owner of the comment */}
                                        {currentUserId === comment.userId && (
                                            <Menu>
                                                <MenuButton as={Button}>...</MenuButton>
                                                <MenuList>
                                                    <MenuItem onClick={() => handleCommentOperation("edit", comment.id)}>
                                                        Edit
                                                    </MenuItem>
                                                    <MenuItem onClick={() => handleCommentOperation("delete", comment.id)}>
                                                        Delete
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        )}

                                    </Flex>
                                </div>
                            ))
                        ) : null}
                    </Box>
                )}
            </div>
            {/* Overlay Layer with Spinner when isDeleting is true */}
            {isDeleting && (
                <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    backgroundColor="rgba(255, 255, 255, 0.8)" // Semi-transparent white overlay
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    zIndex="10" // Ensure it appears above other content
                >
                    <div className="spinner-border text-dark" role="status"></div>
                    <span>Deleting...</span>
                </Box>
            )}
            {isOpen && <CreatePost setPosts={setPosts} isOpen={isOpen} onClose={onClose} postEditId={postId} postEditContent={content} postEditImage={postImage} currentUserId={currentUserId} updatePostInfor={updatePostInfor} />}
        </Box >
    );
};
