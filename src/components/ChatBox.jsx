import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Paper, IconButton } from '@mui/material';
import { SwitchAccount } from '@mui/icons-material';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";


const ChatBox = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [currentUser, setCurrentUser] = useState('user1');
    const {user, setUser} = useUser();
    const nav = useNavigate();

    useEffect(() => {
        if (!user) {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const currentTime = Date.now() / 1000; // Thời gian hiện tại (giây)
                    console.log('decodedToken:', decodedToken.exp);
                    console.log('currentTime:', currentTime);
                    console.log('user:', user);
                    // Kiểm tra nếu token đã hết hạn
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
    


    const handleSend = () => {
        if (input.trim()) {
            setMessages([...messages, { text: input, sender: currentUser }]);
            setInput('');
        }
    };

    const toggleUser = () => {
        setCurrentUser(currentUser === 'user1' ? 'user2' : 'user1');
    };

    return (
        <Paper elevation={3} sx={{ padding: 2, maxWidth: 400, margin: 'auto' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Chat</Typography>
                <IconButton onClick={toggleUser} color="primary">
                    <SwitchAccount />
                </IconButton>
            </Box>
            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                {messages.map((message, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: 'flex',
                            justifyContent: message.sender === currentUser ? 'flex-end' : 'flex-start',
                            mb: 1
                        }}
                    >
                        <Box
                            sx={{
                                padding: 1,
                                borderRadius: 1,
                                bgcolor: message.sender === currentUser ? 'primary.main' : 'grey.300',
                                color: message.sender === currentUser ? 'white' : 'black'
                            }}
                        >
                            {message.text}
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