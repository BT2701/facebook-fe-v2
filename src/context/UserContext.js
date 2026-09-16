import React, { createContext, useContext, useState } from 'react';
import { getStoredUser } from '../config/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [friendList, setFriendList] = useState([]);
  const [uploadImage, setUploadImage] = useState(0);

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, friendList, setFriendList, uploadImage, setUploadImage }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
