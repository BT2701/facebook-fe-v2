import { Box, Flex, Spacer } from "@chakra-ui/react";
import { Search } from "./Search";
import { Option } from "./Option";
import { CenterLinks } from "./CenterLinks";
import { Outlet } from "react-router-dom";
import { useChatConn } from "../../context/ChatConnContext";
import { useEffect } from "react";
import { useUser } from "../../context/UserContext";
import ChatManage from "./ChatManage";

export const Navbar = () => {
  const { connectChat } = useChatConn();
  const { currentUser } = useUser();

  const initializeConnection = async () => {
    // Connect to chathub
    await connectChat(currentUser);
  };

  useEffect(() => {
    initializeConnection();
  }, []);

  return (
    <>
      {/* Chat Manage */}
      <ChatManage />

      <Flex
        h={"57px"}
        boxShadow={"lg"}
        pos="fixed"
        w={"100%"}
        bg={"white"}
        zIndex={2}
      >
        <Search />

        <Spacer />

        <CenterLinks />

        <Spacer />

        <Option />
      </Flex>

      <Box pt={"57px"}>
        <Outlet />
      </Box>
    </>
  );
};
