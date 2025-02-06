import React from 'react';
import { Box, Text } from '@chakra-ui/react';

const PlayerBalance = ({ balance = 1000 }) => {
  return (
    <Box
      bg="teal.100"
      p={4}
      rounded="md"
      shadow="md"
      border="2px solid"
      borderColor="teal.300"
      w="200px"
    >
      <Text fontSize="lg" fontWeight="bold" color="teal.700">
        Player Balance
      </Text>
      <Text fontSize="2xl" fontWeight="bold" color="teal.900">
        ${balance.toFixed(2)}
      </Text>
    </Box>
  );
};

export default PlayerBalance;
