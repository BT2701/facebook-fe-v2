import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const GameHistoryDetail = ({ detail, onClose }) => {
    const [historyDetail, setHistoryDetail] = useState([]);
    useEffect(() => {
        const fetchHistoryDetail = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/game/game_results/${detail?.id}`);
                setHistoryDetail(response?.data?.data?.gameResults || []);
                console.log("detail",response?.data?.data?.gameResults);

            } catch (error) {
                console.error('Failed to fetch game history:', error);
            }
        }
        fetchHistoryDetail();

    }, [detail]);


    if (!detail) return null;

    return (
        <Modal isOpen={!!detail} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Game Session Detail</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align="start" spacing={4} width="100%">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid black', padding: '8px' }}>Symbol</th>
                                    <th style={{ border: '1px solid black', padding: '8px' }}>Occurrences</th>
                                    <th style={{ border: '1px solid black', padding: '8px' }}>On Winline</th>
                                    <th style={{ border: '1px solid black', padding: '8px' }}>Symbol Value</th>
                                    <th style={{ border: '1px solid black', padding: '8px' }}>Payline</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyDetail.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid black', padding: '8px' }}>{item.symbol}</td>
                                        <td style={{ border: '1px solid black', padding: '8px' }}>{item.occurrences}</td>
                                        <td style={{ border: '1px solid black', padding: '8px' }}>{item.onWinline ? 'Yes' : 'No'}</td>
                                        <td style={{ border: '1px solid black', padding: '8px' }}>{item.symbolValue}</td>
                                        <td style={{ border: '1px solid black', padding: '8px' }}>{item.payline}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default GameHistoryDetail;
