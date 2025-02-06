import React, { useEffect, useState } from 'react';
import {
  Table, Tbody, Thead, Tr, Th, Td,
  Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  useDisclosure, Text, HStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { FaHistory, FaEye, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import GameHistoryDetail from './gameHistoryDetail';

const GameHistory = () => {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const { currentUser } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/game/game_sessions/${currentUser?.id}`,
          { params: { page, limit: 6 } }
        );
        setHistory(response?.data?.data?.gameSessions || []);
      } catch (error) {
        console.error('Failed to fetch game history:', error);
      }
    };

    if (isOpen) fetchHistory();
  }, [isOpen, currentUser, page]);

  const handleViewDetail = (detail) => setSelectedDetail(detail);

  return (
    <>
      <Button colorScheme="gray" onClick={onOpen} ml={0} borderRadius={100}>
        <FaHistory size={20} />
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Game History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {history.length > 0 ? (
              <>
                <Table variant="striped" colorScheme="teal">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Bet Amount</Th>
                      <Th>Total Win</Th>
                      <Th>Status</Th>
                      <Th>Balance</Th>
                      <Th>Detail</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {history.map((entry, index) => (
                      <Tr key={index}>
                        <Td>{new Date(entry.createdAt).toLocaleString()}</Td>
                        <Td>${entry.totalBetAmount.toFixed(2)}</Td>
                        <Td>${entry.totalWin.toFixed(2)}</Td>
                        <Td>{entry.status}</Td>
                        <Td>${entry?.balance?.toFixed(2)}</Td>
                        <Td>
                          <Button colorScheme="teal" size="sm" onClick={() => handleViewDetail(entry)}>
                            <FaEye size={20} />
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                {/* Pagination Controls */}
                <HStack justify="space-between" mt={4}>
                  <Button
                    leftIcon={<FaArrowLeft />}
                    onClick={() => setPage(page > 1 ? page - 1 : 1)}
                    isDisabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Text>Page {page}</Text>
                  <Button
                    rightIcon={<FaArrowRight />}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </HStack>
              </>
            ) : (
              <Text>No game history available.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {selectedDetail && (
        <GameHistoryDetail detail={selectedDetail} onClose={() => setSelectedDetail(null)} />
      )}
    </>
  );
};

export default GameHistory;
