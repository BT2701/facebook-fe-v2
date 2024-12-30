import { Search2Icon } from "@chakra-ui/icons";
import {
  Center,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSearchContext } from "../../context/SearchContext";

export const Search = () => {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const { setInput } = useSearchContext();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue !== "") {
      setInput(inputValue);
      navigate(`/search?keywords="${inputValue}"`);
    }
  };

  return (
    <>
      <Center mx={4}>
        <Image
          boxSize="40px"
          borderRadius="full"
          alt="fb Logo"
          src="https://tinyurl.com/46yb9h2c"
        />
      </Center>
      <Center>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            children={<Search2Icon color="gray.300" />}
          />
          <Input
            id="searchbox"
            value={inputValue}
            rounded={"full"}
            placeholder="Search Facebook"
            bg={"#f0f2f5"}
            w={"270px"}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown} // Thêm sự kiện onKeyDown
          />
        </InputGroup>
      </Center>
    </>
  );
};
