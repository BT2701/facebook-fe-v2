import React, { createContext, useContext, useState } from "react";
import startConnection from "../services/chatService";

const ChatConnContext = createContext();

export const ChatConnProvider = ({ children }) => {
  const [chatConn, setChatConn] = useState(null);

  const connectChat = async (userId) => {
    if (!chatConn) {
      const conn = await startConnection(userId);
      setChatConn(conn);
    }
  };

  return (
    <ChatConnContext.Provider value={{ chatConn, connectChat }}>
      {children}
    </ChatConnContext.Provider>
  );
};

export const useChatConn = () => {
  return useContext(ChatConnContext);
};
