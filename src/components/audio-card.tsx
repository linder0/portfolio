"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ---------------------------------------------------------------------------
   AudioCard — sound work rendered as a proper card instead of the browser's
   default player chrome. Same surface language as the other media cards
   (raised background-200 well, rounded-xl): a play/pause button, the track
   label, elapsed/total time, and a hairline scrubber. Only one card plays
   at a time; starting one pauses the rest.
   ------------------------------------------------------------------------- */

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const whole = Math.floor(seconds);
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioCard({ src, label }: { src: string; label?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  // While the user drags the scrubber, the bar follows the pointer instead
  // of the (still advancing) playback position.
  const [scrubTo, setScrubTo] = useState<number | null>(null);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const seekFromPointer = useCallback((clientX: number) => {
    const audio = audioRef.current;
    const track = trackRef.current;
    if (!audio || !track || !Number.isFinite(audio.duration)) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    setScrubTo(ratio * audio.duration);
  }, []);

  useEffect(() => {
    if (scrubTo === null) return;
    const onMove = (e: PointerEvent) => seekFromPointer(e.clientX);
    const onUp = () => {
      const audio = audioRef.current;
      if (audio) audio.currentTime = scrubTo;
      setCurrent(scrubTo);
      setScrubTo(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [scrubTo, seekFromPointer]);

  const shown = scrubTo ?? current;
  const progress = duration > 0 ? Math.min(shown / duration, 1) : 0;

  return (
    <div className="rounded-xl bg-background-200 p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="link-glow flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground"
        >
          {playing ? (
            <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden>
              <rect x="0" y="0" width="3.5" height="12" fill="currentColor" />
              <rect x="6.5" y="0" width="3.5" height="12" fill="currentColor" />
            </svg>
          ) : (
            <svg
              width="11"
              height="12"
              viewBox="0 0 11 12"
              aria-hidden
              className="translate-x-px"
            >
              <path d="M0 0 L11 6 L0 12 Z" fill="currentColor" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            {label ? (
              <span className="label-eyebrow truncate">{label}</span>
            ) : (
              <span aria-hidden />
            )}
            <span className="mono-13 shrink-0 tabular-nums opacity-60">
              {formatTime(shown)} / {formatTime(duration)}
            </span>
          </div>

          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label={label ? `Seek ${label}` : "Seek"}
            aria-valuemin={0}
            aria-valuemax={Math.floor(duration)}
            aria-valuenow={Math.floor(shown)}
            aria-valuetext={formatTime(shown)}
            onPointerDown={(e) => {
              e.preventDefault();
              seekFromPointer(e.clientX);
            }}
            onKeyDown={(e) => {
              const audio = audioRef.current;
              if (!audio) return;
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const delta = e.key === "ArrowRight" ? 5 : -5;
                audio.currentTime = Math.min(
                  Math.max(audio.currentTime + delta, 0),
                  duration,
                );
              }
            }}
            // Generous hit area around a hairline-thin bar.
            className="group mt-2 flex h-4 cursor-pointer items-center"
          >
            <div className="relative h-0.5 w-full rounded-full bg-foreground/15">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          if (scrubTo === null) setCurrent(e.currentTarget.currentTime);
        }}
        onPlay={(e) => {
          setPlaying(true);
          // One voice at a time: starting this track pauses every other one.
          for (const other of document.querySelectorAll("audio")) {
            if (other !== e.currentTarget) other.pause();
          }
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
      />
    </div>
  );
}
