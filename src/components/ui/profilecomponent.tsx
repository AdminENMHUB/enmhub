'use client';
import { useState } from 'react';

// Use extended User from above (import if shared)
interface User {
  id: string;
  username: string;
  age: number;
  interests: string[];
  // ... etc.
}

interface Props {
  user: User;  // Current user
  targetUserId: string;  // Fixed: Prop for report/block target
}

export default function ProfileComponent({ user, targetUserId }: Props) {
  const [reason, setReason] = useState('');

  const handleReport = async () => {
    if (!reason) return alert('Add reason');
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'user', targetId: targetUserId, reason })  // Fixed: userId now prop
    });
    if (res.ok) alert('Reported (Troll Filtered)'); else alert('Error');
  };

  const handleBlock = async () => {
    const res = await fetch('/api/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedId: targetUserId })  // Fixed: userId now prop
    });
    if (res.ok) alert('Blocked (Privacy Protected)'); else alert('Error');
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 bg-white rounded shadow md:max-w-lg">  {/* Responsive */}
      <h2 className="text-xl font-bold">Profile Actions for {user.username} (18+ Verified)</h2>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Report reason (e.g., troll, boundary violation)"
        className="w-full p-2 border rounded"
      />
      <div className="flex flex-col sm:flex-row gap-2">  {/* Mobile stack */}
        <button onClick={handleReport} className="px-4 py-2 bg-red-500 text-white rounded text-sm w-full sm:w-auto">
          Report
        </button>
        <button onClick={handleBlock} className="px-4 py-2 bg-gray-500 text-white rounded text-sm w-full sm:w-auto">
          Block
        </button>
      </div>
    </div>
  );
}