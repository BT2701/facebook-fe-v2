import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { useState } from "react";
import { Signup } from "./Signup";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { setCurrentUser } = useUser();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleCaptchaChange = (value) => {
    setCaptcha(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loginAttempts >= 5 && !captcha) {
      toast({
        title: "Please confirm you are not a robot.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    // Handle login logic here
    await axios.post(`${process.env.REACT_APP_API_URL}/user/api/login`, {
      email,
      password
    }).then((response) => {
      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data?.data.token);
      localStorage.setItem('user', JSON.stringify(response.data?.data.user));
      setCurrentUser(response.data?.data.user);
      toast({
        title: "Login successed.",
        description:
          "Well come to Facebook.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    }
    ).catch((error) => {
      toast({
        title: "Error.",
        description:
          error.response?.data?.message || "Failed to login",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error('Login error:', error);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  const forgot = () => {
    navigate("/forgot");
  };


  return (
    <Box bg={"#f0f2f5"} h={"700px"}>
      <Grid
        templateColumns="repeat(2, 1fr)"
        maxW={"1100px"}
        m={"auto"}
        h={"600px"}
      >
        <Box mt={"160px"} py={5} ps={8} pe={2}>
          <Heading color={"#1877f2"} fontSize={60} mb={4}>
            facebook
          </Heading>
          <Text lineHeight={1.2} fontWeight={500} fontSize={26}>
            Facebook helps you connect and share with the people in your life.
          </Text>
        </Box>

        <Box>
          <Container
            h={"500px"}
            maxW={"400px"}
            mt={"120px"}
            bg={"white"}
            boxShadow={"lg"}
            rounded={10}
            p={4}
          >
            <VStack gap={2}>
              <form onSubmit={handleLogin}>
                <Input
                  type="email"
                  placeholder="Email address"
                  h={"50px"}
                  mb={4}
                  onChange={handleChangeEmail}
                  onKeyDown={handleKeyDown}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  h={"50px"}
                  mb={4}
                  onChange={handleChangePassword}
                  onKeyDown={handleKeyDown}
                />
                {loginAttempts >= 5 && (
                  <ReCAPTCHA
                    sitekey="6LdAwXQqAAAAAK2fIAzIWCiaPsev2dm8_KBr6aOp"
                    hl="en"
                    onChange={handleCaptchaChange}
                  />
                )}
                <Button
                  type="submit"
                  w={"100%"}
                  bg={"#1877f2"}
                  color={"white"}
                  fontWeight={500}
                  size="lg"
                >
                  Log In
                </Button>
              </form>
              <Divider />
              <Text color="#1877f2" cursor="pointer" onClick={forgot} mt={4}>
                Forgot account?
              </Text>
              <Flex justify={"center"} mt={6}>
                <Signup />
              </Flex>
            </VStack>
          </Container>
        </Box>
      </Grid>

    </Box>
  );
};
