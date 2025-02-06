import { Routes, Route } from "react-router-dom";
import { Homepage } from "../components/homepage/home";
import { Login } from "../components/auth/login";
import PrivateRoute from "../components/auth/PrivateRouter";
import { Navbar } from "../components/navbar/Navbar";
import { Post } from "../components/profile/Post";
import { Friends } from "../components/profile/Friends";
import { Photos } from "../components/profile/Photos";
import { FriendRequest } from "../components/friends/FriendRequest";
import { UserPost } from "../components/userProfile/UserPost";
import { UserAbout } from "../components/userProfile/UserAbout";
import { UserPhotos } from "../components/userProfile/UserPhotos";
import { ProfileNav } from "../components/profile/ProfileNav";
import { UserProfileNav } from "../components/userProfile/UserProfileNav";
import { Groups } from "../components/groups/Groups";
import SearchPage from "../components/filter/SearchPage";
// import { ChatConnProvider } from "../context/ChatConnContext";
// import { ChatBoxProvider } from "../context/ChatBoxContext";
import ConfirmEmail from "../components/auth/confirmEmail";
import Forgot from "../components/auth/Forgot";
import ResetPassword from "../components/auth/ResetPassword";
import BaseGame from "../components/slotGame/baseGame";

export const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm-email/:email" element={<ConfirmEmail />} />
      <Route element={<PrivateRoute />}>
        <Route
          path="/"
          element={
            // <ChatConnProvider>
              // <ChatBoxProvider>
                <Navbar />
              // </ChatBoxProvider>
            // </ChatConnProvider>
          }
        >
          <Route path="/" element={<Homepage />} />
          <Route path="groups" element={<Groups />} />
          <Route path="friends" element={<FriendRequest />} />
          <Route path="game" element={<BaseGame/>} />
          <Route path="friends/suggestions" element={<FriendRequest />} />
          <Route path="friends/all-friends" element={<FriendRequest />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="profile" element={<ProfileNav />}>
            <Route path="" element={<Post />} />
            <Route path="friends" element={<Friends />} />
            <Route path="photos" element={<Photos />} />
          </Route>
          <Route path="userprofile" element={<UserProfileNav />}>
            <Route path="" element={<UserPost />} />
            <Route path="about" element={<UserAbout />} />
            <Route path="photos" element={<UserPhotos />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<h1>Page not found</h1>} />
    </Routes>
  );
};
