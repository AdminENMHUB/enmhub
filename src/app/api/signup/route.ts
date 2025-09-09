import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;  // Bypasses RLS for admin insert

const supabase = createClient(supabaseUrl, serviceKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, username, age, preferences, location } = body;

    if (!userId || !email || !username || age < 18) {
      return NextResponse.json({ error: 'Invalid input or under 18' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')  // Or 'users' if your table is named that
      .insert({
        id: userId,
        email,
        username,
        age: Math.floor(age),  // Ensure int
        preferences: preferences || { vibe: 'chill' },
        location: location || { lat: 0, lng: 0 },
        verified: false,  // Admin verifies later
        premium: false
      });

    if (error) {
      console.error('Profile insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true, userId } });
  } catch (e) {
    console.error('Signup API error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}