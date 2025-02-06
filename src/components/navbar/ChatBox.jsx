// import { CloseIcon } from "@chakra-ui/icons";
// import {
//   Avatar,
//   AvatarBadge,
//   Box,
//   HStack,
//   IconButton,
//   Input,
//   Spinner,
//   Text,
// } from "@chakra-ui/react";

// import { AiOutlinePhone } from "react-icons/ai";
// import { IoVideocamOutline } from "react-icons/io5";

// import { FiSend, FiSmile, FiPaperclip } from "react-icons/fi";
// import ChatMessage from "./ChatMessage";
// // import { useChatBox } from "../../context/ChatBoxContext";
// import { useEffect, useRef, useState } from "react";
// import { useUser } from "../../context/UserContext";
// import { getMessagesByUserIdAndContactId } from "../../utils/getData";
// import axios from "axios";
// import { useChatConn } from "../../context/ChatConnContext";

// export default function ChatBox({ onCallAudio, onCallVideo }) {
//   // const {
//   //   chatInfo: { avatar, isOnline, contactId, contactName, status },
//   //   setChatInfo,
//   // } = useChatBox();

//   const { chatConn } = useChatConn();

//   const { currentUser } = useUser();

//   const chatConnRef = useRef(null);

//   const [cursor, setCursor] = useState("");

//   const [isLoading, setIsLoading] = useState(false);

//   // State for all messages
//   const [messages, setMessages] = useState([]);

//   // State for message input
//   const [msgInput, setMsgInput] = useState("");

//   // Get messages from server
//   const getMessages = async (cursor) => {
//     if (isLoading) {
//       const response = await getMessagesByUserIdAndContactId(
//         currentUser.id,
//         contactId,
//         cursor
//       );

//       if (response && response?.data && response?.data.messages) {
//         setCursor(response?.data.cursor);

//         const tempMsg = [];

//         for (const msg of response?.data.messages) {
//           // if sender is current user
//           if (msg.sender === currentUser.id) {
//             tempMsg.push({
//               id: msg.id,
//               message: { text: msg.content },
//               isFromYou: true,
//             });
//           } else {
//             tempMsg.push({
//               id: msg.id,
//               message: {
//                 senderName: contactName,
//                 senderAvatar: avatar,
//                 text: msg.content,
//               },
//               isFromYou: false,
//             });
//           }
//         }

//         setMessages((prev) => [...prev, ...tempMsg]);
//       } else {
//         setCursor("");
//       }
//       setIsLoading(false);
//     }
//   };

//   // Add message to db
//   const postMsg = async (msg) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_URL}/message`,
//         msg,
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       return response;
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   // Handle send message
//   const handleSendMsg = async () => {
//     if (msgInput) {
//       try {
//         // Add message to database
//         const response = await postMsg({
//           Sender: currentUser.id,
//           Receiver: contactId,
//           CreatedAt: new Date().toISOString().split(".")[0],
//           Content: msgInput,
//         });

//         if (response && response?.data && response?.data.id) {
//           // Update messages
//           setMessages((prev) => [
//             {
//               id: response?.data.id,
//               message: { text: msgInput },
//               isFromYou: true,
//             },
//             ...prev,
//           ]);

//           if (chatConnRef.current) {
//             // Send message to Signal R
//             await chatConnRef.current.invoke(
//               "SendMessage",
//               response?.data.id,
//               currentUser.id,
//               contactId,
//               msgInput
//             );
//             console.log("Message sent!");
//           } else {
//             console.log("Cannot send message!");
//           }
//         }
//       } catch (error) {
//         console.error("Error sending message:", error);
//       }
//       setMsgInput(""); // Reset message input
//     }
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === "Enter") {
//       handleSendMsg();
//     }
//   };

//   useEffect(() => {
//     // If this component have contactId then get data from server
//     if (contactId && !isLoading) {
//       // Get messages between user and contacter
//       setIsLoading(true);
//     }
//   }, [contactId]);

//   useEffect(() => {
//     if (isLoading) {
//       getMessages(cursor);
//     }
//   }, [isLoading]);

//   // useEffect for chat connection
//   useEffect(() => {
//     // Listening from server
//     if (chatConn) {
//       chatConnRef.current = chatConn;
//       const listenFromServer = (msgId, fromId, message) => {
//         if (fromId === contactId) {
//           // Set incoming message
//           setMessages((prev) => [
//             {
//               id: msgId,
//               message: {
//                 senderName: contactName,
//                 senderAvatar: avatar,
//                 text: message,
//               },
//               isFromYou: false,
//             },
//             ...prev,
//           ]);
//         }
//       };

//       chatConnRef.current.on("ReceiveMessage", listenFromServer);

//       // component unmount
//       return () => {
//         console.log("Off listener chat message");
//         chatConnRef.current.off("ReceiveMessage", listenFromServer);
//       };
//     }
//   }, [chatConn]);

//   return (
//     <Box
//       w="338px"
//       h="450px"
//       display="flex"
//       flexDirection="column"
//       position="fixed"
//       bgColor="gray.300"
//       right={2}
//       bottom={0}
//       borderTopRadius={10}
//       zIndex={1}
//     >
//       {/* Chat header */}
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         p={2}
//         bgColor="#1877F2"
//         borderTopRadius={10}
//       >
//         <Box display="flex" alignItems="center">
//           <Avatar size="sm" ml={1} src={avatar} name={contactName}>
//             {isOnline === 1 && <AvatarBadge boxSize="1.25em" bg="green.500" />}
//           </Avatar>

//           <Box ml={5}>
//             <Text as="b" fontSize="lg" display="block" mb="-5px">
//               {contactName}
//             </Text>
//             <Text fontSize="sm" opacity="85%" mb={0}>
//               {status}
//             </Text>
//           </Box>
//         </Box>

//         <HStack spacing={1}>
//           <IconButton
//             aria-label="Audio Call"
//             colorScheme=""
//             icon={<AiOutlinePhone />}
//             onClick={onCallAudio}
//           />
//           <IconButton
//             aria-label="Video Call"
//             colorScheme=""
//             icon={<IoVideocamOutline />}
//             onClick={onCallVideo}
//           />
//           <IconButton
//             aria-label="Close button"
//             colorScheme=""
//             icon={<CloseIcon />}
            
//           />
//         </HStack>
//       </Box>
//       {/* End Chat Header */}

//       {/* Chat Message */}
//       {isLoading && (
//         <Box display="flex" p={3} justifyContent="center" alignItems="center">
//           <Spinner size="sm" />
//         </Box>
//       )}

//       <Box
//         overflowY="auto"
//         flex={1}
//         p={2}
//         display="flex"
//         flexDirection="column-reverse"
//         onScroll={(e) => {
//           const { scrollHeight, scrollTop, clientHeight } = e.target;
//           if (Math.abs(scrollHeight - clientHeight - Math.abs(scrollTop)) < 1) {
//             if (cursor) {
//               setIsLoading(true);
//             }
//           }
//         }}
//       >
//         {messages.map((data) => (
//           <ChatMessage
//             key={data.id}
//             message={data.message}
//             isFromYou={data.isFromYou}
//           />
//         ))}
//       </Box>
//       {/* End Chat Message */}

//       {/* Chat Input */}
//       <Box
//         display="flex"
//         alignItems="center"
//         bg="gray.100"
//         p={2}
//         borderRadius="md"
//         boxShadow="sm"
//       >
//         {/* Attachments */}
//         <IconButton
//           icon={<FiPaperclip />}
//           variant="ghost"
//           aria-label="Attach file"
//         />

//         {/* Emoji Icon */}
//         <IconButton icon={<FiSmile />} variant="ghost" aria-label="Add emoji" />

//         {/* Input Field */}
//         <Input
//           variant="unstyled"
//           placeholder="Type a message..."
//           value={msgInput}
//           onChange={(e) => setMsgInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           size="md"
//           borderRadius="none"
//           flex={1}
//           mx={2}
//         />

//         {/* Send Button */}
//         <IconButton
//           icon={<FiSend />}
//           colorScheme="blue"
//           variant="ghost"
//           aria-label="Send message"
//           onClick={handleSendMsg}
//         />
//       </Box>
//       {/* End Chat Input */}
//     </Box>
//   );
// }
