"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { baseSepolia } from "wagmi/chains";

const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

export type PaymentRequirement = {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  asset: string;
  payTo: string;
  resource: string;
  extra?: { assetTransferMethod?: string };
};

export type DelegationContext = {
  context: string;
  expiry: number;
  signerMeta?: unknown;
  accountMeta?: unknown;
  grantedPermissions?: unknown[];
};

type WalletState = {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  isFlask: boolean;
  error: string | null;
  hasDelegation: boolean;
  delegationContext: DelegationContext | null;
  delegationError: string | null;
  isRequestingDelegation: boolean;
  connect: () => void;
  disconnect: () => void;
  requestDelegation: () => Promise<boolean>;
  signX402Payment: (accepts: PaymentRequirement[]) => Promise<string>;
};

const WalletContext = createContext<WalletState>({
  address: null,
  isConnecting: false,
  isConnected: false,
  isFlask: false,
  error: null,
  hasDelegation: false,
  delegationContext: null,
  delegationError: null,
  isRequestingDelegation: false,
  connect: () => {},
  disconnect: () => {},
  requestDelegation: async () => false,
  signX402Payment: async () => "",
});

type EthProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function WalletInner({ children }: { children: ReactNode }) {
  const { address, isConnected, chain } = useAccount();
  const { connect: wagmiConnect, connectors, isPending } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const [error, setError] = useState<string | null>(null);
  const [hasDelegation, setHasDelegation] = useState(false);
  const [delegationContext, setDelegationContext] = useState<DelegationContext | null>(null);
  const [delegationError, setDelegationError] = useState<string | null>(null);
  const [isRequestingDelegation, setIsRequestingDelegation] = useState(false);

  // Prefer MetaMask Flask (io.metamask.flask) over regular MetaMask (io.metamask)
  function getFlaskConnector() {
    return (
      connectors.find((c) => c.id === "io.metamask.flask") ??
      connectors.find((c) => c.id === "io.metamask") ??
      connectors.find((c) => c.name?.toLowerCase().includes("flask")) ??
      connectors.find((c) => c.id === "injected")
    );
  }

  const isFlask = connectors.some((c) => c.id === "io.metamask.flask");

  const connect = useCallback(() => {
    setError(null);
    const connector = getFlaskConnector();
    if (!connector) {
      setError("MetaMask Flask not found. Please install it from metamask.io/flask");
      return;
    }
    wagmiConnect({ connector, chainId: baseSepolia.id });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectors, wagmiConnect]);

  const disconnect = useCallback(() => {
    wagmiDisconnect();
    setHasDelegation(false);
    setDelegationContext(null);
    setDelegationError(null);
    setError(null);
  }, [wagmiDisconnect]);

  // Get the provider from the Flask/MetaMask connector
  async function getProvider(): Promise<EthProvider> {
    // Try wagmi connector first (respects EIP-6963 RDNS targeting)
    const connector = getFlaskConnector();
    const connectorProvider = await connector?.getProvider?.().catch(() => null);
    if (connectorProvider) return connectorProvider as EthProvider;

    // Fallback: window.ethereum — Flask sets this when it is the active wallet
    if (typeof window !== "undefined" && (window as unknown as { ethereum?: EthProvider }).ethereum) {
      return (window as unknown as { ethereum: EthProvider }).ethereum;
    }

    throw new Error("MetaMask Flask provider not available. Is Flask unlocked?");
  }

  // ERC-7715: wallet_grantPermissions — shows real MetaMask Flask confirmation
  const requestDelegation = useCallback(async (): Promise<boolean> => {
    if (!address) return false;
    setIsRequestingDelegation(true);
    setDelegationError(null);

    // Extract human-readable error from anything Flask throws
    function extractError(e: unknown): string {
      if (e instanceof Error) return e.message;
      if (typeof e === "object" && e !== null) {
        const o = e as Record<string, unknown>;
        if (typeof o.message === "string") return o.message;
        if (typeof o.code === "number") return `Code ${o.code}`;
      }
      return String(e);
    }

    try {
      const eth = await getProvider();

      // EIP-7715 — try without signer field first (Flask infers connected account).
      // Permission type: try erc20-token-transfer, fall back to native-token-transfer.
      const candidates = [
        {
          // ERC-20 USDC spend cap
          type: "erc20-token-transfer",
          data: { address: USDC, allowance: `0x${BigInt(1_000_000).toString(16)}` },
        },
        {
          // Fallback: plain ETH cap (shows Flask dialog even if ERC-20 unsupported)
          type: "native-token-transfer",
          data: { allowance: `0x${BigInt(1_000_000).toString(16)}` },
        },
      ];

      let result: DelegationContext | null = null;
      let lastErr = "";

      for (const perm of candidates) {
        try {
          result = (await eth.request({
            method: "wallet_grantPermissions",
            params: [
              {
                expiry: Math.floor(Date.now() / 1000) + 86_400,
                permissions: [{ ...perm, required: true, policies: [] }],
              },
            ],
          })) as DelegationContext;
          break;
        } catch (e) {
          lastErr = extractError(e);
          // 4200 = method not supported, -32601 = method not found → try next
          const isUnsupported =
            lastErr.includes("not supported") ||
            lastErr.includes("not found") ||
            lastErr.includes("4200") ||
            lastErr.includes("32601");
          // User rejection (4001) → stop immediately, don't try next
          const isRejection = lastErr.includes("4001") || lastErr.toLowerCase().includes("reject") || lastErr.toLowerCase().includes("denied");
          if (isRejection || !isUnsupported) break;
        }
      }

      if (!result) {
        setDelegationError(lastErr || "wallet_grantPermissions returned no result");
        return false;
      }

      setDelegationContext(result);
      setHasDelegation(true);
      return true;
    } catch (e: unknown) {
      setDelegationError(extractError(e));
      setHasDelegation(false);
      return false;
    } finally {
      setIsRequestingDelegation(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, connectors]);

  // ERC-3009 TransferWithAuthorization — signs the actual x402 payment
  const signX402Payment = useCallback(
    async (accepts: PaymentRequirement[]): Promise<string> => {
      if (!address) throw new Error("Wallet not connected");
      const req = accepts[0];

      const nonce =
        "0x" +
        [...crypto.getRandomValues(new Uint8Array(32))]
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      const validBefore = String(Math.floor(Date.now() / 1000) + 3600);

      const eth = await getProvider();

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
          chainId: chain?.id ?? baseSepolia.id,
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

      const signature = (await eth.request({
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
          // Include delegation context if available (ERC-7710)
          ...(delegationContext ? { delegation: delegationContext.context } : {}),
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, chain, connectors, delegationContext]
  );

  return (
    <WalletContext.Provider
      value={{
        address: address ?? null,
        isConnecting: isPending,
        isConnected,
        isFlask,
        error,
        hasDelegation,
        delegationContext,
        delegationError,
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

export function WalletProvider({ children }: { children: ReactNode }) {
  return <WalletInner>{children}</WalletInner>;
}

export function useWallet() {
  return useContext(WalletContext);
}
