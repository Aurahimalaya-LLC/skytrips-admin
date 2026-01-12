"use client";

import { MediaThumbnail } from "@/components/media/MediaThumbnail";
import { MediaFile } from "@/lib/media-service";

const mockFiles: MediaFile[] = [
  {
    media_id: "1",
    title: "Valid Image",
    file_path: "path/to/image.jpg",
    url: "https://via.placeholder.com/300",
    mime_type: "image/jpeg",
    file_size: 1024,
    created_at: new Date().toISOString(),
  },
  {
    media_id: "2",
    title: "Broken Image",
    file_path: "path/to/broken.jpg",
    url: "https://invalid-url.com/broken.jpg",
    mime_type: "image/jpeg",
    file_size: 1024,
    created_at: new Date().toISOString(),
  },
  {
    media_id: "3",
    title: "Video File",
    file_path: "path/to/video.mp4",
    mime_type: "video/mp4",
    file_size: 1024 * 1024,
    created_at: new Date().toISOString(),
  },
  {
    media_id: "4",
    title: "PDF Document",
    file_path: "path/to/doc.pdf",
    mime_type: "application/pdf",
    file_size: 1024 * 50,
    created_at: new Date().toISOString(),
  },
];

export default function MediaTestPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Media Preview Component Tests</h1>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Thumbnails (Grid View)</h2>
        <div className="grid grid-cols-4 gap-4">
          {mockFiles.map((file) => (
            <div key={file.media_id} className="space-y-2">
              <div className="aspect-square border rounded-lg overflow-hidden relative">
                <MediaThumbnail file={file} objectFit="cover" />
              </div>
              <p className="text-sm font-medium">{file.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Modal Preview (Contain)</h2>
        <div className="grid grid-cols-2 gap-4">
          {mockFiles.map((file) => (
            <div key={file.media_id} className="space-y-2">
              <div className="h-64 border rounded-lg overflow-hidden relative bg-slate-900">
                <MediaThumbnail file={file} objectFit="contain" />
              </div>
              <p className="text-sm font-medium">{file.title}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
