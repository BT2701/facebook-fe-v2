import { useEffect, useRef, useState } from "react";
import ChatBox from "./ChatBox";
import Peer from "simple-peer";
import { getUserById } from "../../utils/getData";
import { useUser } from "../../context/UserContext";
import { useChatConn } from "../../context/ChatConnContext";
import { useChatBox } from "../../context/ChatBoxContext";
import CallScreen from "../callScreen/CallScreen";
import IncomingCallScreen from "../callScreen/IncomingCallScreen";
import WaitingCallScreen from "../callScreen/WaitingCallScreen";

export default function ChatManage() {
  const {
    chatInfo: { isOpen, contactId, contactName, avatar },
  } = useChatBox();

  const { chatConn } = useChatConn();
  const { currentUser } = useUser();

  // Ref
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const connectionRef = useRef(null);
  const chatConnRef = useRef(null);

  // State for the caller call to this
  const [caller, setCaller] = useState(null);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callerName, setCallerName] = useState(null);
  const [callerAvatar, setCallerAvatar] = useState(null);

  const [stream, setStream] = useState(null);

  // State for waiting call
  const [isWaiting, setIsWaiting] = useState(false);

  // State for call screen
  const [isCalling, setIsCalling] = useState(false);

  // State for incoming call
  const [isIncomingCall, setIsIncomingCall] = useState(false);

  // State for accepting incoming call
  const [callAccepted, setCallAccepted] = useState(false);

  // Track if it's a video call
  const [isVideoCall, setIsVideoCall] = useState(false);

  const leaveCall = () => {
    setIsWaiting(false);
    setIsIncomingCall(false);
    setCallAccepted(false);
    setIsCalling(false);
    setStream(null);

    // Off listener CallAccepted
    if (chatConnRef.current) {
      chatConnRef.current.off("CallAccepted");
    }
    try {
      if (connectionRef.current) {
        connectionRef.current.destroy();
        connectionRef.current = null;
      }
    } catch (error) {
      console.error("Error during peer connection destruction:", error);
    }
  };

  useEffect(() => {
    if (chatConn) {
      chatConnRef.current = chatConn;
      // Listening to receive a call
      chatConnRef.current.on("ReceiveCall", (data) => {
        setIsIncomingCall(true);
        // Set info of the person who calls to this
        setCallerSignal(data.signalData);
        setCaller(data.fromUserId);
        setCallerName(data.userName);
        setCallerAvatar(data.userAvt);
        setIsVideoCall(data.isVideoCall);
      });

      // Listening to receive end call
      chatConnRef.current.on("ReceiveEndCall", leaveCall);

      return () => {
        console.log("Off listener receive call");
        chatConnRef.current.off("ReceiveCall");
        chatConnRef.current.off("ReceiveEndCall", leaveCall);
      };
    }
  }, [chatConn]);

  useEffect(() => {
    // If user is waiting for a call then getMedia to ready call
    if (isWaiting || callAccepted) {
      navigator.mediaDevices
        .getUserMedia({ video: isVideoCall, audio: true })
        .then((stream) => {
          setStream(stream);
        })
        .catch((error) => {
          console.error("Error accessing media devices.", error);
        });
    }
  }, [isWaiting, callAccepted, isVideoCall]);

  useEffect(() => {
    if (stream && (isCalling || callAccepted)) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }
  }, [stream, isCalling, callAccepted, localVideoRef]);

  useEffect(() => {
    if (stream && isWaiting) {
      const callUser = async (callToUserId) => {
        // Get user data by user id
        const userData = await getUserById(currentUser.id);

        let userName = "",
          userAvatar = "";
        //   Get current user name and avatar
        if (userData && userData?.data) {
          userName = userData?.data.name;
          userAvatar = userData?.data.avatar;
        }

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: stream,
        });
        peer.on("signal", async (data) => {
          try {
            if (chatConnRef.current) {
              await chatConnRef.current.invoke(
                "CallUser",
                currentUser.id,
                userName,
                userAvatar,
                callToUserId,
                JSON.stringify(data),
                isVideoCall
              );
            } else {
              console.log("Cannot connect to call service");
            }
          } catch (error) {
            console.error("Error when call user " + error);
          }
        });
        peer.on("stream", (stream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        });
        if (chatConnRef.current) {
          chatConnRef.current.on("CallAccepted", (signal) => {
            peer.signal(JSON.parse(signal));
            setIsWaiting(false);
            setIsCalling(true);
          });
        } else {
          console.log("Cannot connect to call service");
        }

        connectionRef.current = peer;
      };

      callUser(contactId);
    }
  }, [stream, isWaiting]);

  useEffect(() => {
    if (stream && callAccepted) {
      const answerCall = () => {
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream,
        });
        peer.on("signal", async (data) => {
          try {
            if (chatConnRef.current) {
              await chatConnRef.current.invoke(
                "AnswerCall",
                caller,
                JSON.stringify(data)
              );
            } else {
              console.log("Cannot connect to call service");
            }
          } catch (error) {
            console.error("Error when answering call " + error);
          }
        });
        peer.on("stream", (stream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
      };

      answerCall();
    }
  }, [stream, callAccepted]);

  //   If chat box is open and not calling then show chat box
  if (isOpen && !isCalling && !isIncomingCall && !isWaiting) {
    return (
      <ChatBox
        onCallAudio={() => {
          setIsVideoCall(false);
          setIsWaiting(true);
        }}
        onCallVideo={() => {
          setIsVideoCall(true);
          setIsWaiting(true);
        }}
      />
    );
  }

  // If the user is wating for call
  else if (isWaiting) {
    return (
      <WaitingCallScreen
        userAvatar={avatar}
        userName={contactName}
        onCancelCall={async () => {
          // Send end call signal
          await chatConnRef.current.invoke("EndCall", contactId);
          leaveCall();
        }}
      />
    );
  }

  //   If user make a call
  else if (isCalling) {
    return (
      <CallScreen
        isVideoCall={isVideoCall}
        userAvatar={avatar}
        userName={contactName}
        stream={stream}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        onCancelCall={async () => {
          // Send end call signal
          await chatConnRef.current.invoke("EndCall", contactId);
          leaveCall();
        }}
      />
    );
  }

  //   If user receive a call
  else if (isIncomingCall) {
    // If they accept the receiving call
    if (callAccepted) {
      return (
        <CallScreen
          isVideoCall={isVideoCall}
          userAvatar={callerAvatar}
          userName={callerName}
          stream={stream}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          onCancelCall={async () => {
            // Send end call signal
            await chatConnRef.current.invoke("EndCall", caller);
            leaveCall();
          }}
        />
      );
    }

    return (
      <IncomingCallScreen
        userAvatar={callerAvatar}
        userName={callerName}
        onAccept={() => {
          setCallAccepted(true);
        }}
        onDecline={async () => {
          // Send end call signal
          await chatConnRef.current.invoke("EndCall", caller);
          leaveCall();
        }}
      />
    );
  }
}
