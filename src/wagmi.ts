import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import {
  coinbaseWallet,
  injected,
  walletConnect,
  metaMask,
} from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "Create Wagmi" }),
    walletConnect({ projectId: "bec9910961cd780e32a9a7c5e8030bd1" }),
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
