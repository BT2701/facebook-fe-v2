import React, { createContext, useContext, useState } from 'react';
import { useUser } from './UserContext';
import { http } from '../config/http';
import { handleAcceptRequest, handleCancelRequest, handleRemoveRequest, handleSendRequest } from '../utils/handleRequestFriend';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [receiver, setReceiver] = useState(null);
    const [post, setPost] = useState(null);
    const [content, setContent] = useState('');
    const [inboxTick, setInboxTick] = useState(0);
    const { currentUser } = useUser();

    const refreshInbox = () => setInboxTick((value) => value + 1);

    const handleSendRequestv2 = (currentUserId, friendId, setFriendStatus, setIsUpdateFriends) => {
        handleSendRequest(currentUserId, friendId, setFriendStatus, setIsUpdateFriends);
        refreshInbox();
    };

    const handleAcceptRequestv2 = (currentUserId, friendId, setFriendStatus, setIsUpdateFriends) => {
        handleAcceptRequest(currentUserId, friendId, setFriendStatus, setIsUpdateFriends);
        deleteNotification(friendId, currentUserId, 0, 3);
        refreshInbox();
    };

    const handleCancelRequestv2 = (currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose) => {
        handleCancelRequest(currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose);
        deleteNotification(friendId, currentUserId, 0, 3);
        refreshInbox();
    };

    const handleRemoveRequestv2 = (currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose) => {
        handleRemoveRequest(currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose);
        deleteNotification(currentUserId, friendId, 0, 3);
        refreshInbox();
    };

    const deleteNotification = (user = null, receiverId, postId = null, action) => {
        const resolvedPost = postId || 0;
        const actor = user || currentUser?.id;
        if (!actor || !receiverId) {
            return;
        }
        http.delete(`/notification/delete/${actor}/${receiverId}/${resolvedPost}/${action}`).catch((error) => {
            console.error('Error deleting notification:', error);
        });
    };

    const createNotification = () => {
        refreshInbox();
    };

    return (
        <NotificationContext.Provider
            value={{
                receiver,
                setReceiver,
                post,
                setPost,
                content,
                setContent,
                createNotification,
                deleteNotification,
                handleAcceptRequestv2,
                handleSendRequestv2,
                handleCancelRequestv2,
                handleRemoveRequestv2,
                inboxTick,
                refreshInbox,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    return useContext(NotificationContext);
};
