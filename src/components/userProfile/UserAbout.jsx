import { Box, Flex, Grid, Heading, Icon, Text } from "@chakra-ui/react";
import { loadData } from "../../utils/localstore";
import { AiFillHeart } from "react-icons/ai";
import { MdMapsHomeWork, MdPlace, MdSkateboarding, MdAccountBalance, MdSchool, MdPermContactCalendar, MdQrCodeScanner, MdImportContacts, MdDvr, MdVolumeUp } from "react-icons/md";
import { useEffect, useState } from "react";
import { getData } from "../../utils/getData";

const IntroText = ({ icon, title }) => {
    return (
        <Flex my={3}>
            <Icon as={icon} w={6} h={6} color={'grey'} mr={4} />
            <Text fontSize={18}>{title}</Text>
        </Flex>
    );
};

export const UserAbout = () => {

    return (
        <>
            <Box bg={'#f0f2f5'} minH={'300px'} pt={5} pb={'100px'}>

                <Box w={'950px'} m={'auto'} >

                    <Grid templateColumns='32% 66%' gap={5}>

                        <Box minH={20} bg={'white'} rounded={6} p={5} boxShadow={'lg'}>
                            <Heading fontSize={23}>About</Heading>
                             <Text my={3} fontSize={18}>University / College</Text> 
                           <Text my={3} fontSize={18}>School</Text> 
                             <Text my={3} fontSize={18}>Current City / Town</Text> 
                            <Text my={3} fontSize={18}>Home Town</Text> 
                             <Text my={3} fontSize={18}>Relationship Status</Text> 
                            <Text my={3} fontSize={18}>Hobbies</Text> 
                            <Text my={3} fontSize={18}>Interests</Text> 
                            <Text my={3} fontSize={18}>Languages Known</Text> 
                            <Text my={3} fontSize={18}>Date of Birth</Text> 
                             <Text my={3} fontSize={18}>Website</Text> 
                             <Text my={3} fontSize={18}>Socialmedia Links</Text> 
                        </Box>

                        <Box bg={'white'} rounded={6} p={5} boxShadow={'lg'} pt={'50px'}>
                           <IntroText title={`Studied at ${"university"}`} icon={MdSchool} /> 
                             <IntroText title={`Went to ${"school"}`} icon={MdAccountBalance} /> 
                            <IntroText title={`Lives in ${"currentCity"}`} icon={MdMapsHomeWork} /> 
                             <IntroText title={`From ${"homeTown"}`} icon={MdPlace} /> 
                             <IntroText title={"relationship"} icon={AiFillHeart} /> 
                             <IntroText title={"hobbies"} icon={MdSkateboarding} /> 
                            <IntroText title={"interest"} icon={MdImportContacts} /> 
                            <IntroText title={"language"} icon={MdVolumeUp} /> 
                            <IntroText title={"date"} icon={MdPermContactCalendar} />
                             <IntroText title={"website"} icon={MdDvr} /> 
                            <IntroText title={"socialLink"} icon={MdQrCodeScanner} /> 
                        </Box>

                    </Grid>
                </Box>

            </Box>
        </>
    );
};