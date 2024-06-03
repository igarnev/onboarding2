import { http, createConfig } from "@wagmi/core";
import { mainnet, sepolia } from "@wagmi/core/chains";

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [sepolia.id]: http(
      "https://sepolia.infura.io/v3/98f31cd360df4a5bb4a922baef386c2e"
    ),
    [mainnet.id]: http(),
  },
});
