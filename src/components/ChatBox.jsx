import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';



const ChatBox = () => {
    const [messages, setMessages] = useState([]); // Danh sách tin nhắn
    const [input, setInput] = useState(''); // Nội dung tin nhắn
    const { user, setUser } = useUser(); // Thông tin user từ context
    const [socket, setSocket] = useState(null); // WebSocket kết nối
    const nav = useNavigate(); // Điều hướng trang
    const [users, setUsers] = useState([]); // Danh sách user

    useEffect(() => {
        // Lấy danh sách user từ API
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/api/users');
                setUsers(response.data.data);
            } catch (error) {
                console.error('Fetch users error:', error);
            }
        };
        fetchUsers();

    }, [user]); // Khi user thay đổi, useEffect sẽ chạy lại
    useEffect(() => {
        // Kiểm tra trạng thái đăng nhập
        if (!user) {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000; // Current time in seconds
                    if (decodedToken.exp < currentTime) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        nav('/login');
                    } else {
                        setUser(JSON.parse(user));
                    }
                } catch (err) {
                    console.error("Invalid token", err);
                    nav('/login');
                }
            } else {
                nav('/login');
            }
        }
    }, [user, nav]);

    useEffect(() => {
        // Kiểm tra nếu user đã có giá trị
        if (user?.id) {
            // Tạo kết nối WebSocket
            const ws = new WebSocket(`ws://localhost:8000/chat/api/ws?userID=${user.id}`);
            setSocket(ws);
            console.log('WebSocket connection opened', ws);

            // Nhận tin nhắn từ server qua WebSocket
            ws.onmessage = (event) => {
                const receivedMessage = JSON.parse(event.data);
                setMessages((prevMessages) => [...prevMessages, receivedMessage]);
            };

            ws.onclose = () => {
                console.log('WebSocket connection closed');
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            // Dọn dẹp kết nối WebSocket khi component unmount
            return () => {
                ws.close();
            };
        }
    }, [user]); // Khi user thay đổi, useEffect sẽ chạy lại


    const handleSend = () => {
        if (input.trim() && socket) {
            const message = {
                sender: user.id, // ID người gửi
                receiver: '67691a446d9814e1b5fbb2e5', // TODO: Thay bằng ID người nhận (cần truyền từ context hoặc state)
                content: input.trim(),
            };
            socket.send(JSON.stringify(message)); // Gửi tin nhắn qua WebSocket
            setMessages((prevMessages) => [...prevMessages, message]); // Hiển thị tin nhắn ngay
            setInput('');
        }
    };
    const getNameById = (id) => {
        const user = users.find((user) => user.id === id);
        return user ? user.name : 'Unknown';
    }

    return (
        <Paper elevation={3} sx={{ padding: 2, maxWidth: 400, margin: 'auto' }}>
            <Typography variant="h6" mb={2}>
                Chat with your friends
            </Typography>
            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2, p: 1, border: '1px solid #ccc', borderRadius: 2 }}>
                {messages.map((message, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: message.sender === user.id ? 'flex-end' : 'flex-start',
                            mb: 1,
                        }}
                    >
                        <Typography variant="caption" color="textSecondary">
                            {message.sender === user.id ? 'You' : `${getNameById(message.sender)}`}
                        </Typography>
                        <Box
                            sx={{
                                padding: 1,
                                borderRadius: 1,
                                bgcolor: message.sender === user.id ? 'primary.main' : 'grey.300',
                                color: message.sender === user.id ? 'white' : 'black',
                            }}
                        >
                            {message.content}
                        </Box>
                    </Box>
                ))}
            </Box>
            <Box display="flex">
                <TextField
                    fullWidth
                    variant="outlined"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    sx={{ mr: 1 }}
                />
                <Button variant="contained" color="primary" onClick={handleSend}>
                    Send
                </Button>
            </Box>
        </Paper>
    );
};

export default ChatBox;
