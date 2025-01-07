import axios from "axios";

export const getData = (id, setState) => {
  fetch(`http://localhost:1234/user/${id}`)
    .then((res) => res.json())
    .then((res) => {
      setState(res);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getDataInside = (id, setState) => {
  fetch(`http://localhost:1234/user/${id}`)
    .then((res) => res.json())
    .then((res) => {
      setState(res.friend_ids);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getDataRequest = (id, setState) => {
  fetch(`http://localhost:1234/user/${id}`)
    .then((res) => res.json())
    .then((res) => {
      setState(res.friend_request_in_ids);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getDataIterate = (id, state, setState) => {
  fetch(`http://localhost:1234/user/${id}`)
    .then((res) => res.json())
    .then((res) => {
      state.push(res);
      setState([...state]);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/user/api/user/${userId}`
    );

    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getMessagesByUserId = async (userId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/message/UserMessages/${userId}/latest`
    );

    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const getMessagesByUserIdAndContactId = async (
  userId,
  contactId,
  cursor = "",
  pageSize = 10
) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/message/UserMessages/` +
        `${userId}/${contactId}`,
      {
        params: {
          cursor,
          pageSize,
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// Get friend of current user
export const getFriendsByUserId = async (userId, currentUserId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/friend/friends/${userId}/friends`
    );
    const friends = response?.data.data.friends;
    const friendsData = await Promise.all(friends.map(async (friend) => {
      if (friend.userID1 === currentUserId) {
        return (await getUserById(friend.userID2)).data;
      } else {
        return (await getUserById(friend.userID1)).data;
      }
    }));
    return friendsData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// notification
export const fetchDataForNotification = async ( currentUser ) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/notification/receiver/` + currentUser
    );
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const markAllAsReadNotification = async (currentUser) => {
  try {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/notification/markAllAsRead/` +
        currentUser,
      {},
      { withCredentials: true }
    );
  } catch (error) {
    console.error("Error marking all as read:", error);
  }
};
export const markAsReadNotification = async (id) => {
  try {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/notification/${id}`,
      {},
      { withCredentials: true }
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

// story
export const fetchDataForStory = async (userId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/story?userId=${userId}`);
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// post
export const fetchDataForPostId = async (id, currentUserId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/post/post-noti/${id}/${currentUserId}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

//friend request
export const getAllRequests = async (id) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/Request`,
      {
        params: { id }, // Truyền tham số vào URL
      }
    );
    return response?.data; // Đảm bảo trả về dữ liệu
  } catch (error) {
    console.error("Error fetching requests:", error);
    return null; // Trả về null nếu có lỗi
  }
};

export const getFriendByUserId1AndUserId2 = async (UserId1, UserId2) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/friend/friends/${UserId1}/${UserId2}`
    );
    return response?.data; // Đảm bảo trả về dữ liệu
  } catch (error) {
    console.error("Error fetching requests:", error);
    return null; // Trả về null nếu có lỗi
  }
};
export const getRequestBySenderAndReceiver = async (Sender, Receiver) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/Request/${Sender}/${Receiver}`
    );
    return response?.data; // Đảm bảo trả về dữ liệu
  } catch (error) {
    console.error("Error fetching requests:", error);
    return null; // Trả về null nếu có lỗi
  }
};
export const deleteRequestBySenderIdAndReceiverId = async (
  senderId,
  receiverId
) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/Request/delete?senderId=${senderId}&receiverId=${receiverId}`
    ); // Gọi API DELETE

//     if (response.status === 204) {
//       // Nếu thành công
//       return true; // Trả về true để xác nhận xóa thành công
//     }
//   } catch (error) {
//     console.error("Error deleting request:", error);
//     return false; // Trả về false nếu có lỗi

      console.log("status"+response.status);
      if (response.status === 204) { // Nếu thành công
          return response.status; // Trả về true để xác nhận xóa thành công
      }
  } catch (error) {
    console.error('Error deleting request:', error);
      
    // Kiểm tra lỗi và trả về mã trạng thái lỗi tương ứng
    if (error.response) {
        // Nếu có lỗi từ server (ví dụ: 404, 500)
        return error.response.status; // Trả về mã lỗi từ server
    } else {
        // Lỗi khác
        return 500; // Trả về 500 cho lỗi không xác định
    }
  }
};

// Hàm lấy danh sách yêu cầu theo phân trang
export const getDataRequests = async (id, pageNumber) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/Request/requests`,
      {
        params: { id, pageNumber }, // Truyền tham số vào URL
      }
    );
    return response?.data; // Đảm bảo trả về dữ liệu
  } catch (error) {
    console.error("Error fetching requests:", error);
    return null; // Trả về null nếu có lỗi
  }
};

// Hàm xóa yêu cầu theo ID
export const deleteRequestById = async (id) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/Request/${id}`
    ); // Gọi API DELETE

    // Trả về status code từ response
    return response.status; // Ví dụ: 204, 404, 500, v.v.
  } catch (error) {
    console.error("Error deleting request:", error);

    // Kiểm tra lỗi và trả về mã trạng thái lỗi tương ứng
    if (error.response) {
      // Nếu có lỗi từ server (ví dụ: 404, 500)
      return error.response.status; // Trả về mã lỗi từ server
    } else if (error.request) {
      // Nếu không nhận được phản hồi từ server
      return 500; // Trả về 500 cho lỗi server
    } else {
      // Lỗi khác
      return 500; // Trả về 500 cho lỗi không xác định
    }
  }
};

// Hàm thêm yêu cầu
export const addRequest = async (sender, receiver) => {
  try {
    const requestBody = {
      sender, // Giá trị sender
      receiver, // Giá trị receiver
      time: new Date().toISOString(), // Sửa trường Timeline thành time
    };

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/Request`,
      requestBody
    ); // Gọi API POST

//     if (response.status === 200) {
//       // Nếu thành công, thường thì 201 là cho tạo mới
//       return response.data; // Trả về dữ liệu của yêu cầu mới tạo
//     }
//   } catch (error) {
//     console.error("Error adding request:", error);
//     return false; // Trả về null nếu có lỗi
      // Nếu response trả về 200, yêu cầu đã thành công
      if (response.status === 200) {
        return response; // Trả về response nếu thành công
      }

  } catch (error) {
    if (error.response) {
      // Trả về mã lỗi và thông tin lỗi từ backend nếu có
      console.error('Error response:', error.response?.data);
      return error.response; // Trả về toàn bộ phản hồi lỗi từ backend
    }
    // Nếu có lỗi không phải là phản hồi từ server (ví dụ lỗi mạng)
    console.error("Lỗi không xác định:", error.message);
    return { status: 500, message: "Lỗi không xác định" }; // Lỗi không xác định
  }
};

//friend
//hàm lấy danh sách user là bạn của userId
export const getAllFriends = async (userId, pageNumber) => {
  const pageSize = 12;
  try {
    const FriendsData = await getFriendsByUserId(userId);
    const friendsData = FriendsData?.data;
    // Tính toán chỉ số bắt đầu và kết thúc dựa trên số trang và kích thước trang
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Cắt mảng dữ liệu bạn bè dựa trên trang và kích thước
    const paginatedFriends = friendsData.slice(startIndex, endIndex);

    // Giả lập thời gian chờ như đang gọi API thực
    await new Promise((resolve) => setTimeout(resolve, 500));

    return paginatedFriends; // Trả về dữ liệu bạn bè đã phân trang
  } catch (error) {
    console.error("Error fetching friends:", error);
    return null; // Trả về null nếu có lỗi
  }
};

// Hàm xóa quan hệ bạn bè
export const removeFriend = async (userId, friendId) => {
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_URL}/friend/remove/${userId}/${friendId}`,
      { withCredentials: true }
    );

    // Trả về mã trạng thái từ response
    return response.status;
  } catch (error) {
    if (error.response) {
      // Trả về mã lỗi từ backend nếu có
      return error.response.status; // Ví dụ: 400, 404, 500
    }
    console.error("Lỗi không xác định:", error.message);
    return 500; // Lỗi không xác định, mặc định trả về 500
  }
};

// Hàm thêm bạn bè mới với TimeLine
export const addFriend = async (userId1, userId2) => {
  try {
    // Lấy thời gian hiện tại làm TimeLine
    const timeLine = new Date().toISOString(); // ISO 8601 format

    const friendData = {
      userId1: userId1,
      userId2: userId2,
      isFriend: true, // Hoặc các thuộc tính khác nếu có
      timeLine: timeLine, // Thêm TimeLine vào data
    };

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/friend`,
      friendData,
      { withCredentials: true }
    );

    return response?.data;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.error("Bạn bè đã tồn tại:", error.response?.data);
    } else {
      console.error("Lỗi khi thêm bạn bè:", error);
    }
    return null;
  }
};

export const addFriendAndDeleteRequest = async (
  userId1,
  userId2,
  requestId
) => {
  try {
    // Lấy thời gian hiện tại làm TimeLine
    const timeLine = new Date().toISOString(); // ISO 8601 format

    // Tạo dữ liệu friendData cho việc thêm bạn bè
    const friendData = {
      userId1: userId1,
      userId2: userId2,
      isFriend: true,
      timeLine: timeLine,
      requestId: requestId, // Gửi requestId để API có thể xóa yêu cầu kết bạn
    };

    // Gửi yêu cầu POST để thêm bạn bè và xóa yêu cầu kết bạn trong một lần gọi
    const addFriendResponse = await axios.post(
      `${process.env.REACT_APP_API_URL}/friend/create-and-delete-request`,
      friendData,
      { withCredentials: true }
    );

    return addFriendResponse.status; // Ví dụ: 201 (Thành công), 404 (Không tìm thấy), 500 (Lỗi server)
  } catch (error) {
    if (error.response) {
      // Trả về mã lỗi từ backend nếu có
      return error.response.status; // Ví dụ: 400, 404, 500
    }
    console.error("Lỗi không xác định:", error.message);
    return 500; // Lỗi không xác định, mặc định trả về 500
  }
};

// Hàm để lấy gợi ý bạn bè với phân trang
export const getFriendSuggestions = async (userId, pageNumber = 1) => {
  const pageSize = 12;
  try {
    // Tạo URL với query params bao gồm userId và friendRequests
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/friend/nonfriends/${userId}`
    );
    let suggestions = response?.data;

    // Giả lập thời gian chờ như gọi API thực tế
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Tính toán phân trang
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Cắt mảng dữ liệu gợi ý theo phân trang
    const paginatedSuggestions = suggestions.slice(startIndex, endIndex);

    return paginatedSuggestions;
  } catch (error) {
    console.error("Error fetching friend suggestions:", error);
    return null; // Trả về null nếu có lỗi
  }
};
