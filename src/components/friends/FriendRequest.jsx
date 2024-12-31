import React, { useEffect, useState } from "react";
import "./friendrequest.css";
import { Leftsidebar } from "./Leftsidebar";
import CustomCard from "./customCard";
import { Box, SimpleGrid, Text } from "@chakra-ui/react";
import { getDataRequests,getAllFriends ,getFriendSuggestions,getUserById,getAllRequests} from "../../utils/getData"; 
import { useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export const FriendRequest = () => {
    const [friendRequestswithUserInfo, setfriendRequestswithUserInfo] = useState([]);
    const [friendswithUserInfo, setfriendswithUserInfo] = useState([]);
    const [friendSuggestswithUserInfo, setfriendSuggestswithUserInfo] = useState([]);
    const [page, setPage] = useState(1); // Theo dõi trang hiện tại
    const [loading, setLoading] = useState(false); // Theo dõi trạng thái tải dữ liệu
    const [hasMoreRequests, setHasMoreRequests] = useState(true); // Trạng thái để kiểm tra có còn yêu cầu hay không
    const { currentUser } = useUser();

    // *********************************************************************
    const userId = currentUser.id; // Lấy ID người dùng
    // *********************************************************************
    const location = useLocation(); // Sử dụng hook để lấy thông tin về đường dẫn hiện tại

    // Hàm fetch yêu cầu bạn bè
    const fetchFriendRequests = async (pageNumber) => {
        setLoading(true);
        try {
            // Gọi hàm getDataRequests và truyền setFriendRequests vào
            const data = await getDataRequests(userId, pageNumber);
            console.log("data chua xu ly:", JSON.stringify(data, null, 2)); // Chuyển đổi thành chuỗi JSON và định dạng

            // Kiểm tra dữ liệu có tồn tại và không rỗng
            if (!data || data.length === 0) {
                setHasMoreRequests(false);
                console.error("No data received or data is empty.");
                return;
            }
            if (data.length < 20) {
                setHasMoreRequests(false); // Nếu số lượng yêu cầu nhỏ hơn 20, đặt thành false
            } 
    
            // Sử dụng vòng lặp for để lấy thông tin của sender cho từng yêu cầu
            const friendRequestsWithSenderInfo = [];
            for (const request of data) {
                // Lấy thông tin người gửi từ API
                const senderInfo = await getUserById(request.sender);
                const requestWithSenderInfo = {
                    ...request,
                    Info: {
                        id: senderInfo?.data.data.id, // Thay đổi ở đây để lấy ID người gửi từ request
                        name: senderInfo?.data.name, // Hoặc bạn có thể gọi API để lấy tên thực tế
                        avatar: senderInfo?.data.avatar || `${process.env.REACT_APP_DEFAULT_USER_IMG}`
                    },
                    status: "friendRequest" // Thêm thuộc tính status với giá trị là "friendRequest"
                };
                friendRequestsWithSenderInfo.push(requestWithSenderInfo);
            }
    
            console.log("data:", friendRequestsWithSenderInfo); // Chuyển đổi thành chuỗi JSON và định dạng
            // Cập nhật trạng thái với dữ liệu mới
            setfriendRequestswithUserInfo((prevRequests) => [
                ...prevRequests,
                ...friendRequestsWithSenderInfo
            ]);       
        } catch (error) {
            console.error("Error fetching friend requests:", error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm fetch gợi ý bạn bè
    const fetchFriendSuggestions = async (pageNumber) => {
        setLoading(true); // Bắt đầu tải dữ liệu

        try {
            const suggestions = await getFriendSuggestions(userId, pageNumber); 
            console.log("Dữ liệu gợi ý bạn bè:", JSON.stringify(suggestions, null, 2)); // Hiển thị dữ liệu gợi ý

            // Kiểm tra dữ liệu có tồn tại và không rỗng
            if (!suggestions || suggestions.length === 0) {
                setHasMoreRequests(false);
                console.error("Không có dữ liệu gợi ý hoặc dữ liệu rỗng.");
                return;
            }

            // Nếu số lượng bạn bè nhỏ hơn 20 (hoặc bất kỳ số nào mà bạn muốn), đặt cờ để ngừng tải thêm
            if (suggestions.length < 12) {
                setHasMoreRequests(false);
            }

            // Thêm thuộc tính Info và status cho từng gợi ý
            const friendsWithInfo = suggestions?.map(suggestion => ({
                ...suggestion,
                Info: {
                    id: suggestion.id, // Lấy Id từ gợi ý
                    name: suggestion.name , // Tên bạn bè, nếu không có thì sử dụng ID
                    avatar: suggestion.avatar || `${process.env.REACT_APP_DEFAULT_USER_IMG}`
                },
                status: "suggest" // Thêm thuộc tính status với giá trị là "suggest"
            }));

            console.log("Dữ liệu gợi ý sau khi xử lý:", friendsWithInfo); // Hiển thị dữ liệu sau khi xử lý

            // Cập nhật trạng thái với dữ liệu gợi ý bạn bè, kết hợp dữ liệu mới với dữ liệu cũ
            setfriendSuggestswithUserInfo(prevSuggests => [...prevSuggests, ...friendsWithInfo]);
        } catch (error) {
            console.error("Lỗi khi fetch gợi ý bạn bè:", error);
        } finally {
            setLoading(false); // Kết thúc quá trình tải dữ liệu
        }
    };


    // Hàm fetch tất cả bạn bè
    const fetchAllFriends = async (pageNumber) => {
        setLoading(true);
        try {
            // Gọi hàm getAllFriends và truyền setfriendRequestswithUserInfo vào
            const data = await getAllFriends(userId, pageNumber);
            console.log("Dữ liệu chưa xử lý:", JSON.stringify(data, null, 2)); // Chuyển đổi thành chuỗi JSON và định dạng

            // Kiểm tra dữ liệu có tồn tại và không rỗng
            if (!data || data.length === 0) {
                setHasMoreRequests(false);
                console.error("Không có dữ liệu hoặc dữ liệu rỗng.");
                return;
            }

            // Nếu số lượng bạn bè nhỏ hơn 10 (hoặc bất kỳ số nào mà bạn muốn), đặt cờ để ngừng tải thêm
            if (data.length < 12) {
                setHasMoreRequests(false);
            }

            // Sử dụng vòng lặp để lấy thông tin cho từng bạn bè
            const friendsWithInfo = [];
            for (const friend of data) {
                const friendWithInfo = {
                    ...friend,
                    Info: {
                        id: friend.id, // Lấy ID của người bạn
                        name: friend.name, // Tạm thời giả lập tên bạn bè
                        avatar: friend.avatar || `${process.env.REACT_APP_DEFAULT_USER_IMG}`
                    },
                    status: "friend" // Thêm thuộc tính status với giá trị là "friendRequest"
                };
                friendsWithInfo.push(friendWithInfo);
            }

            console.log("Dữ liệu sau khi xử lý:", friendsWithInfo); // Chuyển đổi thành chuỗi JSON và định dạng
            // Cập nhật trạng thái với dữ liệu bạn bè
            setfriendswithUserInfo((prevFriends) => [
                ...prevFriends,
                ...friendsWithInfo
            ]);
        } catch (error) {
            console.error("Lỗi khi fetch tất cả bạn bè:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = () => {
        const bottom = window.innerHeight + window.scrollY;
        const totalHeight = document.body.offsetHeight;
    
        // Kiểm tra xem có cuộn đến đáy trang và còn yêu cầu để tải không
        if (bottom >= totalHeight*0.8  && !loading && hasMoreRequests) {
            setPage((prevPage) => prevPage + 1); // Tăng trang lên 1 khi cuộn gần đến đáy
            setLoading(true);
        }
    };

    // Hàm gọi dữ liệu yêu cầu bạn bè
    useEffect(() => {
        // Cuộn về đầu trang khi pathname thay đổi
        window.scrollTo(0, 0);
        if (location.pathname === '/friends') {
            setfriendRequestswithUserInfo([]); // Reset lại mảng khi đường dẫn thay đổi
            fetchFriendRequests(1); // Gọi fetchFriendRequests với trang 1
            setPage(1);
            setHasMoreRequests(true);
        } else if (location.pathname === '/friends/suggestions') {
            setfriendSuggestswithUserInfo([]);
            fetchFriendSuggestions(1); // Gọi fetchFriendSuggestions khi là '/friends/suggestions'
            setPage(1);
            setHasMoreRequests(true);
        } else if (location.pathname === '/friends/all-friends') {
            setfriendswithUserInfo([]); // Reset lại mảng khi đường dẫn thay đổi
            fetchAllFriends(1); // Gọi fetchAllFriends khi là '/friends/all-friends'
            setPage(1);
            setHasMoreRequests(true);
        }
    }, [location.pathname]); // Theo dõi pathname
    
    // Gọi fetchFriendRequests khi page thay đổi
    useEffect(() => {
        if (location.pathname === '/friends' && page>1) {
            fetchFriendRequests(page);
        }
        if (location.pathname === '/friends/all-friends' && page>1) {
            fetchAllFriends(page);
        }
        if (location.pathname === '/friends/suggestions' && page>1) {
            fetchFriendSuggestions(page);
        }
    }, [page]); // Theo dõi page dùng cho phân trang

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll); // Dọn dẹp event listener khi component unmount
        };
    }, [loading, hasMoreRequests]); // Cần thêm hasMoreRequests vào dependency array để đảm bảo tính năng hoạt động chính xác

    // Hàm để hiển thị nội dung cho Friend Requests
    const renderFriendRequests = () => (
        <Box minH={'660px'} bg={'#f0f2f5'} pb={'80px'} border={'1px solid #f0f2f5'} ml={'300px'}>
            <SimpleGrid columns={4} spacing={5} m={'auto'} minH={200}>
                {friendRequestswithUserInfo.length > 0 ? (
                    friendRequestswithUserInfo.map((request) => (
                        <CustomCard 
                            key={request.id} 
                            data={request} // Truyền từng request cho CustomCard
                        />
                    ))
                ) : (
                    <Box w="100%" textAlign="center">
                        <Text>No friend requests available.</Text>
                    </Box>
                )}
            </SimpleGrid>
            {loading && (
                <Box textAlign="center" mt={4}>
                    <Text>Loading more requests...</Text>
                </Box>
            )}
        </Box>
    );

    // Hàm để hiển thị nội dung cho Suggestions
    const renderSuggestions = () => (
        <Box minH={'660px'} bg={'#f0f2f5'} pb={'80px'} border={'1px solid #f0f2f5'} ml={'300px'}>
            <SimpleGrid columns={4} spacing={5} m={'auto'} minH={200}>
                {friendSuggestswithUserInfo.length > 0 ? (
                    friendSuggestswithUserInfo.map((suggestion) => (
                        <CustomCard 
                            key={suggestion.Info.id} // Sử dụng ID của người gợi ý làm key
                            data={suggestion} // Truyền từng suggestion cho CustomCard
                        />
                    ))
                ) : (
                    <Box w="100%" textAlign="center">
                        <Text>No friend suggestions available.</Text>
                    </Box>
                )}
            </SimpleGrid>
            {loading && (
                <Box textAlign="center" mt={4}>
                    <Text>Loading friend suggestions...</Text>
                </Box>
            )}
        </Box>
    );


    // Hàm để hiển thị nội dung cho All Friends
    const renderAllFriends = () => (
        <Box minH={'660px'} bg={'#f0f2f5'} pb={'80px'} border={'1px solid #f0f2f5'} ml={'300px'}>
            <SimpleGrid columns={4} spacing={5} m={'auto'} minH={200}>
                {friendswithUserInfo.length > 0 ? (
                    friendswithUserInfo.map((friend) => (
                        <CustomCard 
                            key={friend.id} 
                            data={friend} // Truyền từng friend cho CustomCard
                        />
                    ))
                ) : (
                    <Box w="100%" textAlign="center">
                        <Text>No friends available.</Text>
                    </Box>
                )}
            </SimpleGrid>
            {loading && (
                <Box textAlign="center" mt={4}>
                    <Text>Loading more friends...</Text>
                </Box>
            )}
        </Box>
    );

    
    return (
        <div>
            <Leftsidebar />
            {location.pathname === '/friends/suggestions' && renderSuggestions()}
            {location.pathname === '/friends/all-friends' && renderAllFriends()}
            {location.pathname === '/friends' && renderFriendRequests()}
        </div>
    );
};
