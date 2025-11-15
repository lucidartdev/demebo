'use client';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function ConnectWallet({ onConnect }: { onConnect?: (provider: ethers.BrowserProvider) => void }) {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    ethereum.on?.('accountsChanged', (accounts: string[]) => {
      setAccount(accounts[0] || null);
    });
  }, []);

  async function connect() {
    if (!(window as any).ethereum) return alert('Install MetaMask');
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const addr = await signer.getAddress();
    setAccount(addr);
    onConnect?.(provider);
  }

  if (account) {
    return <div className="px-3 py-2 rounded border">Connected: {account.substring(0,6)}...{account.substring(account.length-4)}</div>;
  }
  return <button onClick={connect} className="px-4 py-2 rounded bg-sky-600 text-white">Connect Wallet</button>;
}
