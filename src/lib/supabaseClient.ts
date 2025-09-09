'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';  // Fixed path/export

// Extended User interface for ENM (includes missing props)
interface User {
  id: string;
  email: string;
  username: string;
  age: number;
  verified: boolean;
  premium: boolean;  // Fixed: Added
  interests?: string[];  // Fixed: Added array
  boundaries?: { [key: string]: string[] };  // Fixed: Added object (e.g., {'soft_no': ['anal']})
  profile_photo?: string;
  aiScore?: number;  // Fixed: Added for matching
  // ... other fields from baseline
}

interface Props {
  currentUser: User;
  potentialMatches: User[];
}

export default function Matching({ currentUser, potentialMatches }: Props) {
  const [aiMatches, setAiMatches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const isPremium = currentUser.premium || false;  // Fixed: Now exists
  const limit = isPremium ? 20 : 5;

  useEffect(() => {
    const scoreMatches = async () => {
      setLoading(true);
      const openaiKey = process.env.OPENAI_API_KEY!;  // Your key
      const scored = await Promise.all(potentialMatches.slice(0, limit).map(async (match) => {
        const prompt = `Score compatibility (0-100) for ENM user A (age ${currentUser.age}, interests: ${JSON.stringify(currentUser.interests || [])}, boundaries: ${JSON.stringify(currentUser.boundaries || {})}) and B (age ${match.age}, interests: ${JSON.stringify(match.interests || [])}, boundaries: ${JSON.stringify(match.boundaries || {})}). Factor attractiveness (50 base +10 similar prefs), privacy. Output JSON: {"score": number, "reason": string}`;
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] })
        });
        if (!res.ok) throw new Error('OpenAI error');
        const data = await res.json();
        const content = data.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        const score = parsed.score || 0;
        return { ...match, aiScore: score };  // Fixed: Now types match
      }));
      setAiMatches(scored.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0)));
      setLoading(false);
    };
    scoreMatches().catch(console.error);
  }, [currentUser, potentialMatches]);

  if (loading) return <div className="text-center p-4 md:p-6">AI Matching... (Privacy-First)</div>;  // Responsive padding

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4">  {/* Fixed: Responsive Tailwind */}
      {aiMatches.map((match) => (
        <div key={match.id} className="p-4 border rounded bg-white shadow flex flex-col">  {/* Fixed: id exists */}
          <h3 className="font-bold">{match.username}</h3>  {/* Fixed: username exists */}
          <p>Score: {match.aiScore}/100</p>  {/* Fixed: aiScore exists */}
          <p>Age: {match.age}</p>  {/* Fixed: age exists */}
          <button className="mt-auto px-3 py-1 bg-blue-500 text-white rounded text-xs w-full">Connect</button>  {/* Mobile full-width */}
        </div>
      ))}
    </div>
  );
}