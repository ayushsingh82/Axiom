"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { createWalletClient, createPublicClient, custom, http } from "viem";
import { baseSepolia } from "viem/chains";

type WalletState = {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletState>({
  address: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask not found. Install MetaMask to continue.");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum),
      });
      const [addr] = await walletClient.requestAddresses();
      setAddress(addr);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected: !!address,
        error,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}

// Extend window type for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
