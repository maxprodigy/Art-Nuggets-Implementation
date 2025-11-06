"use client";

import React from "react";
import { extractYouTubeVideoId } from "@/lib/utils";

interface YouTubeEmbedProps {
  videoUrl: string;
  className?: string;
}

export function YouTubeEmbed({ videoUrl, className }: YouTubeEmbedProps) {
  const videoId = extractYouTubeVideoId(videoUrl);

  if (!videoId) {
    return (
      <div
        className={`w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <p className="text-gray-500">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className={`w-full aspect-video ${className}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full rounded-lg"
      />
    </div>
  );
}
