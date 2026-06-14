import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  // multiInjectedProviderDiscovery is true by default — wagmi auto-discovers
  // all EIP-6963 wallets (MetaMask gets id "io.metamask", OKX gets its own id)
  connectors: [
    injected(), // fallback for non-EIP-6963 environments
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
});

export { baseSepolia };
