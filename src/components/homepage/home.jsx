import { Homecenter } from "./homecenter/Homecenter";
import LeftSidebar from "./sidebar/LeftSidebar";
import "./home.css";
import FriendList from "./FriendList";

export const Homepage = () => {
  return (
    <>
      <div className="Home">
        <div className="HomeBody">
          <LeftSidebar />
          <Homecenter />
          <FriendList />
        </div>
      </div>
    </>
  );
};
