import React, { useEffect, useState } from "react";
import { Story } from "./Story";
import "./storyReel.css";
import CreateStory from "./CreateStory";
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import axios from "axios";
import { fetchDataForStory, getFriendsByUserId, getUserById } from "../../../utils/getData";
import { useUser } from "../../../context/UserContext";
import ImagePreviewDialog from "./ImagePreviewDialog";

export const StoryReel = () => {
    const [stories, setStories] = useState([]);
    const [users, setUsers] = useState({});
    const { currentUser, setFriendList } = useUser();
    const [visibleStoriesCount, setVisibleStoriesCount] = useState(4);
    const [startIndex, setStartIndex] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0); // Thêm state để lưu tiến trình tải lên
    const [isUploading, setIsUploading] = useState(false); // Trạng thái để kiểm tra đang tải lên
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy danh sách bạn bè
                const friendsResponse = await getFriendsByUserId(currentUser.id);
                const friendsData = friendsResponse; // Đây là mảng các đối tượng user
                setFriendList(friendsData);
                console.log('friendsData:', friendsData);
                // Tạo danh sách userId của currentUser và bạn bè
                const allUserIds = [currentUser.id, ...friendsData.map(friend => friend.id)];
                console.log('allUserIds:', allUserIds);
                // Gọi API lấy stories của từng userId
                const storyPromises = allUserIds.map(userId => fetchDataForStory(userId));
                const storyResponses = await Promise.all(storyPromises);
                // Gộp tất cả stories
                const allStories = storyResponses
                    .filter(response => response && response?.data && response?.data.stories) 
                    .map(response => response?.data.stories)
                    .flat();
    
                // Tạo map user để tra cứu nhanh thông tin người dùng
                const usersMap = friendsData.reduce((acc, friend) => {
                    acc[friend.id] = friend;
                    return acc;
                }, {});
    
                // Thêm thông tin của currentUser vào map
                const currentUserResponse = await getUserById(currentUser.id);
                usersMap[currentUser.id] = currentUserResponse?.data;
    
                // Cập nhật state
                setStories(allStories);
                setUsers(usersMap);
                setFriends(friendsData);
                console.log('usersMap:', usersMap);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchData();
    }, [currentUser]);
    


    const handleSeeMore = () => {
        setStartIndex((prevIndex) => prevIndex + 1);
        setVisibleStoriesCount((prevCount) => prevCount + 1);
    };

    const handleSeeLess = () => {
        setStartIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        setVisibleStoriesCount((prevCount) => Math.max(prevCount - 1, 4));
    };

    const handleCreateStory = async (user, image) => {
        setIsUploading(true); // Bắt đầu tải lên
        setUploadProgress(0); // Đặt lại tiến trình

        const formData = new FormData();
        formData.append('user_id', user);
        formData.append('imageFile', image);

        try {
            // Giả lập tải lên
            const uploadInterval = setInterval(() => {
                setUploadProgress((prevProgress) => {
                    if (prevProgress < 100) {
                        return prevProgress + 1;
                    }
                    clearInterval(uploadInterval);
                    return 100;
                });
            }, 50);  // Cập nhật mỗi 50ms


            const response = await axios.post(`${process.env.REACT_APP_API_URL}/media/image`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const responseStory = await axios.post(`${process.env.REACT_APP_API_URL}/post/stories`, {
                user_id: user,
                image: `${process.env.REACT_APP_API_URL}/media/uploads/${image.name}`,
            });
            setStories((prevStories) => [...prevStories, responseStory?.data.data.story]); // Cập nhật danh sách stories
            setPreviewImage(null);
            setSelectedFile(null);
            setUploadProgress(100); // Đặt tiến trình là 100 khi hoàn thành
        } catch (error) {
            console.error('Error creating story:', error);
        }
        finally {
            setIsUploading(false); // Kết thúc tải lên
        }
    };


    const handleSelectImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setPreviewImage(URL.createObjectURL(file));
                setSelectedFile(file);
            }
        };
        input.click();
    };

    const handleConfirm = () => {
        if (selectedFile) {
            handleCreateStory(currentUser.id, selectedFile);
        }

    };

    const handleCancel = () => {
        setPreviewImage(null);
        setSelectedFile(null);
    };

    return (
        <div className="storyReel">
            <button onClick={handleSelectImage}><CreateStory /></button>
            {Array.isArray(stories) && stories.slice(startIndex, visibleStoriesCount).map((story, index) => {
                const user = users[story.user_id];
                return (
                    <Story
                        key={index}
                        image={story?.image}
                        profileSrc={user?.avatar}
                        userName={user?.name}
                    />
                );
            })}
            {startIndex > 0 && (
                <div className="story-seeLess" onClick={handleSeeLess}>
                    <FaArrowLeft size={30} />
                </div>
            )}
            {visibleStoriesCount < stories?.length && (
                <div className="story-seeMore" onClick={handleSeeMore}>
                    <FaArrowRight size={30} />
                </div>
            )}
            {/* Sử dụng ImagePreviewDialog */}
            <ImagePreviewDialog
                previewImage={previewImage}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
            />
        </div>
    );
};