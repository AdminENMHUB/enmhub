import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

const MAX_MB = parseInt(process.env.UPLOAD_MAX_MB || '1000');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const albumId = formData.get('albumId') as string;
    const ownerId = formData.get('ownerId') as string;
    const isNsfw = formData.get('isNsfw') === 'true';

    if (!file || !albumId || !ownerId) {
      return NextResponse.json({ error: 'Missing file/albumId/ownerId' }, { status: 400 });
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File exceeds ${MAX_MB}MB` }, { status: 400 });
    }

    const mimeType = file.type;
    if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/')) {
      return NextResponse.json({ error: 'Only images/videos allowed' }, { status: 400 });
    }

    // Native UUID (no import needed)
    const uuid = crypto.randomUUID();
    const ext = file.name.split('.').pop();
    const fileName = `${uuid}.${ext}`;
    const storagePath = `media/${ownerId}/${albumId}/${fileName}`;

    // Upload to private bucket
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, file, { contentType: mimeType, upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Insert metadata
    const { error: metaError } = await supabase
      .from('album_media')
      .insert({
        album_id: albumId,
        owner_id: ownerId,
        storage_path: storagePath,
        mime_type: mimeType,
        is_nsfw: isNsfw ?? true  // Default NSFW
      });

    if (metaError) {
      // Cleanup
      await supabase.storage.from('media').remove([storagePath]);
      return NextResponse.json({ error: metaError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, path: storagePath });
  } catch (e) {
    console.error('Upload API error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}