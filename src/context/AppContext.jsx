import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [dark, setDark] = useState(true);
  const [unit, setUnit] = useState("C");

  return (
    <AppContext.Provider value={{ dark, setDark, unit, setUnit }}>
      {children}
    </AppContext.Provider>
  );
}