import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

export async function GET() {
  try {
    if (!env.supabase.serviceRoleKey) {
      return NextResponse.json(
        { error: "Service role key missing. Cannot perform admin operations." },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      env.supabase.url,
      env.supabase.serviceRoleKey
    );

    // 1. Create 'media' bucket
    const { data: bucket, error: bucketError } = await supabaseAdmin.storage.createBucket('media', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/*', 'application/pdf', 'video/*']
    });

    if (bucketError) {
      // If error is "Bucket already exists", that's fine.
      if (!bucketError.message.includes("already exists")) {
        console.error("Bucket creation error:", bucketError);
        return NextResponse.json({ error: bucketError.message }, { status: 500 });
      }
    }

    // 2. Ensure RLS policies are set (This is harder to do via JS client, usually requires SQL)
    // However, creating the bucket is the main missing piece for the "Bucket not found" error.
    
    // We can try to list buckets to verify
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const mediaBucket = buckets?.find(b => b.name === 'media');

    return NextResponse.json({ 
      success: true, 
      message: "Media bucket setup completed successfully.",
      bucket: mediaBucket 
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
