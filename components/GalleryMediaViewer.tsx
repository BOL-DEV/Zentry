"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  LuChevronLeft,
  LuChevronRight,
  LuVolume2,
  LuVolumeX,
  LuPlay,
  LuPause,
  LuImage,
} from "react-icons/lu";
import { FaHeart } from "react-icons/fa6";
import type { ApiGalleryMediaItem } from "@/helpers/type";

type Props = {
  media: ApiGalleryMediaItem[];
  altText: string;
  onDoubleTapHeart?: () => void;
};

export default function GalleryMediaViewer({ media, altText, onDoubleTapHeart }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lastTapRef = useRef<number>(0);

  const currentItem = media[currentIndex] || media[0];
  const isVideo = currentItem?.mediaType === "video" || /\.(mp4|webm|mov)$/i.test(currentItem?.url || "");

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < media.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const triggerHeartPop = () => {
    setShowHeartPop(true);
    if (onDoubleTapHeart) {
      onDoubleTapHeart();
    }
    setTimeout(() => {
      setShowHeartPop(false);
    }, 900);
  };

  const handleContainerClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      triggerHeartPop();
    } else {
      if (isVideo) {
        const vid = videoRefs.current[currentIndex];
        if (vid) {
          if (vid.paused) {
            void vid.play();
            setIsPlaying(true);
          } else {
            vid.pause();
            setIsPlaying(false);
          }
        }
      }
    }
    lastTapRef.current = now;
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRefs.current[currentIndex];
    if (vid) {
      vid.muted = !vid.muted;
      setIsMuted(vid.muted);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  useEffect(() => {
    // When slide changes, ensure video plays if playing state is true
    if (isVideo) {
      const vid = videoRefs.current[currentIndex];
      if (vid) {
        vid.muted = isMuted;
        if (isPlaying) {
          void vid.play().catch(() => { });
        }
      }
    }
  }, [currentIndex, isVideo, isMuted, isPlaying]);

  if (!media.length) {
    return (
      <div className="flex h-96 w-full items-center justify-center bg-slate-900 text-slate-500">
        <LuImage className="text-4xl" />
      </div>
    );
  }

  return (
    <div
      onClick={handleContainerClick}
      className="group relative aspect-square w-full select-none overflow-hidden bg-black cursor-pointer"
    >
      {/* Media carousel track */}
      <div
        className="flex h-full w-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {media.map((item, idx) => {
          const itemIsVideo = item.mediaType === "video" || /\.(mp4|webm|mov)$/i.test(item.url);
          const hasError = imageErrors[idx];

          return (
            <div key={idx} className="relative h-full w-full flex-shrink-0 bg-black">
              {itemIsVideo ? (
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el;
                  }}
                  src={item.url}
                  poster={item.thumbnailUrl || undefined}
                  loop
                  playsInline
                  autoPlay
                  muted={isMuted}
                  className="h-full w-full object-contain"
                />
              ) : !hasError ? (
                <Image
                  src={item.url}
                  alt={`${altText} (${idx + 1}/${media.length})`}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 650px"
                  className="object-cover"
                  onError={() => setImageErrors((prev) => ({ ...prev, [idx]: true }))}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-900 text-slate-500">
                  <LuImage className="text-4xl text-slate-600" />
                  <span className="text-xs">Image unavailable</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Instagram Heart Pop on Double-tap */}
      {showHeartPop && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <FaHeart className="animate-ping text-8xl text-rose-500 drop-shadow-2xl" />
        </div>
      )}

      {/* Navigation Arrows for multi-asset posts */}
      {media.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-md backdrop-blur-sm transition hover:bg-black/85"
            >
              <LuChevronLeft className="text-lg" />
            </button>
          )}
          {currentIndex < media.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white shadow-md backdrop-blur-sm transition hover:bg-black/85"
            >
              <LuChevronRight className="text-lg" />
            </button>
          )}

          {/* Dot Indicators */}
          <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {media.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${idx === currentIndex
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/50"
                  }`}
              />
            ))}
          </div>

          {/* Carousel Badge Count (Top Right) */}
          <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
            {currentIndex + 1}/{media.length}
          </div>
        </>
      )}

      {/* Video Audio Control */}
      {isVideo && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
          className="absolute bottom-3 right-3 rounded-full bg-black/70 p-2 text-white shadow-md backdrop-blur-sm transition hover:bg-black/90"
        >
          {isMuted ? <LuVolumeX className="text-base" /> : <LuVolume2 className="text-base" />}
        </button>
      )}

      {/* Video Pause indicator overlay on tap */}
      {isVideo && !isPlaying && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="rounded-full bg-black/60 p-4 text-white backdrop-blur-md">
            <LuPlay className="text-3xl ml-1" />
          </div>
        </div>
      )}
    </div>
  );
}

