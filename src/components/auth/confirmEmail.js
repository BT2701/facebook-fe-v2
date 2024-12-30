import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const ConfirmEmail = () => {
  const { email } = useParams(); // Lấy email từ đường dẫn
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/user/confirm-email?email=${email}`
        );

        if (response.status === 200) {
          toast({
            title: "Xác thực thành công!",
            description:
              "Email của bạn đã được xác thực. Bạn có thể đăng nhập.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          navigate("/login"); // Điều hướng về trang đăng nhập
        }
      } catch (error) {
        if (error.response) {
          toast({
            title: "Xác thực không thành công!",
            description: error.response.data || "Có lỗi xảy ra.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    };

    confirmEmail();
  }, [email, navigate, toast]);

  return (
    <div>
      <h1>Đang xác thực email...</h1>
    </div>
  );
};

export default ConfirmEmail;
