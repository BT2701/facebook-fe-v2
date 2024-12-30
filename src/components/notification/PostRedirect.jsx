import React, { useState, useEffect } from 'react';
import { Feed } from '../homepage/homecenter/Feed';
import { fetchDataForPostId, getUserById } from '../../utils/getData';
import formatTimeFromDatabase from '../sharedComponents/formatTimeFromDatabase';
import './postRedirect.css';
import {useToast } from "@chakra-ui/react";
import { useNotification } from '../../context/NotificationContext';

const PostRedirect = ({ feedId, open, onClose, currentUser, user, action }) => {
    const [post, setPost] = useState({});
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null); // State to handle error messages
    const toast = useToast();
    const { createNotification, deleteNotification } = useNotification();


    const updatePostInfo = async (userId, post) => {
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
                        return await updateCommentInfo(comment.userId, comment);
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

    const updateCommentInfo = async (userId, comment) => {
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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setErrorMessage(null); // Reset error message on new fetch

            try {
                const response = await fetchDataForPostId(feedId, currentUser);
                const data = await response?.data;
                if (data) {
                    const p = await updatePostInfo(data.userId, data);
                    setPost(p || {});
                } else {
                    setErrorMessage('Post does not exist');
                    if (action === 5) {
                        deleteNotification(currentUser, user, feedId, action);
                    }
                    else {
                        deleteNotification(user, currentUser, feedId, action);
                    }
                }
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
                setErrorMessage('An error occurred while loading the post');
                if (action === 5) {
                    deleteNotification(currentUser, user, feedId, action);
                }
                else {
                    deleteNotification(user, currentUser, feedId, action);
                }            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchData();
        }
    }, [feedId, open]);

    if (!open) return null;
    if (loading) {
        return <div>Loading...</div>;
    }
    if (errorMessage) {
        if (!toast.isActive("error-toast")) {
            toast({
                id: "error-toast",
                title: "Not Found!",
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
        return null;
    }

    return (
        <div className="pr-custom-dialog-overlay">
            <div className="pr-custom-dialog">
                <div className="pr-custom-dialog-header">
                    <h3>Post</h3>
                    <button className="btn btn-danger" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="pr-custom-dialog-content">
                    <Feed
                        postId={post.id}
                        profilePic={post.profilePic}
                        content={post.content}
                        timeStamp={post.timeline ? formatTimeFromDatabase(post.timeline) : 'Ngày không hợp lệ'}
                        userName={post.profileName}
                        postImage={post.image}
                        likedByCurrentUser={post.likedByCurrentUser}
                        likeCount={post.reactions?.$values.length || 0}
                        commentList={post.comments?.$values || []}
                        currentUserId={currentUser}
                        userCreatePost={post.userId}
                        setPosts={setPosts}
                        posts={posts}
                        updateComments={updateCommentsForPost}
                        updatePostInfor={updatePostInfo}
                        updateCommentInfor={updateCommentInfo}
                    />
                </div>
                <div className="pr-custom-dialog-actions">
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default PostRedirect;
