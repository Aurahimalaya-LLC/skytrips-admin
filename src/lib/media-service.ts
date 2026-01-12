import { supabase } from "@/lib/supabase";
import { mockMediaFiles } from "@/utils/mockMediaData";

export type MediaFile = {
  media_id: string;
  title: string;
  file_path: string;
  url?: string;
  mime_type: string;
  file_size: number;
  duration?: number;
  width?: number;
  height?: number;
  uploaded_by?: string;
  created_at: string;
  updated_at?: string;
  // Metadata fields
  tags?: string[];
  categories?: string[];
  alt_text?: string;
  caption?: string;
};

class MediaService {
  // Flag to force mock data usage if connection fails
  private useMockData = false;

  constructor() {
    // Initial check could be done here, but we'll do it lazily
  }

  async getFiles(filters: { search?: string; type?: string; category?: string } = {}): Promise<MediaFile[]> {
    if (this.useMockData) {
      return this.getMockFiles(filters);
    }

    try {
      // First try to fetch just the media to check if table exists and basic query works
      // This helps isolate if the issue is with the joins or the main table
      const { error: checkError } = await supabase
        .from("media")
        .select("media_id")
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      // If basic query works, try fetching with basic fields
      // Note: We are temporarily removing the joins to isolate the PGRST200 relationship error.
      // This allows the main media list to load even if tags/categories relationships are missing or misconfigured.
      
      let query = supabase
        .from("media")
        .select(`*`)
        .order("created_at", { ascending: false });

      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      if (filters.type && filters.type !== "all") {
        query = query.eq("mime_type", filters.type);
      }

      // Note: Filtering by related tables (tags/categories) in Supabase/PostgREST 
      // is complex with a single query. For now, we fetch and filter in memory 
      // if complex relations are needed, or rely on simple exact matches if structured differently.
      // Here we will fetch all and filter client-side for categories if needed, 
      // or assume the category is just a metadata field for now to keep it simple as per previous iteration.
      // However, with the new schema, we should handle the join.
      
      const { data, error } = await query;

      if (error) {
        if (error.code === "PGRST205" || error.code === "42P01") {
          console.warn("Media table not found, switching to mock data.");
          this.useMockData = true;
          return this.getMockFiles(filters);
        }
        throw error;
      }

      // Transform data to match MediaFile interface
      return (data || []).map((item: any) => ({
        ...item,
        // Helper to flatten tags/categories if they come back as arrays of objects
        tags: item.media_tags?.map((t: any) => t.tag_name) || [],
        categories: item.media_categories?.map((c: any) => c.category_name) || [],
        // Generate public URL if not stored (though we might store it or generate it on fly)
        url: item.url || supabase.storage.from("media").getPublicUrl(item.file_path).data.publicUrl
      }));

    } catch (error: any) {
      // Only log full error if it's not a known network/fetch issue to reduce noise
      if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
        console.warn("Supabase connection failed (likely network/adblocker), switching to mock data.");
      } else {
        console.error("Error fetching media files:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          original: error
        });
      }
      // Fallback to mock on any error for resilience during dev
      this.useMockData = true;
      return this.getMockFiles(filters);
    }
  }

  private getMockFiles(filters: { search?: string; type?: string; category?: string }): MediaFile[] {
    let filteredFiles = [...mockMediaFiles];

    if (filters.search) {
      filteredFiles = filteredFiles.filter((f) =>
        f.title.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.type && filters.type !== "all") {
       // Simple mime type matching for mock data
      filteredFiles = filteredFiles.filter((f) => f.mime_type?.startsWith(filters.type!) || (filters.type === "document" && f.mime_type === "application/pdf"));
    }

    if (filters.category && filters.category !== "all") {
      filteredFiles = filteredFiles.filter(
        (f) => f.categories && f.categories.includes(filters.category!)
      );
    }
    
    // Ensure mock data matches type
    return filteredFiles as unknown as MediaFile[];
  }

  async uploadFile(file: File): Promise<MediaFile | null> {
    // 1. Generate Hierarchical Path (YYYY/MM)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    
    // Sanitize filename to prevent issues
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileExt = sanitizedName.split(".").pop();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    // Format: YYYY/MM/timestamp_random_filename.ext
    const fileName = `${Date.now()}_${randomSuffix}.${fileExt}`;
    const filePath = `${year}/${month}/${fileName}`;

    try {
      const { error: storageError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      let publicUrl = "";

      if (storageError) {
        console.warn("Storage upload failed, using mock URL.", storageError);
        publicUrl = URL.createObjectURL(file); 
        if (!this.useMockData) {
             // If storage fails, fallback to mock logic if needed or just error out
        }
      } else {
        const { data } = supabase.storage.from("media").getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      }

      if (this.useMockData) {
        return this.createMockFile(file, filePath, publicUrl);
      }

      // 2. Insert into DB
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      const { data, error } = await supabase
        .from("media")
        .insert({
          title: file.name,
          file_path: filePath,
          mime_type: file.type,
          file_size: file.size,
          uploaded_by: userId,
        })
        .select()
        .single();

      if (error) {
        console.warn("DB Insert failed, switching to mock.", error);
        this.useMockData = true;
        return this.createMockFile(file, filePath, publicUrl);
      }

      return {
        ...data,
        url: publicUrl,
        tags: [],
        categories: []
      };

    } catch (error) {
      console.error("Upload process error:", error);
      return this.createMockFile(file, filePath, URL.createObjectURL(file));
    }
  }

  private createMockFile(file: File, filePath: string, url: string): MediaFile {
    return {
      media_id: Math.random().toString(36).substring(7),
      title: file.name,
      file_path: filePath,
      url: url,
      mime_type: file.type,
      file_size: file.size,
      created_at: new Date().toISOString(),
      categories: ["uncategorized"],
      tags: [],
    };
  }

  async updateFile(mediaId: string, updates: Partial<MediaFile>): Promise<MediaFile | null> {
    if (this.useMockData) {
      // Simulate update
      const mockFile = mockMediaFiles.find(f => f.media_id === mediaId);
      if (mockFile) {
        return { ...mockFile, ...updates } as MediaFile;
      }
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("media")
        .update({
          title: updates.title,
          // Handle new fields if schema supports them
          alt_text: updates.alt_text,
          caption: updates.caption
        })
        .eq("media_id", mediaId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Re-fetch full object or merge. Here we merge roughly.
      // Ideally we should refetch relations too if tags/categories changed.
      
      // Generate a cache-busting URL to ensure immediate preview updates
      const publicUrl = supabase.storage.from("media").getPublicUrl(data.file_path).data.publicUrl;
      const timestamp = new Date().getTime();
      const urlWithCacheBust = `${publicUrl}?t=${timestamp}`;

      return {
        ...data,
        tags: updates.tags || [],
        categories: updates.categories || [],
        // Ensure url is preserved or regenerated with cache buster
        url: updates.url || urlWithCacheBust
      };
    } catch (error) {
      console.error("Update error:", error);
      return null;
    }
  }

  async deleteFile(mediaId: string, filePath: string): Promise<boolean> {
    if (this.useMockData) return true;

    try {
      // Delete from Storage
      // filePath should be the full path stored in DB (e.g., 2024/02/file.png)
      // Supabase storage remove accepts array of paths
      const { error: storageError } = await supabase.storage.from("media").remove([filePath]);
      
      if (storageError) {
        console.error("Storage delete error:", storageError);
        // We continue to delete from DB even if storage delete fails to prevent phantom records,
        // unless it's a permission issue that suggests we shouldn't proceed.
      }

      // Delete from DB
      const { error: dbError } = await supabase.from("media").delete().eq("media_id", mediaId);
      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  }
}

export const mediaService = new MediaService();
