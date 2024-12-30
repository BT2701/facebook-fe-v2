import React, { useEffect, useState, useRef } from 'react';
import './search.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useLocation } from 'react-router-dom';
import { Feed } from '../homepage/homecenter/Feed';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Flex, Image, Spinner, useDisclosure } from '@chakra-ui/react';
import { useSearchContext } from '../../context/SearchContext';
import { useUser } from '../../context/UserContext';
import { getFriendByUserId1AndUserId2, getRequestBySenderAndReceiver, getUserById } from '../../utils/getData';
import formatTimeFromDatabase from '../sharedComponents/formatTimeFromDatabase';
import axios from 'axios';
import { handleRemoveFriend } from '../../utils/handleRequestFriend';
import { useNotification } from '../../context/NotificationContext';

function SearchPage() {
    const { currentUser } = useUser();
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [keywords, setKeywords] = useState('');
    const { input } = useSearchContext();
    // const [errorFetchUser, setErrorFetchUser] = useState("");
    // const [errorFetchPost, setErrorFetchPost] = useState("");
    const limitUser = 10;
    const limitPost = 5;
    const [offsetUser, setOffsetUser] = useState(0);
    const [offsetPost, setOffsetPost] = useState(0);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const userScrollRef = useRef(null);
    const location = useLocation();
    const [idToRemove, setIdToRemove] = useState(-1);
    const { handleSendRequestv2, handleAcceptRequestv2, handleCancelRequestv2, handleRemoveRequestv2 } = useNotification();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const query = searchParams.get('keywords') || '';
        const querySearch = input === "" ? query.replace(/"/g, '') : input;

        setKeywords(querySearch);
        setUsers([]);
        setPosts([]);
        setOffsetUser(0);
        setOffsetPost(0);
        fetchPostsData(querySearch, 0);
        fetchUsersData(querySearch, 0);
    }, [input]);

    useEffect(() => {
        const handlePostScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight * 0.9 && !isLoadingPosts) {
                loadMorePosts();
            }
        };
        window.addEventListener('scroll', handlePostScroll);
        return () => window.removeEventListener('scroll', handlePostScroll);
    }, [isLoadingPosts, offsetPost]);

    useEffect(() => {
        const handleUserScroll = () => {
            const userScrollElement = userScrollRef.current;
            if (
                userScrollElement &&
                userScrollElement.scrollTop + userScrollElement.clientHeight >= userScrollElement.scrollHeight * 0.9 &&
                !isLoadingUsers
            ) {
                loadMoreUsers();
            }
        };
        const userScrollElement = userScrollRef.current;
        if (userScrollElement) {
            userScrollElement.addEventListener('scroll', handleUserScroll);
        }
        return () => {
            if (userScrollElement) {
                userScrollElement.removeEventListener('scroll', handleUserScroll);
            }
        };
    }, [isLoadingUsers, offsetUser]);

    const loadMorePosts = () => {
        setIsLoadingPosts(true);
        fetchPostsData(keywords, offsetPost + limitPost);
    };

    const loadMoreUsers = () => {
        setIsLoadingUsers(true);
        fetchUsersData(keywords, offsetUser + limitUser);
    };

    const fetchPostsData = async (keywords, offset) => {
        try {
            const postResponse = await axios.get(`${process.env.REACT_APP_API_URL}/post/search?content=${keywords}&limit=${limitPost}&offset=${offset}&currentUserId=${currentUser}`);
            const postData = await postResponse?.data;

            if (postData && Array.isArray(postData?.$values)) {
                // const postsWithUserData = await Promise.all(
                //     postData.$values.map(async (post) => {
                //         // const user = await getUserById(post?.userId);
                //         // return {
                //         //     user: user?.data,
                //         //     ...post,
                //         // };
                //     })
                // );
                // console.log("postwith", postsWithUserData);
                // setPosts((prevPosts) => [...prevPosts, ...postsWithUserData]);
                const fetchedPosts = await Promise.all(
                    postData.$values.map((post) =>
                        updatePostInfor(post.userId, post)
                    )
                );
                const uniquePosts = fetchedPosts.filter(
                    (newPost) => !posts.some((existingPost) => existingPost.id === newPost.id)
                );
                setPosts((prevPosts) => [...prevPosts, ...uniquePosts]);
                setOffsetPost(offset); // Update offset
            }
        } catch (error) {
            console.log('Error fetching posts:', error);
        } finally {
            setIsLoadingPosts(false);
        }
    };



    const { isOpen, onOpen, onClose } = useDisclosure(); // Dialog quản lý xóa bạn bè
    const cancelRef = React.useRef();
    const fetchUsersData = async (keywords, offset) => {
        try {
            const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/user/search?name=${keywords}&limit=${limitUser}&offset=${offset}`);
            const userData = await userResponse?.data;

            if (Array.isArray(userData)) {
                // Lấy thông tin trạng thái bạn bè cho mỗi người dùng
                const usersWithStatus = await Promise.all(
                    userData.map(async (user) => {
                        const friendStatus = await fetchFriendStatus(currentUser, user.id); // Giả sử bạn có hàm fetchFriendStatus
                        return { ...user, friendStatus };
                    })
                );

                setUsers((prevUsers) => [...prevUsers, ...usersWithStatus]);
                setOffsetUser(offset); // Cập nhật offset
            }
        } catch (error) {
            // setErrorFetchUser(error.message);
            console.log('Error fetching users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };
    const fetchFriendStatus = async (currentUserId, friendId) => {
        try {
            const resGetReq3 = await getFriendByUserId1AndUserId2(currentUserId, friendId);
            if (resGetReq3 && resGetReq3.length !== 0) {
                return "friend";
            }

            const resGetReq = await getRequestBySenderAndReceiver(friendId, currentUserId);
            if (resGetReq && resGetReq.length !== 0) {
                return "waiting";
            }

            const resGetReq2 = await getRequestBySenderAndReceiver(currentUserId, friendId);
            if (resGetReq2 && resGetReq2.length !== 0) {
                return "requestFriend";
            }

            return "notFriend";
        } catch (error) {
            console.error("Error fetching friend status:", error);
            return "notFriend";
        }
    };
    const updateUserStatus = (userId, status) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId ? { ...user, friendStatus: status } : user
            )
        );
    };

    const updatePostInfor = async (userId, post) => {
        try {
            const response = await getUserById(userId);
            if (response && response?.data) {
                post.profilePic = response?.data.avt;
                post.profileName = response?.data.name;
            } else {
                console.error('Lỗi: response hoặc response.data không xác định');
            }
            if (post.comments.$values.length && Array.isArray(post.comments.$values)) {
                const updatedComments = await Promise.all(
                    post.comments.$values.map(async (comment) => {
                        return await updateCommentInfor(comment.userId, comment);
                    })
                );
                post.comments.$value = updatedComments;
            }
            return post;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu người dùng:', error);
            return post;
        }
    };

    const updateCommentInfor = async (userId, comment) => {
        try {
            const response = await getUserById(userId);
            if (response && response?.data) {
                comment.profilePic = response?.data.avt;
                comment.profileName = response?.data.name;
            } else {
                console.error('Lỗi: response hoặc response.data không xác định');
            }

            return comment;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu người dùng:', error);
            return comment;
        }
    };

    const updateCommentsForPost = (postId, updatedComments) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId ? { ...post, comments: { $values: updatedComments } } : post
            )
        );
    };

    return (
        <div className="search-container">
            <div className="search-content" id="search-content">
                <div className="search-mid-title">
                    <h2>Search Results for "{keywords}"</h2>
                </div>

                {/* Render Users */}
                <div className='search-content-user-scroll' ref={userScrollRef}>
                    {
                        users?.length === 0 ? (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <span>There are currently no users matching the keyword : "{keywords}"</span>
                            </div>
                        ) : (
                            <div className="search-content-user">
                                {users?.filter((u) => u?.id !== currentUser).map((user) => (
                                    <div key={user.id} className="search-content-user-box">
                                        <Flex alignItems={"center"}>
                                            <Box
                                                style={{ marginLeft: "10px" }}
                                                w={'50px'}
                                                h={'50px'}
                                                overflow={'hidden'}
                                                rounded={'full'}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Image src={user?.avt} alt={user?.name} objectFit="cover" w="100%" h="100%" />
                                            </Box>
                                            <div className="search-content-user-box-mid">
                                                <div style={{ marginLeft: "0.5em" }} className="search-content-user-box-mid-name">
                                                    <Link to={`/profile?id=${user?.id}`}>{user?.name}</Link>
                                                </div>
                                            </div>
                                        </Flex>
                                        <>
                                            {user.friendStatus === "notFriend" && (
                                                <Button key={user.id} colorScheme="blue" onClick={() => handleSendRequestv2(currentUser, user.id, (status) => updateUserStatus(user.id, status))}>
                                                    Add friend
                                                </Button>
                                            )}
                                            {user.friendStatus === "friend" && (
                                                <div key={user.id}>
                                                    <Button colorScheme="green" onClick={() => {
                                                        setIdToRemove(user?.id)
                                                        onOpen()
                                                    }}>
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
                                                                    <Button colorScheme="red" onClick={() => handleRemoveFriend(currentUser, idToRemove, (status) => updateUserStatus(idToRemove, status), onClose)} ml={3}>
                                                                        Remove
                                                                    </Button>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialogOverlay>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                            {user.friendStatus === "waiting" && (
                                                <div key={user.id}>
                                                    <Button colorScheme="green" onClick={() => {
                                                        setIdToRemove(user?.id)
                                                        onOpen()
                                                    }}>
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
                                                                    <Button colorScheme="red" onClick={() => handleRemoveRequestv2(currentUser, idToRemove, (status) => updateUserStatus(idToRemove, status), onClose)} ml={3}>
                                                                        Remove
                                                                    </Button>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialogOverlay>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                            {user.friendStatus === "requestFriend" && (
                                                <div key={user.id}>
                                                    <Button colorScheme="green" onClick={() => handleAcceptRequestv2(currentUser, user.id, (status) => updateUserStatus(user.id, status))}>
                                                        Accept
                                                    </Button>
                                                    <Button colorScheme="red" onClick={() => handleCancelRequestv2(currentUser, user.id, (status) => updateUserStatus(user.id, status))} ml={2}>
                                                        Refuse
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    </div>
                                ))}
                            </div>
                        )
                    }
                    {isLoadingUsers && (
                        <div style={{ display: "flex", justifyContent: "center", margin: "10px" }}>
                            <Spinner size="sm" />
                        </div>
                    )}
                </div>

                {/* Render Posts */}
                <div className="search-content-post">
                    {
                        posts?.length === 0 ? (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <span>There are currently no posts matching the keyword : "{keywords}"</span>
                            </div>
                        ) : (
                            <div style={{ width: "500px", maxWidth: "500px" }}>
                                {posts?.map(post => (
                                    <Feed
                                        postId={post.id}
                                        profilePic={post.profilePic}
                                        content={post.content}
                                        timeStamp={formatTimeFromDatabase(post.timeline)}
                                        userName={post.profileName}
                                        postImage={post.image}
                                        likedByCurrentUser={post.likedByCurrentUser}
                                        likeCount={post.reactions.$values.length}
                                        commentList={post.comments.$values}
                                        currentUserId={currentUser}
                                        userCreatePost={post.userId}
                                        setPosts={setPosts}
                                        posts={posts}
                                        updateComments={updateCommentsForPost}
                                        updatePostInfor={updatePostInfor}
                                        updateCommentInfor={updateCommentInfor}
                                    // userId={post?.userId}
                                    />
                                ))}
                            </div>
                        )
                    }
                    {isLoadingPosts && (
                        <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                            <Spinner size="lg" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
