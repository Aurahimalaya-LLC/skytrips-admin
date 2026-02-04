import { NextRequest, NextResponse } from 'next/server';
import { parsePNR } from '@/lib/services/pnr-parser';
import { generateTicketPreview } from '@/lib/services/image-generator';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export const maxDuration = 60; // Allow longer timeout for AI processing

export async function POST(req: NextRequest) {
    try {
        const { pnrText } = await req.json();

        if (!pnrText) {
            return NextResponse.json(
                { success: false, error: "PNR text is required" }, 
                { status: 400 }
            );
        }

        // 1. Parse PNR (AI)
        const parsedData = await parsePNR(pnrText);

        // 2. Generate Preview Image (PNG Buffer)
        const pngBuffer = await generateTicketPreview(parsedData);
        
        // 3. Upload to Supabase Storage (Using Service Role to bypass RLS)
        // We use a direct Supabase client here instead of the SSR client because
        // we want to ensure the upload succeeds regardless of the user's session state
        // for this system-generated asset.
        const supabaseAdmin = createClient(
            env.supabase.url,
            env.supabase.serviceRoleKey || env.supabase.anonKey
        );
        
        // Create a unique filename
        const filename = `${parsedData.pnr_number}-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('pnr-previews')
            .upload(filename, pngBuffer, {
                contentType: 'image/png',
                upsert: true,
                cacheControl: '3600',
                duplex: 'half'
            });

        if (uploadError) {
            console.error("Storage Upload Error:", uploadError);
            throw new Error(`Failed to upload preview image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('pnr-previews')
            .getPublicUrl(filename);

        return NextResponse.json({
            success: true,
            data: parsedData,
            previewUrl: publicUrl,
        });

    } catch (error: unknown) {
        console.error("PNR Processing Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
