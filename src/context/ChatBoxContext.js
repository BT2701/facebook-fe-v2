// ChatBoxContext.js
import React, { createContext, useContext, useState } from "react";

const ChatBoxContext = createContext();

export const ChatBoxProvider = ({ children }) => {
  const [chatInfo, setChatInfo] = useState({
    isOpen: false,
    avatar: null,
    isOnline: null,
    contactId: null,
    contactName: null,
    status: null,
  });

  return (
    <ChatBoxContext.Provider value={{ chatInfo, setChatInfo }}>
      {children}
    </ChatBoxContext.Provider>
  );
};

export const useChatBox = () => {
  return useContext(ChatBoxContext);
};
