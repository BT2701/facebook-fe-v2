import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {user, setUser} = useUser();
    const navigate = useNavigate();

    const handleLogin = async(e) => {
        e.preventDefault();
        // Handle login logic here
        await axios.post('http://localhost:8000/user/api/login', {
            email,
            password
        }).then((response) => {
            console.log('Login response:', response.data);
            localStorage.setItem('token', response.data?.data.token);
            localStorage.setItem('user', JSON.stringify(response.data?.data.user));
            setUser(response.data?.data.user);
            toast.success('Login successfully!');
            navigate('/chatbox');
        }
        ).catch((error) => {
            console.error('Login error:', error);
        });
    };

    const handleForgotPassword = () => {
        // Handle forgot password logic here
        navigate('/forgot');
    };

    const handleRegister = () => {
        // Handle redirect to register page logic here
        navigate('/register');
    };

    return (
        <Container maxWidth="xs">
            <Box mt={8} display="flex" flexDirection="column" alignItems="center">
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <form onSubmit={handleLogin} style={{ width: '100%', marginTop: '1em' }}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        style={{ margin: '1em 0' }}
                    >
                        Login
                    </Button>
                </form>
                <Button onClick={handleForgotPassword} color="secondary">
                    Forgot Password
                </Button>
                <Button onClick={handleRegister} color="secondary">
                    Register
                </Button>
            </Box>
        </Container>
    );
};

export default Login;