import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Text,
  Heading,
  Divider,
  Flex,
  HStack,
  Input,
  VStack,
  Box,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";

export const Signup = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // State để lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
  });

  // Hàm xử lý thay đổi khi nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Hàm kiểm tra email hợp lệ
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Hàm kiểm tra mật khẩu hợp lệ
  const isValidPassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*^?&#<>])[A-Za-z\d@$!%*^?&#<>]{8,}$/;

    return passwordRegex.test(password);
  };

  // Hàm kiểm tra tuổi lớn hơn 13
  const isOlderThan13 = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Kiểm tra xem ngày sinh có trễ hơn 13 năm
    return (
      age > 13 ||
      (age === 13 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
    );
  };

  // Hàm kiểm tra các trường không được để trống
  const areFieldsNotEmpty = () => {
    const { firstName, lastName, email, password, dateOfBirth, gender } =
      formData;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !dateOfBirth ||
      !gender
    ) {
      return false;
    }
    return true;
  };
  // Hàm xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!areFieldsNotEmpty()) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    // Kết hợp firstName và lastName thành name
    const userData = {
      name: `${formData.firstName} ${formData.lastName}`,
      birth: formData.dateOfBirth,
      avt: "", // Thay null bằng chuỗi rỗng nếu không có avatar
      phone: "", // Tương tự với phone
      email: formData.email,
      gender: formData.gender,
      desc: "", // Thay null bằng chuỗi rỗng
      isonline: 0,
      lastActive: new Date(),
      password: formData.password,
      Address: "", // Tương tự với Address
      Social: "", // Tương tự với Social
      Education: "", // Tương tự với Education
      Relationship: "", // Tương tự với Relationship
      TimeJoin: "2010-10-10T00:00:00", // Cập nhật TimeJoin với thời gian hiện tại
    };

    // Kiểm tra tính hợp lệ
    if (!isValidEmail(formData.email)) {
      toast({
        title: "Invalid email.",
        description: "Please enter a valid email address.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!isOlderThan13(formData.dateOfBirth)) {
      toast({
        title: "Invalid date of birth.",
        description: "You must be at least 13 years old to sign up.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!isValidPassword(formData.password)) {
      toast({
        title: "Invalid password.",
        description:
          "Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Nếu tất cả đều hợp lệ, thực hiện yêu cầu API
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast({
          title: "Account created.",
          description:
            "Your account has been successfully created. Please verify your email to log in.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error.",
        description:
          error.response?.data?.message || "Failed to create account",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Button
        onClick={onOpen}
        size="lg"
        bg={"#42b72a"}
        fontWeight={500}
        color={"white"}
        _hover={{ bg: "#39a125" }}
      >
        Create New Account
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading fontSize={32} fontWeight={700}>
              Sign Up
            </Heading>
            <Text fontSize={15} my={1} color={"grey"} fontWeight={400}>
              It's quick and easy.
            </Text>
          </ModalHeader>

          <ModalCloseButton />
          <Divider />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack gap={1} mt={3}>
                <HStack>
                  <Input
                    name="firstName"
                    type="text"
                    bg={"#f0f2f5"}
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <Input
                    name="lastName"
                    type="text"
                    bg={"#f0f2f5"}
                    placeholder="Surname"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </HStack>
                <Input
                  name="email"
                  type="email"
                  bg={"#f0f2f5"}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Input
                  name="password"
                  type="password"
                  bg={"#f0f2f5"}
                  placeholder="New Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Box w={"100%"}>
                  <Text fontSize={12} color="grey">
                    Date of Birth
                  </Text>
                  <Input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </Box>

                <Select
                  name="gender"
                  placeholder="Select Gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="custom">Custom</option>
                </Select>
                <Text fontSize={11} color="grey">
                  By clicking Sign Up, you agree to our Terms, Data Policy and
                  Cookie Policy. You may receive Email notifications from us and
                  can opt out at any time.
                </Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Flex justify={"center"} w={"100%"}>
                <Button
                  type="submit"
                  colorScheme="green"
                  size={"sm"}
                  fontWeight={500}
                  fontSize={20}
                  w={"50%"}
                  bg={"#42b72a"}
                  _hover={{ bg: "#7eb673" }}
                  mb={3}
                >
                  Sign Up
                </Button>
              </Flex>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
