import "./messagesender.css";
import { Avatar, Button, useDisclosure } from "@chakra-ui/react";
import { IoMdVideocam } from "react-icons/io";
import { MdPhotoLibrary, MdOutlineMood } from "react-icons/md";
import { CreatePost } from "./CreatePost";
import { getUserById } from "../../../utils/getData";
import { useEffect, useState } from "react";

export const MessageSender = ({ setPosts, currentUserId, setLastPostId, updatePostInfor }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState({});
  useEffect(() => { 
    const fetchUser = async () => {
      const user = await getUserById(currentUserId);
      setUser(user?.data);
    };
    fetchUser();
  }, [currentUserId]);

  return (
    <div className="messageSender">
      <div className="messageSender__top">
        <Avatar mr={4} src={user?.avt || `${process.env.REACT_APP_DEFAULT_USER_IMG}`} />
        <Button
          w={"80%"}
          rounded={"full"}
          mt={1}
          py={"20px"}
          onClick={onOpen} // Open the modal when clicked
        >
          What's on your mind?
        </Button>
      </div>

      <div className="messageSender__bottom">
        <div className="messageSender__option">
          <IoMdVideocam style={{ color: "red", fontSize: "22px" }} />
          <h4>Live Video</h4>
        </div>
        <div className="messageSender__option">
          <MdPhotoLibrary style={{ color: "green", fontSize: "22px" }} />
          <h4>Photo/Video</h4>
        </div>
        <div className="messageSender__option">
          <MdOutlineMood style={{ color: "yellow", fontSize: "22px" }} />
          <h4>Feeling/Activity</h4>
        </div>
      </div>

      {/* Render CreatePost as a modal */}
      {isOpen && <CreatePost setPosts={setPosts} isOpen={isOpen} onClose={onClose} currentUserId={currentUserId} setLastPostId={setLastPostId} updatePostInfor={updatePostInfor} />}
    </div>
  );
};
