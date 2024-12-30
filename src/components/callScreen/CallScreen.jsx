import React, { useEffect, useState } from "react";
import { Box, VStack, Text, Avatar, IconButton } from "@chakra-ui/react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaVideo,
  FaVideoSlash,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";

export default function CallScreen({
  isVideoCall,
  userAvatar,
  userName,
  stream,
  localVideoRef,
  remoteVideoRef,
  onCancelCall,
}) {
  const [isMicroMuted, setIsMicroMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleMicroMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled; // Disable/enable audio track
      });

      setIsMicroMuted((prev) => !prev);
    }
  };

  const toggleSpeakerMute = () => {
    setIsSpeakerMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled; // Disable/enable video track
      });

      setIsVideoOff((prev) => !prev);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop()); // Stop all tracks of the current stream
      }
    };
  }, []);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      h="100vh"
      w="100vw"
      bg="gray.100"
      pos="fixed"
      left={0}
      top={0}
      zIndex="overlay"
    >
      <VStack spacing={4}>
        {isVideoCall ? (
          <Box
            position="relative"
            width="100%"
            w="100vw"
            h="80vh"
            bg="gray.900"
            borderRadius="md"
            overflow="hidden"
          >
            <video
              ref={remoteVideoRef}
              autoPlay
              muted={isSpeakerMuted}
              playsInline
              style={{
                background: "white",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {stream && (
              <video
                ref={localVideoRef}
                autoPlay
                muted={isSpeakerMuted}
                playsInline
                style={{
                  background: "black",
                  width: "150px",
                  height: "100px",
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  borderRadius: "md",
                  objectFit: "cover",
                }}
              />
            )}
          </Box>
        ) : (
          <VStack align="center" spacing={3}>
            <Avatar size="2xl" name={userName} src={userAvatar} />
            <Text fontSize="xl">Calling {isVideoCall ? "Video" : "Audio"}</Text>
            {stream && (
              <audio
                ref={localVideoRef}
                autoPlay
                playsInline
                muted={isSpeakerMuted}
              />
            )}
            <audio
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={isSpeakerMuted}
            />
          </VStack>
        )}

        <Box display="flex" gap={4}>
          <IconButton
            icon={isMicroMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            onClick={toggleMicroMute}
            colorScheme={isMicroMuted ? "red" : "blue"}
            aria-label="Toggle Mute"
          />
          {isVideoCall && (
            <IconButton
              icon={isVideoOff ? <FaVideoSlash /> : <FaVideo />}
              onClick={toggleVideo}
              colorScheme={isVideoOff ? "red" : "blue"}
              aria-label="Toggle Video"
            />
          )}
          <IconButton
            icon={isSpeakerMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            onClick={toggleSpeakerMute}
            colorScheme={isSpeakerMuted ? "red" : "blue"}
            aria-label="Toggle Speaker"
          />
          <IconButton
            icon={<FaPhoneSlash />}
            onClick={onCancelCall}
            colorScheme="red"
            aria-label="End Call"
          />
        </Box>
      </VStack>
    </Box>
  );
}
