import { useEffect } from "react";
import { useTheme } from "./Hooks/useTheme"
import { customFetch, requestTypeEnum } from "./lib/customFetch";
import { ThemeState } from "./interfacesEnumsAndTypes/enums";
import { ThemeContextType } from "./interfacesEnumsAndTypes/types";

function App() {
  const { theme } : ThemeContextType = useTheme();

  const fetchThingy = async () : Promise<JSON> => {

    const body = {
      name: 'aaron',
      email: 'aaronwan808@gmail.com',
      password: 'test'
    }

    const jsonBody = JSON.stringify(body);
    const resp = await customFetch('/api/auth/login', requestTypeEnum.POST, jsonBody);
    return resp;
  }

  useEffect(() => {
    const resp = fetchThingy()
    console.log(resp);
  }, [])

  return (
    <div className={`${theme === ThemeState.DARK ? "bg-black" : "bg-white"} min-h-screen w-full h-full`}>App</div>
  )
}

export default App