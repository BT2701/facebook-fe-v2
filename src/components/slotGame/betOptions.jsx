import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Text, Box, Select } from '@chakra-ui/react';

const BetAmountModal = ({ isOpen, onClose, betAmount, setBetAmount, betOptions }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Adjust Bet Amount</ModalHeader>
        <ModalBody>
          <Text>Bet Amount: {betAmount}</Text>
          <Select
            mt={4}
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
          >
            {betOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" onClick={onClose}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BetAmountModal;
