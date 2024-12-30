import { Box, Flex, Grid, Heading, Icon, Text } from "@chakra-ui/react";
import { AiFillHeart } from "react-icons/ai";
import { MdMapsHomeWork, MdPlace, MdSkateboarding, MdAccountBalance, MdSchool } from "react-icons/md";
import { useEffect, useState } from "react";
import { loadData } from "../../utils/localstore";
import { getData } from "../../utils/getData";
import { Homecenter } from "../homepage/homecenter/Homecenter";
import { Feed } from "../homepage/homecenter/Feed";
import { Heroku } from "../../utils/herokuLink";

const IntroText = ({ icon, title }) => {
    return (
        <Flex my={3}>
            <Icon as={icon} w={6} h={6} color={'grey'} mr={4} />
            <Text fontSize={18}>{title}</Text>
        </Flex>
    );
};

export const UserPost = () => {

    return (
        <>
            <Box bg={'#f0f2f5'} minH={'300px'} pt={5} pb={'100px'}>

                <Box w={'950px'} m={'auto'} >

                    <Grid templateColumns='38% 60%' gap={5}>
                        <Box bg={'white'} minH={20} maxH={'420px'} rounded={6} p={5} boxShadow={'lg'}>
                            <Heading fontSize={23}>Intro</Heading>
                            <Text fontSize={18} my={4}>{"bio"}</Text>
                             <IntroText title={`Studied at ${"university"}`} icon={MdSchool} /> 
                             <IntroText title={`Went to ${"school"}`} icon={MdAccountBalance} /> 
                             <IntroText title={`Lives in ${"currentCity"}`} icon={MdMapsHomeWork} /> 
                             <IntroText title={`From ${"homeTown"}`} icon={MdPlace} /> 
                            <IntroText title={"relationship"} icon={AiFillHeart} /> 
                             <IntroText title={"hobbies"} icon={MdSkateboarding} />

                        </Box>
                        
                    </Grid>
                </Box>

            </Box>
        </>
    );
};