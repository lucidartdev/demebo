'use client';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../lib/contract';

export default function PostForm({ provider, onPosted }: { provider?: ethers.BrowserProvider, onPosted?: () => void }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function post() {
    if (!provider) return alert('Connect wallet');
    if (message.trim().length === 0) return alert('Message empty');
    if (message.length > 280) return alert('Message too long');

    try {
      setLoading(true);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.postMessage(message);
      await tx.wait();
      setMessage('');
      onPosted?.();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Post failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded bg-white">
      <textarea className="w-full p-2 border rounded" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Write your message (max 280 chars)" />
      <div className="flex justify-between items-center mt-2">
        <div className="text-sm text-gray-500">{message.length}/280</div>
        <button onClick={post} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Posting...' : 'Post'}</button>
      </div>
    </div>
  );
}
