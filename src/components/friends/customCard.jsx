import React, { useState, useEffect } from 'react';
import { Box, Image, Text, Center, Button } from '@chakra-ui/react';
import confirmDialog from '../sharedComponents/confirmDialog'; // Import hàm confirmDialo
import { deleteRequestById, addRequest, removeFriend, addFriendAndDeleteRequest } from '../../utils/getData';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';


const CustomCard = ({ data }) => {
    const [isRequested, setIsRequested] = useState(false); // Trạng thái để kiểm tra xem đã gửi yêu cầu hay chưa
    const [hasData, setHasData] = useState(false); // Trạng thái kiểm tra dữ liệu// Kiểm tra dữ liệu có tồn tại hay không
    const [status, setStatus] = useState(''); // Trạng thái lưu status
    const [statusBtn, setStatusBtn] = useState(''); // Trạng thái lưu button ẩn
    const [idFriend, setIdFriend] = useState('');
    const [idRequest, setIdRequest] = useState('');
    const [idSendRequest, setIdSendRequest] = useState(0);// lưu trạng thái khi đã gửi kết bạn thì sẽ hiện nút hủy lời mời
    const [isDisplay, setIsDisplay] = useState(true);// lưu trạng thái khi đã gửi kết bạn thì sẽ hiện nút hủy lời mời
    const { currentUser } = useUser();
    const { createNotification, deleteNotification } = useNotification();
    const nav = useNavigate();
    const userId = currentUser; // Lấy ID người dùng
    // Cập nhật hasData khi dữ liệu thay đổi
    useEffect(() => {
        console.log("Data in CustomCard:", data); // In ra dữ liệu nhận được
        setHasData(!!data); // Kiểm tra xem dữ liệu có tồn tại không
        setStatus(data?.status); // Lấy status từ data (nếu có)
        setIdFriend(data.Info.id);
        setIdRequest(data.id);
    }, [data]);

    const handleConfirm = async () => {
        try {
            // Gọi hàm xử lý xác nhận ở đây (ví dụ, API call)
            const response = await addFriendAndDeleteRequest(userId, idFriend, idRequest); // Giả sử có một hàm xác nhận yêu cầu
            if (response === 204) { // Nếu thành công
                setIsRequested(true); // Cập nhật trạng thái
                setStatusBtn('Request accepted');
                createNotification(idFriend, 0, 'accepted your friend request', 4);
                deleteNotification(data.Info.id, userId, 0, 3);
            } else if (response === 404) { // Không tìm thấy yêu cầu kết bạn
                alert("Yêu cầu kết bạn không tồn tại.");
                setIsRequested(true); // Cập nhật trạng thái
                setStatusBtn('Request accepted');
            } else if (response === 500) { // Lỗi server
                alert("Có lỗi từ server. Vui lòng thử lại sau.");
            } else { // Trường hợp khác (nếu cần)
                alert("Đã xảy ra lỗi không xác định.");
            }
        } catch (error) {
            console.error("Error confirming request:", error);
        }
    };
    const handleAddFriend = async () => {
        try {
            // Gọi hàm xử lý xác nhận ở đây (ví dụ, API call)
            const response = await addRequest(userId, data.Info.id); // Giả sử có một hàm xác nhận yêu cầu
            if (response.status == 200) { // Nếu thành công
                setIdSendRequest(response?.data.id)
                createNotification(data.Info.id, 0, 'sent you a friend request', 3);
            }else if(response.status == 409){
                alert("người này đã gửi yêu cầu kết bạn đến bạn vui lòng tải lại trang để chấp nhận");
            }else{
                alert("có lỗi ở máy chủ");
            }
        } catch (error) {
            console.error("Error confirming request:", error);
        }
    };

    const handleDelete = async () => {
        const isConfirmed = await confirmDialog(
            'Xác nhận xóa', // Tiêu đề
            'Bạn có chắc chắn muốn xóa không?', // Nội dung
            'warning' // Icon (có thể sử dụng 'warning', 'info', 'success', 'error', 'question')
        );

        if (isConfirmed) {
            try {
                // Kiểm tra giá trị của status để gọi hàm xử lý phù hợp
                let response;
                if (status === 'friendRequest') {
                    // Gọi hàm xóa yêu cầu kết bạn
                    response = await deleteRequestById(data.id);
                    // Kiểm tra mã trạng thái trả về từ API
                    if (response === 204) { // Nếu xóa thành công (status 204)
                        setIsRequested(true);
                        setStatusBtn('Request deleted');
                        deleteNotification(data.Info.id, userId, 0, 3);
                    } else if (response === 404) { // Nếu không tìm thấy yêu cầu (status 404)
                        alert("Yêu cầu kết bạn không tồn tại.");
                        setIsRequested(true);
                        setStatusBtn('Request deleted');
                    } else if (response === 500) { // Nếu có lỗi server (status 500)
                        alert("Có lỗi xảy ra khi xóa yêu cầu kết bạn.");
                    } else {
                        // Xử lý các trường hợp khác nếu có
                        console.log("Trạng thái không xác định:", response);
                    }
                } else if (status === 'friend') {
                    // Gọi hàm removeFriend để xóa bạn bè qua API
                    response = await removeFriend(userId, idFriend);
                    if (response === 200) {
                        setIsRequested(true);
                        setStatusBtn('Friend deleted');
                        console.log("Xóa bạn bè thành công.");
                    } else if (response === 404) {
                        console.log("Không tìm thấy quan hệ bạn bè.");
                        setIsRequested(true);
                        setStatusBtn('Friend deleted');
                    } else if (response === 500) {
                        console.log("Có lỗi xảy ra trên server khi xóa bạn bè.");
                    } else {
                        console.log("Trạng thái không xác định hoặc có lỗi khác:", response);
                    }


                }
            } catch (error) {
                console.error("Error deleting request:", error);
            }
        }
    };
    const handleDeleteRequest = async () => {
        try {
            const response = await deleteRequestById(idSendRequest); // Đảm bảo là hàm này trả về promise
            if (response === true) {
                setIdSendRequest(0); // Cập nhật idSendRequest sau khi xóa thành công
            } else {
                console.log("Không thể xóa yêu cầu.");
            }

            if (response === 204) { // Nếu xóa thành công (status 204)
                setIdSendRequest(0); // Cập nhật idSendRequest sau khi xóa thành công
                deleteNotification(userId, data.Info.id, 0, 3);
            } else if (response === 404) { // Nếu không tìm thấy yêu cầu (status 404)
                alert("yêu cầu kết bạn đã được xử lý");
                handleRemove();
            } else if (response === 500) { // Nếu có lỗi server (status 500)
                alert("Có lỗi xảy ra khi xóa yêu cầu kết bạn.");
            } else {
                // Xử lý các trường hợp khác nếu có
                console.log("Trạng thái không xác định:", response);
            }
        } catch (error) {
            console.error("Có lỗi xảy ra khi xóa yêu cầu:", error);
        }
    };
    const handleRemove = async () => {
        setIsDisplay(false);
    }
    return (
        isDisplay ? (
            <Box rounded={8} bg={'white'} h={'360px'} overflow={'hidden'} boxShadow={'lg'} display="flex" flexDirection="column">
                {hasData ? (
                    <>
                        <Box h="220px" w="100%" overflow="hidden" borderRadius="10px">
                            <Image
                                h="100%"
                                w="100%"
                                objectFit="cover"
                                src={data.Info.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe52w64lGbNV6RGGmd85bXiciZjcWu6XR5rg&s'}
                                alt={data.Info.name}
                            />
                        </Box>
                        <Box h={'20px'} p={4} mb={5}>
                            {/* <Text fontWeight={500} fontSize={20}>{data.Info.name}</Text> */}
                            <Text
                                fontWeight={500}
                                fontSize={20}
                                cursor="pointer"
                                onClick={() => nav(`/profile?id=${data.Info.id}`)}
                            >
                                {data.Info.name}
                            </Text>
                        </Box>

                        <Box flexGrow={1} /> {/* Khoảng trống để đẩy nút xuống dưới */}

                        {/* Nút Confirm, Delete, hoặc Add Friend */}
                        {!isRequested ? (
                            <>
                                {status === 'friendRequest' && (
                                    <>
                                        <Center h={'50px'} w={'100%'} p={4} mr={'5px'}>
                                            <Button
                                                w={'100%'}
                                                bgColor={"#2e81f4"}
                                                color={"white"}
                                                _hover={{ bg: "#1c63b8" }}
                                                onClick={handleConfirm}
                                            >
                                                Confirm
                                            </Button>
                                        </Center>
                                        <Center h={'50px'} w={'100%'} p={4} mr={'5px'}>
                                            <Button
                                                w={'100%'}
                                                _hover={{ bg: "#d3d3d3" }}
                                                onClick={handleDelete}
                                            >
                                                Delete
                                            </Button>
                                        </Center>
                                    </>
                                )}

                                {status === 'friend' && (
                                    <>
                                        <Center h={'50px'} w={'100%'} p={4} mr={'5px'}>
                                            <Button
                                                w={'100%'}
                                                bgColor={"#2e81f4"}
                                                color={"white"}
                                                _hover={{ bg: "#1c63b8" }}
                                            >
                                                View Profile
                                            </Button>
                                        </Center>
                                        <Center h={'50px'} w={'100%'} p={4} mr={'5px'}>
                                            <Button
                                                w={'100%'}
                                                _hover={{ bg: "#d3d3d3" }}
                                                onClick={handleDelete}
                                            >
                                                Delete Friend
                                            </Button>
                                        </Center>
                                    </>
                                )}

                                {status === 'suggest' && (
                                    <>
                                        {/* Kiểm tra nếu có idSendRequest thì không hiển thị nút Add Friend */}
                                        {idSendRequest == 0 ? (
                                            <>
                                                <Center h={'50px'} w={'100%'} p={4} mr={'5px'}>
                                                    <Button
                                                        w={'100%'}
                                                        bgColor={"#2e81f4"} // Màu xanh dương cho nút Add Friend
                                                        color={"white"}
                                                        _hover={{ bg: "#1c63b8" }} // Màu xanh đậm hơn khi hover
                                                        onClick={handleAddFriend}
                                                    >
                                                        Add Friend
                                                    </Button>
                                                </Center>
                                                <Center h={'50px'} w={'100%'} p={4} mr={'5px'}>
                                                    <Button
                                                        w={'100%'}
                                                        _hover={{ bg: "#d3d3d3" }}
                                                        onClick={handleRemove}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Center>
                                            </>
                                        ) : (
                                            /* Hiển thị nút Delete Request nếu có idSendRequest */
                                            <Center h={'50px'} w={'100%'} p={4} mr={'5px'}>
                                                <Button
                                                    w={'100%'}
                                                    _hover={{ bg: "#d3d3d3" }}
                                                    onClick={handleDeleteRequest}
                                                >
                                                    Cancel
                                                </Button>
                                            </Center>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <Center h={'50px'} w={'100%'} p={4} mr={'5px'} pb="29%">
                                <Button
                                    w={'100%'}
                                    isDisabled={true}
                                    bg="#808080"
                                    color="black"
                                    _hover={{ bg: undefined }} // Ngăn hiệu ứng hover
                                >
                                    {statusBtn}
                                </Button>
                            </Center>
                        )}
                    </>
                ) : (
                    <Center h={'360px'} w={'100%'} p={4}>
                        <Text fontSize={20} color={"gray.500"}>No friend request data available.</Text>
                    </Center>
                )}
            </Box>
        ) : null
    );
};


export default CustomCard;
