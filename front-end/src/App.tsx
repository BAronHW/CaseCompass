import { ThemeContextType } from "./context/ThemeContext";
import { ThemeState, useTheme } from "./Hooks/useTheme"

function App() {

  const { theme } : ThemeContextType = useTheme();
  return (
    <div className={`${theme === ThemeState.DARK ? "bg-black" : "bg-white"}`}>App</div>
  )
}

export default App