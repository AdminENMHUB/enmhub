'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';  // Your client

interface User { /* From your interface */ }

export default function Matching({ currentUser, potentialMatches }: { currentUser: User; potentialMatches: User[] }) {
  const [aiMatches, setAiMatches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const isPremium = currentUser.premium || false;
  const limit = isPremium ? 20 : 5;

  useEffect(() => {
    const scoreMatches = async () => {
      setLoading(true);
      const scored = await Promise.all(potentialMatches.slice(0, limit).map(async (match) => {
        const prompt = `Score compatibility (0-100) for ENM user A (age ${currentUser.age}, interests: ${JSON.stringify(currentUser.interests || [])}, boundaries: ${JSON.stringify(currentUser.boundaries || {})}) and B (age ${match.age}, interests: ${JSON.stringify(match.interests || [])}, boundaries: ${JSON.stringify(match.boundaries || {})}). Factor attractiveness (assume 50 base +10 for similar prefs), privacy match. Output JSON: {"score": number, "reason": string}`;
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] })
        });
        const data = await res.json();
        const score = JSON.parse(data.choices[0].message.content || '{}').score || 0;
        return { ...match, aiScore: score };
      }));
      setAiMatches(scored.sort((a, b) => b.aiScore - a.aiScore));
      setLoading(false);
    };
    scoreMatches();
  }, [currentUser, potentialMatches]);

  if (loading) return <div className="text-center p-4">AI Matching...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">  {/* Responsive */}
      {aiMatches.map((match) => (
        <div key={match.id} className="p-4 border rounded bg-white shadow">
          <h3 className="font-bold">{match.username}</h3>
          <p>Score: {match.aiScore}/100</p>
          <p>Age: {match.age}</p>
          <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs">Connect</button>
        </div>
      ))}
    </div>
  );
}