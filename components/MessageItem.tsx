'use client';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../lib/contract';

export default function MessageItem({ message, provider, connectedAddress, onUpdated }: { message: any, provider?: ethers.BrowserProvider, connectedAddress?: string, onUpdated?: () => void }) {
  const [editing, setEditing] = useState(false);
  const [newContent, setNewContent] = useState(message.content);
  const [loading, setLoading] = useState(false);
  const isAuthor = connectedAddress && connectedAddress.toLowerCase() === message.author.toLowerCase();

  async function saveEdit() {
    if (!provider) return alert('Connect wallet');
    if (newContent.trim().length === 0) return alert('Empty');
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.editMessage(message.id, newContent);
      await tx.wait();
      setEditing(false);
      onUpdated?.();
    } catch (err:any) {
      console.error(err);
      alert(err?.message || 'Edit failed');
    } finally { setLoading(false); }
  }

  async function remove() {
    if (!provider) return alert('Connect wallet');
    if (!confirm('Delete this message?')) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.deleteMessage(message.id);
      await tx.wait();
      onUpdated?.();
    } catch (err:any) {
      console.error(err);
      alert(err?.message || 'Delete failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="p-3 border rounded bg-white">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-mono">{message.author}</div>
          <div className="text-xs text-gray-500">{new Date(message.timestamp * 1000).toLocaleString()}</div>
        </div>
        <div className="text-sm font-semibold">{message.deleted ? 'Deleted' : ''}</div>
      </div>

      <div className="mt-2">
        {editing ? (
          <div>
            <textarea className="w-full p-2 border rounded" value={newContent} onChange={(e) => setNewContent(e.target.value)} />
            <div className="flex gap-2 mt-2">
              <button onClick={saveEdit} disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
              <button onClick={() => setEditing(false)} className="px-3 py-1 border rounded">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{message.deleted ? <em className="text-gray-400">[deleted]</em> : message.content}</div>
        )}
      </div>

      {isAuthor && !message.deleted && !editing && (
        <div className="mt-2 flex gap-2">
          <button onClick={() => setEditing(true)} className="px-3 py-1 border rounded">Edit</button>
          <button onClick={remove} className="px-3 py-1 border rounded text-red-600">Delete</button>
        </div>
      )}
    </div>
  );
}
