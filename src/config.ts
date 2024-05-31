import { http, createConfig } from "@wagmi/core";
import { mainnet, sepolia } from "@wagmi/core/chains";

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});
