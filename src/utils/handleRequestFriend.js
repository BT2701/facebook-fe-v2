import { addFriend, addRequest, deleteRequestById, deleteRequestBySenderIdAndReceiverId, getRequestBySenderAndReceiver, removeFriend ,addFriendAndDeleteRequest} from "./getData";

// Hàm xử lý khi nhấn "Thêm bạn bè"
export const handleSendRequest = async (currentUserId, friendId, setFriendStatus, setIsUpdateFriends) => {
    const response = await addRequest(currentUserId, friendId);
    if (response) {
        setFriendStatus("waiting");
        if (setIsUpdateFriends) setIsUpdateFriends(prev => !prev);
    }
};

// Hàm xử lý khi xác nhận lời mời kết bạn
// *****************
//gọi hàm addFriendAndDeleteRequest để đồng bộ
export const handleAcceptRequest = async (currentUserId, friendId, setFriendStatus, setIsUpdateFriends) => {
    const resGetReq = await getRequestBySenderAndReceiver(currentUserId,friendId);
    if (resGetReq && resGetReq.length > 0) {
        const response = await addFriendAndDeleteRequest(currentUserId, friendId,resGetReq[0]?.id);
        if (response ==204 ) {
            setFriendStatus("friend");
            if (setIsUpdateFriends) setIsUpdateFriends(prev => !prev);
        }else{
            console.error("error serve");
        }
    }
    else if(resGetReq.length == 0){
        alert("user deleted request");
        setFriendStatus("notFriend");
        if (setIsUpdateFriends) setIsUpdateFriends(prev => !prev);
    }else{
        console.error("error serve");
    }
};

// Hàm xử lý khi từ chối lời mời kết bạn
export const handleCancelRequest = async (currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose) => {
    const response = await deleteRequestBySenderIdAndReceiverId(friendId, currentUserId);
    if (response == 204 || response ==404) {
        setFriendStatus("notFriend");
        if (setIsUpdateFriends) setIsUpdateFriends(prev => !prev);
        if (onClose) onClose();
    }else if(response==500){
        console.error("error serve");
    }
};

// Hàm xử lý khi xóa bạn bè
export const handleRemoveFriend = async (currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose) => {
    const response = await removeFriend(currentUserId, friendId);
    if (response) {
        setFriendStatus("notFriend");
        if (setIsUpdateFriends) setIsUpdateFriends(prev => !prev);
        if (onClose) onClose();
    }
};

// Hàm xử lý khi xóa lời mời kết bạn
export const handleRemoveRequest = async (currentUserId, friendId, setFriendStatus, setIsUpdateFriends, onClose) => {
    const response = await deleteRequestBySenderIdAndReceiverId(currentUserId, friendId);
    if (response) {
        setFriendStatus("notFriend");
        if (setIsUpdateFriends) setIsUpdateFriends(prev => !prev);
        if (onClose) onClose();
    }
};
