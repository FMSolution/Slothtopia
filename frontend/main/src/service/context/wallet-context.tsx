import { createContext } from "react";

export interface IWalletContext {
  walletAddress: string;
}

export const WalletContext = createContext<IWalletContext>({
  walletAddress: "",
});