"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { createWalletClient, custom, parseUnits } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { erc7715ProviderActions } from "@metamask/smart-accounts-kit/actions";
import { createx402DelegationProvider } from "@metamask/smart-accounts-kit/experimental";

const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`;

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
  delegationMethodUnsupported: boolean;
  isRequestingDelegation: boolean;
  connect: () => void;
  disconnect: () => void;
  requestDelegation: () => Promise<boolean>;
  signX402Payment: (accepts: PaymentRequirement[]) => Promise<string>;
  getDelegationPayment: (accepts: PaymentRequirement[]) => Promise<string>;
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
  delegationMethodUnsupported: false,
  isRequestingDelegation: false,
  connect: () => {},
  disconnect: () => {},
  requestDelegation: async () => false,
  signX402Payment: async () => "",
  getDelegationPayment: async () => "",
});

type EthProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

// Ephemeral session key — generated once per browser session, used as the delegate EOA
function getOrCreateSessionKey(): `0x${string}` {
  if (typeof window === "undefined") return generatePrivateKey();
  const stored = sessionStorage.getItem("axiom_session_pk");
  if (stored) return stored as `0x${string}`;
  const key = generatePrivateKey();
  sessionStorage.setItem("axiom_session_pk", key);
  return key;
}

function WalletInner({ children }: { children: ReactNode }) {
  const { address, isConnected, chain } = useAccount();
  const { connect: wagmiConnect, connectors, isPending } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const [error, setError] = useState<string | null>(null);
  const [hasDelegation, setHasDelegation] = useState(false);
  const [delegationContext, setDelegationContext] = useState<DelegationContext | null>(null);
  const [delegationError, setDelegationError] = useState<string | null>(null);
  const [delegationMethodUnsupported, setDelegationMethodUnsupported] = useState(false);
  const [isRequestingDelegation, setIsRequestingDelegation] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [delegationProvider, setDelegationProvider] = useState<((req: any) => Promise<any>) | null>(null);

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
    setDelegationMethodUnsupported(false);
    setDelegationProvider(null);
    setError(null);
  }, [wagmiDisconnect]);

  async function getProvider(): Promise<EthProvider> {
    const connector = getFlaskConnector();
    const connectorProvider = await connector?.getProvider?.().catch(() => null);
    if (connectorProvider) return connectorProvider as EthProvider;
    if (typeof window !== "undefined" && (window as unknown as { ethereum?: EthProvider }).ethereum) {
      return (window as unknown as { ethereum: EthProvider }).ethereum;
    }
    throw new Error("MetaMask Flask provider not available. Is Flask unlocked?");
  }

  function extractError(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === "object" && e !== null) {
      const o = e as Record<string, unknown>;
      if (typeof o.message === "string") return o.message;
      if (typeof o.code === "number") return `Code ${o.code}`;
    }
    return String(e);
  }

  // ERC-7715 via Smart Accounts Kit — requestExecutionPermissions + ERC-7710 delegation
  const requestDelegation = useCallback(async (): Promise<boolean> => {
    if (!address) return false;
    setIsRequestingDelegation(true);
    setDelegationError(null);
    setDelegationMethodUnsupported(false);

    try {
      const eth = await getProvider();

      // Ephemeral session EOA — this is the delegate that redeems the permission
      const sessionKey = getOrCreateSessionKey();
      const sessionAccount = privateKeyToAccount(sessionKey);

      // Extend wallet client with ERC-7715 provider actions (Smart Accounts Kit)
      const walletClient = createWalletClient({
        transport: custom(eth as Parameters<typeof custom>[0]),
        account: address as `0x${string}`,
        chain: baseSepolia,
      }).extend(erc7715ProviderActions());

      const currentTime = Math.floor(Date.now() / 1000);
      const expiry = currentTime + 60 * 60 * 24 * 30; // 30 days

      // Request ERC-20 periodic permission — 1 USDC per week budget for AI queries
      const grantedPermissions = await walletClient.requestExecutionPermissions([
        {
          chainId: baseSepolia.id,
          expiry,
          to: sessionAccount.address,
          permission: {
            type: "erc20-token-periodic" as const,
            data: {
              tokenAddress: USDC,
              periodAmount: parseUnits("1", 6), // 1 USDC per period
              periodDuration: 604800,           // 1 week in seconds
              startTime: currentTime,
              justification:
                "Axiom AI oracle — recurring USDC budget for pay-per-query Venice AI inference",
            },
            isAdjustmentAllowed: false,
          },
        },
      ]);

      if (!grantedPermissions || grantedPermissions.length === 0) {
        setDelegationError("No permissions were granted");
        return false;
      }

      const permission = grantedPermissions[0] as { context: string; expiry?: number; from?: string };

      // Build x402 ERC-7710 delegation provider using the granted permission context
      const provider = createx402DelegationProvider({
        account: sessionAccount,
        from: (permission.from ?? address) as `0x${string}`,
        parentPermissionContext: permission.context as `0x${string}`,
      });

      setDelegationProvider(() => provider);
      setDelegationContext({
        context: permission.context,
        expiry: permission.expiry ?? expiry,
      });
      setHasDelegation(true);
      return true;
    } catch (e: unknown) {
      const msg = extractError(e);
      const isMethodMissing =
        msg.toLowerCase().includes("not exist") ||
        msg.toLowerCase().includes("is not available") ||
        msg.toLowerCase().includes("requestexecutionpermissions") ||
        msg.includes("4200") ||
        msg.includes("32601");

      if (isMethodMissing) {
        setDelegationMethodUnsupported(true);
      } else {
        setDelegationError(msg);
      }
      setHasDelegation(false);
      return false;
    } finally {
      setIsRequestingDelegation(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, connectors]);

  // ERC-7710 delegation payment — used when delegation is active
  const getDelegationPayment = useCallback(
    async (accepts: PaymentRequirement[]): Promise<string> => {
      if (!delegationProvider) throw new Error("No active delegation. Grant a session first.");
      const req = accepts[0];

      const paymentReqs = {
        scheme: req.scheme,
        network: req.network,
        asset: req.asset,
        amount: req.maxAmountRequired,
        payTo: req.payTo,
        maxTimeoutSeconds: 60,
        extra: req.extra ?? {},
      };

      const payload = await delegationProvider(paymentReqs);

      return JSON.stringify({
        x402Version: 2,
        scheme: "exact",
        network: req.network,
        payload,
      });
    },
    [delegationProvider]
  );

  // ERC-3009 TransferWithAuthorization — fallback when no delegation
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
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, chain, connectors]
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
        delegationMethodUnsupported,
        isRequestingDelegation,
        connect,
        disconnect,
        requestDelegation,
        signX402Payment,
        getDelegationPayment,
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
