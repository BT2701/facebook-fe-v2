import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [friendList, setFriendList] = useState([]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, friendList, setFriendList }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
