import { asArray, unwrap } from '../config/api';
import { http } from '../config/http';

export const getData = async (id, setState) => {
  const response = await getUserById(id);
  if (setState) {
    setState(response?.data || response);
  }
  return response?.data || response;
};

export const getDataInside = async (id, setState) => {
  const user = await getData(id);
  if (setState) {
    setState(user?.friend_ids);
  }
  return user?.friend_ids;
};

export const getDataRequest = async (id, setState) => {
  const user = await getData(id);
  if (setState) {
    setState(user?.friend_request_in_ids);
  }
  return user?.friend_request_in_ids;
};

export const getDataIterate = async (id, state, setState) => {
  const user = await getData(id);
  if (user && setState) {
    setState([...(state || []), user]);
  }
  return user;
};

export const getUserById = async (userId) => {
  try {
    const response = await http.get(`/user/api/user/${userId}`);
    return response?.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const getMessagesByUserId = async (userId) => {
  try {
    return await http.get(`/chat/api/messages`, { params: { userId } });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return null;
  }
};

export const getMessagesByUserIdAndContactId = async (
  userId,
  contactId,
  cursor = '',
  pageSize = 10
) => {
  try {
    return await http.get(`/chat/api/messages`, {
      params: { userId, contactId, cursor, pageSize },
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
};

export const getFriendsByUserId = async (userId) => {
  try {
    const response = await http.get(`/friend/friends/${userId}/friends`);
    const friends = response?.data?.data?.friends || [];
    const friendsData = await Promise.all(
      friends.map(async (friend) => {
        const otherId = friend.userID1 === userId ? friend.userID2 : friend.userID1;
        const user = await getUserById(otherId);
        return user?.data;
      })
    );
    return friendsData.filter(Boolean);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
};

export const fetchDataForNotification = async (currentUser) => {
  try {
    const response = await http.get(`/notification/receiver/${currentUser}`);
    return asArray(unwrap(response)?.notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markAllAsReadNotification = async (currentUser) => {
  try {
    await http.put(`/notification/markAllAsRead/${currentUser}`);
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};

export const markAsReadNotification = async (id) => {
  try {
    await http.put(`/notification/${id}`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const fetchDataForStory = async (userId) => {
  try {
    const response = await http.get(`/post/stories/user/${userId}`);
    return unwrap(response);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return null;
  }
};

export const getCommentsByPostId = async (postId) => {
  try {
    const response = await http.get(`/post/comments/post/${postId}`);
    return asArray(unwrap(response)?.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const getReactionByPostAndUser = async (postId, userId) => {
  try {
    const response = await http.get(`/post/reaction/${postId}/${userId}`);
    return unwrap(response)?.reaction || null;
  } catch {
    return null;
  }
};

export const hydratePost = async (post, currentUserId) => {
  const userId = post.user_id || post.userId;
  const user = await getUserById(userId);
  const profile = user?.data || user;
  const comments = await getCommentsByPostId(post.id);
  const hydratedComments = await Promise.all(
    comments.map(async (comment) => {
      const authorId = comment.user_id || comment.userId;
      const author = await getUserById(authorId);
      const authorData = author?.data || author;
      return {
        ...comment,
        user_id: authorId,
        profilePic: authorData?.avatar,
        profileName: authorData?.name,
      };
    })
  );
  const reaction = currentUserId
    ? await getReactionByPostAndUser(post.id, currentUserId)
    : null;
  const reactions = asArray(post.reactions);

  return {
    ...post,
    user_id: userId,
    profilePic: profile?.avatar,
    profileName: profile?.name,
    comments: hydratedComments,
    likedByCurrentUser: Boolean(reaction),
    likeCount: reactions.length,
  };
};

export const fetchDataForPostId = async (id, currentUserId) => {
  try {
    return await http.get(`/post/post-noti/${id}/${currentUserId}`);
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
};

export const getAllRequests = async (id) => {
  try {
    const response = await http.get('/friend/Request', { params: { id } });
    return response?.data?.data?.requests || response?.data || [];
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
};

export const getFriendByUserId1AndUserId2 = async (userId1, userId2) => {
  try {
    const response = await http.get(`/friend/friends/${userId1}/${userId2}`);
    return unwrap(response);
  } catch (error) {
    console.error('Error fetching friendship:', error);
    return { isFriend: false, friend: null };
  }
};

export const isFriendPair = async (userId1, userId2) => {
  const data = await getFriendByUserId1AndUserId2(userId1, userId2);
  return Boolean(data?.isFriend);
};

export const getRequestBySenderAndReceiver = async (sender, receiver) => {
  try {
    const response = await http.get(`/friend/Request/${sender}/${receiver}`);
    const request = response?.data?.data?.request;
    if (request) {
      return [request];
    }
    return [];
  } catch (error) {
    try {
      const response = await http.get(`/friend/Request/${receiver}/${sender}`);
      const request = response?.data?.data?.request;
      return request ? [request] : [];
    } catch (innerError) {
      console.error('Error fetching request:', innerError);
      return [];
    }
  }
};

export const deleteRequestBySenderIdAndReceiverId = async (senderId, receiverId) => {
  try {
    const response = await http.delete('/friend/Request/delete', {
      params: { senderId, receiverId },
    });
    return response.status;
  } catch (error) {
    return error.response?.status || 500;
  }
};

export const getDataRequests = async (id, pageNumber) => {
  try {
    const response = await http.get('/friend/Request/requests', {
      params: { id, pageNumber },
    });
    return response?.data?.data?.requests || response?.data || [];
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
};

export const deleteRequestById = async (id) => {
  try {
    const response = await http.delete(`/friend/Request/${id}`);
    return response.status;
  } catch (error) {
    return error.response?.status || 500;
  }
};

export const addRequest = async (sender, receiver) => {
  try {
    return await http.post('/friend/Request', {
      sender,
      receiver,
      timeline: new Date().toISOString(),
    });
  } catch (error) {
    return error.response || { status: 500 };
  }
};

export const getAllFriends = async (userId, pageNumber) => {
  const pageSize = 12;
  try {
    const friendsData = (await getFriendsByUserId(userId)) || [];
    const startIndex = (pageNumber - 1) * pageSize;
    return friendsData.slice(startIndex, startIndex + pageSize);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
};

export const removeFriend = async (userId, friendId) => {
  try {
    const response = await http.delete(`/friend/remove/${userId}/${friendId}`);
    return response.status;
  } catch (error) {
    return error.response?.status || 500;
  }
};

export const addFriend = async (userId1, userId2) => {
  try {
    const response = await http.post('/friend/friends', {
      userId1,
      userId2,
      isFriend: true,
      timeLine: new Date().toISOString(),
    });
    return response?.data;
  } catch (error) {
    console.error('Error adding friend:', error);
    return null;
  }
};

export const addFriendAndDeleteRequest = async (userId1, userId2, requestId) => {
  try {
    const response = await http.post('/friend/create-and-delete-request', {
      userId1,
      userId2,
      isFriend: true,
      timeLine: new Date().toISOString(),
      requestId,
    });
    return response.status;
  } catch (error) {
    return error.response?.status || 500;
  }
};

export const getFriendSuggestions = async (userId, pageNumber = 1) => {
  const pageSize = 12;
  try {
    const response = await http.get(`/friend/nonfriends/${userId}`);
    const suggestions = response?.data || [];
    const startIndex = (pageNumber - 1) * pageSize;
    return suggestions.slice(startIndex, startIndex + pageSize);
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    return [];
  }
};
