import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Forgot = () => {
    const [email, setEmail] = useState('');
    const nav= useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        await axios.post('http://localhost:8000/user/api/forgot', {
            email
        }).then((response) => {
            console.log('Forgot response:', response.data);
            toast.success('Please check your email to reset password!');
            nav('/login');
        }).catch((error) => {
            console.error('Forgot error:', error);
        }
        );
    };

    const handleBack = () => {
        // Handle redirect to login page logic here
        nav('/login');
    };

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Quên mật khẩu
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Gửi yêu cầu
                    </Button>
                </form>
                <Button onClick={handleBack} variant="outlined" color="secondary" fullWidth style={{ marginTop: '10px' }}>
                    Quay lại
                </Button>
            </Box>
        </Container>
    );
};

export default Forgot;