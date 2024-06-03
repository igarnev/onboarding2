import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";

import { config } from "./wagmi";

import { QuizGameComponent } from "./features/QuizGame/QuizGame";
import { MetamaskPanelComponent } from "./features/MetamaskPanel/MetamaskPanel";

import { theme } from "./utils/helpers/theme";

import "./App.scss";

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <div className="app-container">
            <MetamaskPanelComponent></MetamaskPanelComponent>
            <QuizGameComponent />
          </div>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
