import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
const Forgot = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/user/api/forgot', { email });
            console.log('Forgot response:', response.data);
            toast({
                title: "Successed.",
                description:
                  "Please check your email to change password.",
                status: "success",
                duration: 3000,
                isClosable: true,
              });            
              navigate('/login');
        } catch (error) {
            console.error('Forgot error:', error);
            toast({
                title: "Error.",
                description:
                  error.response?.data?.message || "Failed",
                status: "error",
                duration: 3000,
                isClosable: true,
              });        
            }
    };

    const handleBack = () => {
        navigate('/login');
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="w-50 p-4 border rounded shadow-sm">
                <h3 className="text-center mb-4">Quên mật khẩu</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Gửi yêu cầu
                    </button>
                </form>
                <button
                    onClick={handleBack}
                    className="btn btn-secondary w-100 mt-3"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
};

export default Forgot;
