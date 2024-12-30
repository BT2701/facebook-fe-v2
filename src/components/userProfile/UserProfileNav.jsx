
import { AlertDialogFooter, Box, Button, Divider, Flex, Heading, HStack, Image, Spacer, useToast } from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { getData } from "../../utils/getData";
import { Heroku } from "../../utils/herokuLink";
import { loadData } from "../../utils/localstore";

const NewButton = ({ title, path }) => {
  return (
    <Button color={"#3a3a3a"} p={6} mr={2} bg={"white"}>
      <Link to={path}>{title}</Link>
    </Button>
  );
};

export const UserProfileNav = () => {
  
  return (
    <>
      <Box h={"570px"} bg={"white"}>
        <Box w={"950px"} h={"570px"} m={"auto"}>
          <Box overflow={"hidden"} h={"300px"} rounded={10} border={'2px solid #ececec'}>
            <Image
              w={"950px"}
              src={`uploadImgs/${"mycpic"}`}
            />
          </Box>

          <Box h={"190px"} mt={3}>
            <Flex>
              <Box w={'180px'} h={'180px'} rounded={'full'} overflow={"hidden"} border={'2px solid #ececec'}>
                <Image src={`uploadImgs/${"pic"}`} />
              </Box>
              <Box p={5} mt={10}>
                <Heading p={5} mt={7}>
                  {"firstName"} {"lastName"}
                </Heading>
              </Box>
              <Spacer />
              <Box>
                <Button
                  colorScheme={"blue"}
                  m={"120px 50px"}
                  
                >
                  Send Request
                </Button>
              </Box>
            </Flex>
          </Box>
          <Divider />

          <Box h={"50px"} mt={3}>
            <HStack>
              <NewButton title={"Post"} path={"/userprofile"} />
              <NewButton title={"About"} path={"/userprofile/about"} />
              {/* <NewButton title={"Photos"} path={"/userprofile/photos"} /> */}
            </HStack>
          </Box>
        </Box>
      </Box>

      <Outlet />
    </>
  );
};
