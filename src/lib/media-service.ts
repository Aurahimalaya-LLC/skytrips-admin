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

  async getFiles(
    filters: { search?: string; type?: string; category?: string } = {}
  ): Promise<MediaFile[]> {
    if (this.useMockData) {
      return this.getMockFiles(filters);
    }

    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.category) queryParams.append("category", filters.category);

      const response = await fetch(`/api/media?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform data to match MediaFile interface
      return (data || []).map((item: any) => ({
        ...item,
        // Helper to flatten tags/categories if they come back as arrays of objects
        tags: item.media_tags?.map((t: any) => t.tag_name) || [],
        categories:
          item.media_categories?.map((c: any) => c.category_name) || [],
      }));
    } catch (error: any) {
      // Only log full error if it's not a known network/fetch issue to reduce noise
      if (
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("NetworkError")
      ) {
        console.warn(
          "Supabase connection failed (likely network/adblocker), switching to mock data."
        );
      } else {
        console.error("Error fetching media files:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          original: error,
        });
      }
      // Fallback to mock on any error for resilience during dev
      this.useMockData = true;
      return this.getMockFiles(filters);
    }
  }

  private getMockFiles(filters: {
    search?: string;
    type?: string;
    category?: string;
  }): MediaFile[] {
    let filteredFiles = [...mockMediaFiles];

    if (filters.search) {
      filteredFiles = filteredFiles.filter((f) =>
        f.title.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.type && filters.type !== "all") {
      // Simple mime type matching for mock data
      filteredFiles = filteredFiles.filter(
        (f) =>
          f.mime_type?.startsWith(filters.type!) ||
          (filters.type === "document" && f.mime_type === "application/pdf")
      );
    }

    if (filters.category && filters.category !== "all") {
      filteredFiles = filteredFiles.filter(
        (f) => f.categories && f.categories.includes(filters.category!)
      );
    }

    // Ensure mock data matches type
    return filteredFiles as unknown as MediaFile[];
  }

  private getImageDimensions(
    file: File
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
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
      // 1. Upload to Storage via API (Server-side to bypass RLS)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", filePath);

      const uploadResponse = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Storage upload failed");
      }
      
      const { data } = supabase.storage.from("media").getPublicUrl(filePath);
      let publicUrl = data.publicUrl;

      // ... rest of the code is not needed, just the variable assignment
      
      if (this.useMockData) {
        return this.createMockFile(file, filePath, publicUrl);
      }

      // 2. Insert into DB (via API to bypass RLS)
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      // Extract metadata if possible (simple client-side extraction)
      let width = null;
      let height = null;

      if (file.type.startsWith("image/")) {
        try {
          const dimensions = await this.getImageDimensions(file);
          width = dimensions.width;
          height = dimensions.height;
        } catch (e) {
          console.warn("Failed to extract image dimensions", e);
        }
      }

      const response = await fetch("/api/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: file.name,
          file_path: filePath,
          mime_type: file.type,
          file_size: file.size,
          uploaded_by: userId,
          width: width,
          height: height,
          duration: null, // Could extract video duration similarly if needed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "DB Insert failed");
      }

      const apiResponseData = await response.json();

      return {
        ...apiResponseData,
        tags: [],
        categories: [],
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

  async updateFile(
    mediaId: string,
    updates: Partial<MediaFile>
  ): Promise<MediaFile | null> {
    if (this.useMockData) {
      // Simulate update
      const mockFile = mockMediaFiles.find((f) => f.media_id === mediaId);
      if (mockFile) {
        return { ...mockFile, ...updates } as MediaFile;
      }
      return null;
    }

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update file");
      }

      const data = await response.json();

      // Generate a cache-busting URL to ensure immediate preview updates
      const publicUrl = supabase.storage
        .from("media")
        .getPublicUrl(data.file_path).data.publicUrl;
      const timestamp = new Date().getTime();
      const urlWithCacheBust = `${publicUrl}?t=${timestamp}`;

      return {
        ...data,
        tags: updates.tags || [],
        categories: updates.categories || [],
        // Ensure url is preserved or regenerated with cache buster
        url: updates.url || urlWithCacheBust,
      };
    } catch (error) {
      console.error("Update error:", error);
      return null;
    }
  }

  async deleteFile(mediaId: string, filePath: string): Promise<boolean> {
    if (this.useMockData) return true;

    try {
      // Use API to delete
      const response = await fetch(
        `/api/media/${mediaId}?path=${encodeURIComponent(filePath)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      return true;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  }
}

export const mediaService = new MediaService();
