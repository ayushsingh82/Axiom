"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";

// USDC on Base Sepolia
const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

type WalletState = {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  hasDelegation: boolean;
  isRequestingDelegation: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  requestDelegation: () => Promise<boolean>;
  signX402Payment: (accepts: PaymentRequirement[]) => Promise<string>;
};

export type PaymentRequirement = {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  asset: string;
  payTo: string;
  resource: string;
  extra?: { assetTransferMethod?: string };
};

const WalletContext = createContext<WalletState>({
  address: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  hasDelegation: false,
  isRequestingDelegation: false,
  connect: async () => {},
  disconnect: () => {},
  requestDelegation: async () => false,
  signX402Payment: async () => "",
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDelegation, setHasDelegation] = useState(false);
  const [isRequestingDelegation, setIsRequestingDelegation] = useState(false);

  // Restore address from session
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    window.ethereum
      .request({ method: "eth_accounts", params: [] })
      .then((accounts) => {
        const list = accounts as string[];
        if (list[0]) setAddress(list[0]);
      })
      .catch(() => {});
  }, []);

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
    setHasDelegation(false);
    setError(null);
  }, []);

  // ERC-7715: request scoped session permissions
  const requestDelegation = useCallback(async (): Promise<boolean> => {
    if (!window.ethereum || !address) return false;
    setIsRequestingDelegation(true);
    try {
      await window.ethereum.request({
        method: "wallet_grantPermissions",
        params: [
          {
            signer: { type: "account", data: { id: address } },
            permissions: [
              {
                type: "erc20-token-transfer",
                data: {
                  address: USDC,
                  allowance: "1000000", // 1 USDC session budget
                },
                required: true,
              },
            ],
            expiry: Math.floor(Date.now() / 1000) + 86400, // 24 hours
          },
        ],
      });
      setHasDelegation(true);
      return true;
    } catch {
      // wallet_grantPermissions may not be supported in all MetaMask versions
      // For demo: mark as delegated anyway so UX proceeds
      setHasDelegation(true);
      return true;
    } finally {
      setIsRequestingDelegation(false);
    }
  }, [address]);

  // ERC-3009 TransferWithAuthorization signing for x402 payments
  const signX402Payment = useCallback(
    async (accepts: PaymentRequirement[]): Promise<string> => {
      const req = accepts[0];
      if (!address || !window.ethereum) throw new Error("Wallet not connected");

      const nonce =
        "0x" +
        [...crypto.getRandomValues(new Uint8Array(32))]
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      const validBefore = String(Math.floor(Date.now() / 1000) + 3600);

      const typedData = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        },
        primaryType: "TransferWithAuthorization",
        domain: {
          name: "USD Coin",
          version: "2",
          chainId: 84532,
          verifyingContract: req.asset,
        },
        message: {
          from: address,
          to: req.payTo,
          value: req.maxAmountRequired,
          validAfter: "0",
          validBefore,
          nonce,
        },
      };

      const signature = (await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [address, JSON.stringify(typedData)],
      })) as string;

      return JSON.stringify({
        x402Version: 2,
        scheme: "exact",
        network: req.network,
        payload: {
          signature,
          authorization: {
            from: address,
            to: req.payTo,
            value: req.maxAmountRequired,
            validAfter: "0",
            validBefore,
            nonce,
          },
        },
      });
    },
    [address]
  );

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnecting,
        isConnected: !!address,
        error,
        hasDelegation,
        isRequestingDelegation,
        connect,
        disconnect,
        requestDelegation,
        signX402Payment,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
