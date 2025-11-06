import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Regular expressions for different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate YouTube thumbnail URL from video ID or URL
 * @param videoIdOrUrl - YouTube video ID or full YouTube URL
 * @param quality - Thumbnail quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault'
 * @returns YouTube thumbnail URL or null if video ID cannot be extracted
 */
export function getYouTubeThumbnail(
  videoIdOrUrl: string,
  quality:
    | "default"
    | "mqdefault"
    | "hqdefault"
    | "sddefault"
    | "maxresdefault" = "hqdefault"
): string | null {
  if (!videoIdOrUrl) return null;

  // Try to extract video ID if a full URL is provided
  let videoId = videoIdOrUrl;
  if (
    videoIdOrUrl.includes("youtube.com") ||
    videoIdOrUrl.includes("youtu.be")
  ) {
    const extracted = extractYouTubeVideoId(videoIdOrUrl);
    if (!extracted) return null;
    videoId = extracted;
  }

  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}
