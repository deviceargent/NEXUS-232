import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@nexus/ui';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Bookmark,
  Clock,
  Tv
} from 'lucide-react';

export interface IMediaPlayerAdapter {
  open(uri: string): void;
  play(): void;
  pause(): void;
  seek(timeSeconds: number): void;
  stop(): void;
  getPosition(): number;
  getDuration(): number;
}

export const MediaPlayer: React.FC<{
  uri: string;
  title: string;
  initialSeek?: number;
  anchors?: Array<{ id: string; label: string; timestampSeconds: number }>;
}> = ({ uri, title, initialSeek = 0, anchors = [] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (initialSeek > 0 && videoRef.current) {
      videoRef.current.currentTime = initialSeek;
      setCurrentTime(initialSeek);
    }
  }, [initialSeek]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#080b0f] rounded border border-[var(--nexus-border)] overflow-hidden font-mono text-xs select-none">
      {/* Player Header */}
      <div className="p-2 border-b border-[var(--nexus-border)] bg-[var(--nexus-surface)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-[var(--nexus-text)] truncate">{title}</span>
        </div>
        <span className="text-[10px] text-[var(--nexus-text-dim)] bg-[var(--nexus-surface-2)] px-1.5 py-0.5 rounded border border-[var(--nexus-border)]">
          libmpv / HTML5 Adapter
        </span>
      </div>

      {/* Video Viewport / Simulation Screen */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        <video
          ref={videoRef}
          src={uri}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
              setDuration(videoRef.current.duration || 120);
            }
          }}
          className="w-full h-full object-contain"
        />

        {/* Fallback Graphic Simulation when sample video URI is local */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
          <div className="w-32 h-32 rounded-full border border-sky-500/50 flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 rounded-full border border-cyan-400/80" />
          </div>
          <span className="mt-3 text-[11px] text-sky-400 font-mono tracking-widest">
            SIMULATION STREAM @ {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Anchors Timeline Bar */}
      {anchors.length > 0 && (
        <div className="px-3 py-1.5 bg-[var(--nexus-surface-2)] border-t border-[var(--nexus-border)] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Bookmark className="w-3 h-3 text-[var(--nexus-accent)] flex-shrink-0" />
          <span className="text-[10px] text-[var(--nexus-text-dim)] uppercase flex-shrink-0">Anchors:</span>
          {anchors.map((anchor) => (
            <button
              key={anchor.id}
              onClick={() => handleSeek(anchor.timestampSeconds)}
              className="text-[10px] px-2 py-0.5 rounded bg-[var(--nexus-surface)] border border-[var(--nexus-border)] hover:border-[var(--nexus-accent)] text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer whitespace-nowrap transition-all"
            >
              <Clock className="w-2.5 h-2.5" />
              <span>{anchor.label} ({formatTime(anchor.timestampSeconds)})</span>
            </button>
          ))}
        </div>
      )}

      {/* Control Bar */}
      <div className="p-2 border-t border-[var(--nexus-border)] bg-[var(--nexus-surface)] flex items-center gap-3">
        <Button size="icon" variant="primary" onClick={togglePlay}>
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </Button>

        {/* Scrubber */}
        <input
          type="range"
          min={0}
          max={duration || 120}
          value={currentTime}
          onChange={(e) => handleSeek(parseFloat(e.target.value))}
          className="flex-1 accent-[var(--nexus-accent)] cursor-pointer h-1.5 rounded bg-[var(--nexus-surface-2)]"
        />

        {/* Time display */}
        <span className="text-[10px] text-[var(--nexus-text-muted)] w-20 text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
            }
          }}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
};
