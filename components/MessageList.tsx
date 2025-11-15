'use client';
import React, { useEffect, useState } from 'react';
import { getReadOnlyContract } from '../lib/contract';
import MessageItem from './MessageItem';
import { ethers } from 'ethers';

export default function MessageList({ provider, connectedAddress }: { provider?: ethers.BrowserProvider, connectedAddress?: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 10;

  useEffect(() => { loadMore(true); /* eslint-disable-next-line */ }, []);

  async function loadMore(reset = false) {
    setLoading(true);
    try {
      const contract = getReadOnlyContract();
      const nextOffset = reset ? 0 : offset;
      const res = await contract.getRecentMessages(nextOffset, LIMIT);
      // res is Message[] with most recent first
      const parsed = res.map((m: any) => ({
        id: Number(m.id.toString()),
        author: m.author,
        content: m.content,
        timestamp: Number(m.timestamp.toString()),
        deleted: m.deleted
      }));
      if (reset) {
        setMessages(parsed);
        setOffset(LIMIT);
      } else {
        setMessages(prev => [...prev, ...parsed]);
        setOffset(prev => prev + LIMIT);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setOffset(0);
    await loadMore(true);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Message Board</h3>
        <div className="flex gap-2">
          <button onClick={refresh} className="px-3 py-1 border rounded">Refresh</button>
        </div>
      </div>

      {messages.length === 0 && !loading ? <div className="text-sm text-gray-500">No messages yet</div> : null}

      <div className="space-y-2">
        {messages.map((m) => <MessageItem key={m.id} message={m} provider={provider} connectedAddress={connectedAddress} onUpdated={refresh} />)}
      </div>

      <div className="mt-3 flex justify-center">
        <button onClick={() => loadMore()} disabled={loading} className="px-4 py-2 border rounded">
          {loading ? 'Loading...' : 'Load more'}
        </button>
      </div>
    </div>
  );
}
