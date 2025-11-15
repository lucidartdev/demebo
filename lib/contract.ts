import { ethers } from "ethers";
import abi from "../public/abi.json";

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export function getReadOnlyProvider() {
  if (process.env.NEXT_PUBLIC_RPC) {
    return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC);
  }
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return ethers.getDefaultProvider();
}

export function getReadOnlyContract(provider?: ethers.providers.Provider) {
  const p = provider || getReadOnlyProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, abi as any, p as any);
}

export function getContract(signer: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, abi as any, signer as any);
}
