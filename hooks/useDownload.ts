import { useState, useEffect, useCallback } from 'react';
import {
  addDownload,
  getDownload,
  deleteDownload,
  getAllDownloads,
  updateProgress,
} from '@/lib/db';

export function useDownload() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [downloading, setDownloading] = useState<
    Set<string>
  >(new Set());
  const [progress, setProgress] = useState<
    Map<string, number>
  >(new Map());

  // --- Helper: Map types to MIME types ---
  const getMimeType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'video':
        return 'video/mp4';
      case 'article':
      case 'blog':
        return 'text/html';
      default:
        return 'application/octet-stream';
    }
  };

  // Load all downloads
  const loadDownloads = useCallback(async () => {
    const allDownloads = await getAllDownloads();
    setDownloads(allDownloads);
  }, []);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  // Check if resource is downloaded
  const isDownloaded = useCallback(
    (id: string) => {
      return downloads.some((d) => d.id === id);
    },
    [downloads]
  );

  // Download a resource
  const downloadResource = useCallback(
    async (resource: any) => {
      const { id, title, creator, type, resource_url } =
        resource;

      try {
        setDownloading((prev) => new Set(prev).add(id));
        setProgress((prev) => new Map(prev).set(id, 0));

        await updateProgress(id, {
          id,
          progress: 0,
          status: 'downloading',
        });

        // Fetch the resource
        const response = await fetch(resource_url);
        if (!response.ok)
          throw new Error('Download failed');

        const contentLength = response.headers.get(
          'content-length'
        );
        const total = contentLength
          ? parseInt(contentLength, 10)
          : 0;

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const chunks: Uint8Array[] = [];
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedLength += value.length;

          if (total > 0) {
            const percent = (receivedLength / total) * 100;
            setProgress((prev) =>
              new Map(prev).set(id, percent)
            );
            await updateProgress(id, {
              id,
              progress: percent,
              status: 'downloading',
            });
          }
        }

        // Combine chunks
        // FIX 1: Add type here just in case, though the real fix is in getOfflineUrl
        const mimeType = getMimeType(type);
        const blob = new Blob(chunks as BlobPart[], {
          type: mimeType,
        });
        const cacheKey = `offline-resource-${id}`;

        // Store in Cache API
        const cache = await caches.open(
          'offline-resources'
        );

        // FIX 2: Store with Content-Type header
        const blobResponse = new Response(blob, {
          headers: { 'Content-Type': mimeType },
        });
        await cache.put(cacheKey, blobResponse);

        // Store metadata in IndexedDB
        await addDownload({
          id,
          title,
          creator,
          type,
          downloadedAt: Date.now(),
          size: receivedLength,
          url: resource_url,
          cacheKey,
          metadata: resource,
        });

        await updateProgress(id, {
          id,
          progress: 100,
          status: 'completed',
        });

        setDownloading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        setProgress((prev) => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });

        await loadDownloads();
      } catch (error) {
        console.error('Download error:', error);
        await updateProgress(id, {
          id,
          progress: 0,
          status: 'failed',
          error:
            error instanceof Error
              ? error.message
              : 'Unknown error',
        });
        setDownloading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    },
    [loadDownloads]
  );

  // Delete a download
  const removeDownload = useCallback(
    async (id: string) => {
      const download = await getDownload(id);
      if (download) {
        // Remove from cache
        const cache = await caches.open(
          'offline-resources'
        );
        await cache.delete(download.cacheKey);

        // Remove from IndexedDB
        await deleteDownload(id);
        await loadDownloads();
      }
    },
    [loadDownloads]
  );

  // Get offline resource URL
  const getOfflineUrl = useCallback(async (id: string) => {
    const download = await getDownload(id);
    if (!download) return null;

    const cache = await caches.open('offline-resources');
    const response = await cache.match(download.cacheKey);
    if (!response) return null;

    const blob = await response.blob();

    // FIX 3 (CRITICAL): Force the Blob to have the correct MIME type based on metadata
    // This ensures the browser treats it as a PDF/Video instead of text
    const correctType = getMimeType(download.type);
    const typedBlob = new Blob([blob], {
      type: correctType,
    });

    return URL.createObjectURL(typedBlob);
  }, []);

  return {
    downloads,
    downloading,
    progress,
    isDownloaded,
    downloadResource,
    removeDownload,
    getOfflineUrl,
  };
}
