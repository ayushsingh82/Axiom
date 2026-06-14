import type { Metadata } from "next";
import { Geist_Mono, Syne } from "next/font/google";
import "./globals.css";
import Web3Provider from "./components/Web3Provider";
import { WalletProvider } from "./components/WalletProvider";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Axiom",
  description: "Permissionless on-chain AI inference — pay per query via x402, powered by Venice AI, settled by 1Shot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black">
        <Web3Provider>
          <WalletProvider>{children}</WalletProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
