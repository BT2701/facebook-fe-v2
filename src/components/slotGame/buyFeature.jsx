import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Text, Box } from '@chakra-ui/react';

const BuyFeatureModal = ({ isOpen, onClose, betAmount }) => {
  const [totalCost, setTotalCost] = useState(betAmount * 10);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Buy Feature</ModalHeader>
        <ModalBody>
          <Text>Total Cost: {totalCost}</Text>
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button onClick={() => setTotalCost(totalCost - 10)}>-</Button>
            <Text>Bet Amount: {betAmount}</Text>
            <Button onClick={() => setTotalCost(totalCost + 10)}>+</Button>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Buy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BuyFeatureModal;
