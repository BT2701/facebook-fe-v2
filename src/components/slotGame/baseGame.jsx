import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Grid,
  VStack,
  HStack,
  useDisclosure,
} from '@chakra-ui/react';
import Reels from './reels';
import BuyFeatureModal from './buyFeature';
import BetAmountModal from './betOptions';
import AutoSpinOptions from './autoSpin';
import { useUser } from "../../context/UserContext";
import { use } from 'react';
import axios from 'axios';
import GameHistory from './gameHistory';

const autoSpinOptions = [10, 50, 100];

const BaseGame = () => {
  const [betAmount, setBetAmount] = useState(1.5);
  const [autoSpinCount, setAutoSpinCount] = useState(autoSpinOptions[0]);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [balance, setBalance] = useState(1000); // Số dư giả lập ban đầu
  const { currentUser, setFriendList } = useUser();
  const [isSpin, setIsSpin] = useState(false);
  const [player, setPlayer] = useState(null);
  const [flag, setFlag] = useState(0);
  const [betOptions, setBetOptions] = useState([]);

  const { isOpen: isBuyFeatureOpen, onOpen: openBuyFeature, onClose: closeBuyFeature } = useDisclosure();
  const { isOpen: isBetAmountOpen, onOpen: openBetAmount, onClose: closeBetAmount } = useDisclosure();
  const { isOpen: isAutoSpinOpen, onOpen: openAutoSpin, onClose: closeAutoSpin } = useDisclosure();

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/game/player/${currentUser?.id}`);
        setPlayer(response?.data.data.player);
        setBalance(response?.data.data.player.balance);
      } catch (error) {
        console.error('Failed to fetch player data:', error);
      }
    };

    fetchPlayerData();
    setFlag(0);
  }, [currentUser, flag]);

  useEffect(() => {
    const fetchBetOptions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/game/bets`);
        setBetOptions(response?.data.data.bet_options);
      } catch (error) {
        console.error('Failed to fetch bet options:', error);
      }
    };

    fetchBetOptions();
  }, []);

  const handleSpin = async() => {
    const newBalance = player?.balance - betAmount;
    const response = await axios.put(`${process.env.REACT_APP_API_URL}/game/player/${currentUser?.id}/balance?amount=${newBalance}`);
    if (response?.data.status === 200) {
      setFlag(1);
      setBalance(newBalance);
    }
    setIsSpin(true);
  }

  return (
    <VStack spacing={8} p={5} bg="gray.50" minH="80vh" justifyContent="center">
      <Text fontSize="4xl" fontWeight="bold" color="teal.500">
        Slot Game <GameHistory /> 
      </Text>

      <HStack spacing={8} alignItems="flex-start" ml="12em">
        {/* Reels */}
        <VStack spacing={2} alignItems="center">
          <Box bg="white" p={5} rounded="md" shadow="md" maxW="lg" w="full">
            <Reels isSpin= {isSpin} setIsSpin= {setIsSpin} balance={balance} setBalance={setBalance} playerID={currentUser.id} betAmount={betAmount} setFlag={setFlag}/>
          </Box>
          <HStack spacing={4}>
            <Button colorScheme="green" size="lg" onClick={handleSpin}>
              Spin
            </Button>

            {/* <Button colorScheme="yellow" size="lg" onClick={openAutoSpin}>
              Auto Spin
            </Button> */}
          </HStack>
        </VStack>

        {/* Player Balance */}
        <VStack spacing={2} alignItems="center">
          <Box
            bg="teal.100"
            p={4}
            rounded="md"
            shadow="md"
            border="2px solid"
            borderColor="teal.300"
            w="200px"
            textAlign="center"
          >
            <Text fontSize="md" fontWeight="bold" color="teal.700">
              ${player?.name}'s Balance
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="teal.900">
              ${player?.balance.toFixed(2)}
            </Text>
          </Box>
          <Text fontSize="lg" fontWeight="medium">
            Bet Amount: {betAmount}
          </Text>
          <Button size="md" colorScheme="teal" onClick={openBetAmount}>
            Adjust Bet
          </Button>
        </VStack>
      </HStack>

      <BuyFeatureModal
        isOpen={isBuyFeatureOpen}
        onClose={closeBuyFeature}
        betAmount={betAmount}
      />
      <BetAmountModal
        isOpen={isBetAmountOpen}
        onClose={closeBetAmount}
        betAmount={betAmount}
        setBetAmount={setBetAmount}
        betOptions={betOptions}
      />
      <AutoSpinOptions
        isOpen={isAutoSpinOpen}
        onClose={closeAutoSpin}
        autoSpinCount={autoSpinCount}
        setAutoSpinCount={setAutoSpinCount}
        autoSpinOptions={autoSpinOptions} // Đây là giá trị cần được truyền
      />
    </VStack>
  );
};

export default BaseGame;
