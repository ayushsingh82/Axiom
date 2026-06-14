import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask(), // EIP-6963 — targets MetaMask specifically, ignores OKX/other wallets
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

export { baseSepolia };
