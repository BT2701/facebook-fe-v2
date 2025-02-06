import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select } from '@chakra-ui/react';

const AutoSpinOptions = ({ isOpen, onClose, autoSpinCount, setAutoSpinCount, autoSpinOptions }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Auto Spin Options</ModalHeader>
        <ModalBody>
          <Select
            mt={4}
            value={autoSpinCount}
            onChange={(e) => setAutoSpinCount(Number(e.target.value))}
          >
            {autoSpinOptions?.map((option) => (
              <option key={option} value={option}>
                {option} Spins
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

export default AutoSpinOptions;
