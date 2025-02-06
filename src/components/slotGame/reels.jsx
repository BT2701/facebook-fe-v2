import React, { useState, useEffect } from 'react';
import { Grid, GridItem, Box, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { use } from 'react';

const ReelsComponent = ({ isSpin, setIsSpin, balance, setBalance, playerID, betAmount, setFlag }) => {
  const [grid, setGrid] = useState([]);
  const [totalWin, setTotalWin] = useState(0);
  const [rows, setRows] = useState(4);
  const [columns, setColumns] = useState(5);
  const [symbols, setSymbols] = useState([]);
  const [paylines, setPaylines] = useState([]);
  const toast = useToast();

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchReelData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/game/reels`);
        setRows(response?.data.data.reel.rows);
        setColumns(response?.data.data.reel.columns);
      } catch (error) {
        console.error('Failed to fetch reel data:', error);
      }
    };

    const fetchSymbols = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/game/symbols`);
        const symbolsData = response.data.data.symbols;
        setSymbols(symbolsData);
      } catch (error) {
        console.error('Failed to fetch symbols data:', error);
      }
    };

    const fetchPaylines = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/game/paylines`);
        const paylinesData = response?.data.data.paylines;
        setPaylines(paylinesData || []);
      } catch (error) {
        console.error('Failed to fetch paylines data:', error);
      }
    };

    fetchReelData();
    fetchSymbols();
    fetchPaylines();
  }, []);

  const getRandomSymbol = () => {
    const symbolsList = symbols.map(symbol => symbol.name);
    return symbolsList[Math.floor(Math.random() * symbolsList.length)];
  };

  useEffect(() => {
    if (symbols.length > 0 && rows > 0 && columns > 0) {
      // Tạo grid ngẫu nhiên ngay khi dữ liệu đã sẵn sàng
      const initialGrid = Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => getRandomSymbol())
      );
      setGrid(initialGrid);
    }
  }, [symbols, rows, columns]);


  // Tính toán winlines và các kết quả
  // const calculateWinnings = (finalSymbols) => {
  //   let winAmount = 0;
  //   const results = [];

  //   paylines.forEach((payline) => {
  //     const { pattern } = payline;
  //     const maxCols = pattern?.length;

  //     // Thứ tự kiểm tra ưu tiên: 5 cột -> 4 cột -> 3 cột
  //     const winningPatterns = [5, 4, 3].filter(size => size <= maxCols);

  //     for (let size of winningPatterns) {
  //       const subsetPattern = pattern.slice(0, size);
  //       const initialSymbol = finalSymbols[subsetPattern[0][1]][subsetPattern[0][0]];

  //       if (!initialSymbol) continue; // Bỏ qua nếu symbol ban đầu không xác định

  //       // Kiểm tra nếu tất cả symbols giống nhau
  //       const isWinningPattern = subsetPattern.every(([col, row]) => finalSymbols[row][col] === initialSymbol);

  //       if (isWinningPattern) {
  //         winAmount += betAmount * getSymbolValue(initialSymbol, size);
  //         results.push({
  //           paylineId: payline.id,
  //           symbol: initialSymbol,
  //           occurrences: size,
  //           onWinline: true,
  //           symbolValue: getSymbolValue(initialSymbol, size),
  //           positions: subsetPattern,
  //         });
  //         break; // Thoát khỏi vòng lặp kiểm tra nếu đã thắng
  //       }
  //     }
  //   });

  //   return { winAmount, results };
  // };

  const calculateWinnings = async (finalSymbols) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/game/calculate_winnings`,
        {
          finalSymbols,
          betAmount
        }
      );
      console.log('Winnings calculated:', response.data.data);
      if (response.status === 200) {
        const { winAmount, results } = response.data.data;
        return { winAmount, results };
      }
    } catch (error) {
      console.error('Failed to calculate winnings:', error);
    }

    return { winAmount: 0, results: [] };
  };


  const getSymbolValue = (symbolName, count) => {
    const symbol = symbols.find(symbol => symbol.name === symbolName);
    return symbol ? symbol.values[count] : 0;
  };

  // Xử lý quay reels
  useEffect(() => {
    if (isSpin) {
      console.log('Spinning...');
      const spinningGrid = Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => getRandomSymbol())
      );
      setGrid(spinningGrid);

      // Khi dừng quay
      console.log('Spinning stopped!');
      setIsSpin(false);
      handleResult(spinningGrid); // Tính toán kết quả ngay sau khi dừng
    }
  }, [isSpin, rows, columns, symbols]);

  // Xử lý kết quả khi các reel dừng
  const handleResult = async (finalGrid) => {
    const { winAmount, results } = await calculateWinnings(finalGrid);
    setTotalWin(winAmount);

    if (winAmount > 0) {
      setBalance((prev) => prev + winAmount);
      toast({
        title: 'Congratulations!',
        description: `You won ${winAmount.toFixed(2)}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }

    // Lưu dữ liệu session và result xuống database
    const sessionData = {
      playerId: playerID,
      totalBetAmount: betAmount,
      totalWin: winAmount,
      status: winAmount > 0 ? 'Win' : 'Lose',
      createdAt: new Date(),
      balance: balance + winAmount,
    };

    try {
      const sessionResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/game/game_session`,
        sessionData
      );

      const sessionId = sessionResponse?.data.data.gameSession.id;
      const resultData = results?.map((result) => ({
        ...result,
        sessionId,
        payline: Number(result.paylineId),
      }));
      if (resultData?.length >0){
        for (const result of resultData) {
          const resultRes = await axios.post(`${process.env.REACT_APP_API_URL}/game/game_result`, result);
          console.log('Results saved:', resultRes.data.data.gameResult);
        }
      }
      if (winAmount > 0){
        await axios.put(
          `${process.env.REACT_APP_API_URL}/game/player/${playerID}/balance?amount=${balance + winAmount}`
        );
      }
      setFlag(1);
    } catch (error) {
      console.error('Error saving session or results:', error);
    }
  };

  return (
    <Grid templateColumns={`repeat(${columns}, 1fr)`} gap={2}>
      {grid.map((row, rowIndex) =>
        row.map((symbol, colIndex) => {
          const symbolData = symbols.find(s => s.name === symbol);
          return (
            <GridItem key={`${rowIndex}-${colIndex}`}>
              <Box
                bg={symbolData ? symbolData.color : 'gray.300'}
                w="60px"
                h="60px"
                display="flex"
                justifyContent="center"
                alignItems="center"
                border="2px solid"
                borderColor="gray.300"
                rounded="lg"
                shadow="md"
                fontSize="2xl"
                color="white"
                fontWeight="bold"
              >
                {symbol}
              </Box>
            </GridItem>
          );
        })
      )}
    </Grid>
  );
};

const Reels = React.memo(ReelsComponent);

export default Reels;
