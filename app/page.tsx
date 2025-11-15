'use client';
import React, { useState } from 'react';
import ConnectWallet from '../components/ConnectWallet';
import PostForm from '../components/PostForm';
import MessageList from '../components/MessageList';
import { ethers } from 'ethers';

export default function HomePage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | undefined>();
  const [connectedAddress, setConnectedAddress] = useState<string | undefined>();

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Decentralized Message Board</h1>
        <ConnectWallet onConnect={(p) => { setProvider(p); (async()=>{ try{ const s = await p.getSigner(); const a = await s.getAddress(); setConnectedAddress(a);}catch{setConnectedAddress(undefined);} })(); }} />
      </header>

      <main className="space-y-6">
        <PostForm provider={provider} onPosted={() => { /* optionally refresh list via event or global state */ }} />
        <MessageList provider={provider} connectedAddress={connectedAddress} />
      </main>
    </div>
  );
}
