import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useUser } from "./UserContext";
import { useChatConn } from './ChatConnContext';
import { handleAcceptRequest, handleCancelRequest, handleRemoveRequest, handleSendRequest } from '../utils/handleRequestFriend';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [receiver, setReceiver] = useState(null);
    const [post, setPost] = useState(null);
    const [content, setContent] = useState('');
    const { currentUser } = useUser();
    const { chatConn } = useChatConn();

    const handleSendRequestv2 = (currentUserId ,friendId, setFriendStatus, setIsUpdateFriends) => {
        handleSendRequest (currentUserId , friendId, setFriendStatus, setIsUpdateFriends);
        createNotification(friendId, 0, 'sent you a friend request', 3);
    };
    const handleAcceptRequestv2 = (currentUserId ,friendId, setFriendStatus, setIsUpdateFriends) => {
        handleAcceptRequest (currentUserId , friendId, setFriendStatus, setIsUpdateFriends);
        createNotification(friendId, 0, 'accepted your friend request', 4);
        console.log('currentUserId:', currentUserId, 'friendId:', friendId);
        deleteNotification(friendId, currentUserId , 0, 3);
    };
    const handleCancelRequestv2 = (currentUserId ,friendId, setFriendStatus, setIsUpdateFriends, onClose) => {
        handleCancelRequest (currentUserId , friendId, setFriendStatus, setIsUpdateFriends, onClose);
        console.log('currentUserId:', currentUserId, 'friendId:', friendId);
        deleteNotification(friendId,currentUserId , 0, 3);
    };
    const handleRemoveRequestv2 = (currentUserId ,friendId, setFriendStatus, setIsUpdateFriends, onClose) => {
        handleRemoveRequest (currentUserId , friendId, setFriendStatus, setIsUpdateFriends, onClose);
        console.log('currentUserId:', currentUserId, 'friendId:', friendId);
        deleteNotification(currentUserId ,friendId, 0, 3);
    };

    const deleteNotification = (user = null, receiver, post = null, action) => {
        const postId = post || 0;
        const user1 = user || currentUser;
        console.log('Deleting notification:', user1, receiver, postId, action);
        axios.delete(`${process.env.REACT_APP_API_URL}/notification/delete/${user1}/${receiver}/${postId}/${action}`)
            .then(response => {
                console.log('Notification deleted:', response?.data);
                if (chatConn) {
                    chatConn.invoke("DeleteNotification", receiver, response?.data);
                }
            })
            .catch(error => {
                console.error('Error deleting notification:', error);
            });
    };


    const createNotification = (receiverId, postId = null, contentStr, action) => {
        const post = postId || 0;
        if (post === null) {
            post = 0;
        }
        if (receiverId === currentUser) {
            return;
        }
        const timezoneOffset = 7 * 60; // GMT+7
        const vietnamTime = new Date(new Date().getTime() + timezoneOffset * 60 * 1000).toISOString();
        const notification = {
            user: currentUser,
            receiver: receiverId,
            post: post,
            content: contentStr,
            action_n: action,
            is_read: 0,
            timeline: vietnamTime
        };
        axios.post(`${process.env.REACT_APP_API_URL}/notification`, notification)
            .then(response => {
                console.log('Notification saved:', response?.data);
                if (chatConn) {
                    chatConn.invoke("SendNotification", receiverId, response?.data);
                }
            })
            .catch(error => {
                console.error('Error saving notification:', error);
            });
    }
    return (
        <NotificationContext.Provider value={{ receiver, setReceiver, post, setPost, content, setContent, createNotification, deleteNotification, handleAcceptRequestv2, handleSendRequestv2, handleCancelRequestv2, handleRemoveRequestv2 }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    return useContext(NotificationContext);
};
