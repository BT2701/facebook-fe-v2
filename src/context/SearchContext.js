import { createContext, useContext, useState } from "react";

const SearchContext = createContext();


export const SearchProvider = ({ children }) => {
    const [input, setInput] = useState("");
  
    return (
      <SearchContext.Provider value={{ input, setInput }}>
        {children}
      </SearchContext.Provider>
    );
  };
  
  export const useSearchContext = () => {
    return useContext(SearchContext);
  };
  