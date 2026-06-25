'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import { type MouseEvent, useCallback, useEffect, useRef, useState } from 'react';

import { MediaGalleryPlaceholder } from './MediaGalleryPlaceholder';

export type MediaGalleryVideoLabels = {
  play: string;
  pause: string;
  mute: string;
  unmute: string;
};

export type MediaGalleryVideoProps = {
  url: string;
  alt: string;
  posterUrl?: string;
  isActive: boolean;
  labels: MediaGalleryVideoLabels;
};

function PlayIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" fontSize="inherit">
      <path d="M8 5v14l11-7z" />
    </SvgIcon>
  );
}

function PauseIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" fontSize="inherit">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </SvgIcon>
  );
}

function VolumeUpIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" fontSize="inherit">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </SvgIcon>
  );
}

function VolumeOffIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" fontSize="inherit">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
    </SvgIcon>
  );
}

const CONTROL_FONT_SIZE = 'clamp(0.75rem, 5.5cqmin, 1rem)';
const CONTROL_BUTTON_SIZE = '2.25em';
const CONTROLS_BOTTOM_OFFSET = 'clamp(0.5rem, 14cqmin, 2.25rem)';

export function MediaGalleryVideo({ url, alt, posterUrl, isActive, labels }: MediaGalleryVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const showDefaultPoster = posterUrl == null && !hasPlayed;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isActive) {
      return;
    }

    video.pause();
    setIsPlaying(false);
  }, [isActive]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handlePlayClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      void togglePlay();
    },
    [togglePlay],
  );

  const handleMuteClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      toggleMute();
    },
    [toggleMute],
  );

  return (
    <Box
      role="group"
      aria-label={alt}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        containerType: 'size',
        bgcolor: showDefaultPoster ? 'action.hover' : 'common.black',
      }}
    >
      {showDefaultPoster ? (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <MediaGalleryPlaceholder />
        </Box>
      ) : null}

      <Box
        component="video"
        ref={videoRef}
        src={url}
        poster={posterUrl}
        playsInline
        muted={isMuted}
        loop
        preload="metadata"
        aria-hidden
        onPlay={() => {
          setHasPlayed(true);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: showDefaultPoster ? 0 : 1,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 45%)',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(2px, 1cqmin, 4px)',
            px: 'clamp(4px, 2cqmin, 8px)',
            pb: CONTROLS_BOTTOM_OFFSET,
            fontSize: CONTROL_FONT_SIZE,
            pointerEvents: 'auto',
          }}
        >
          <IconButton
            aria-label={isPlaying ? labels.pause : labels.play}
            onClick={handlePlayClick}
            sx={{
              width: CONTROL_BUTTON_SIZE,
              height: CONTROL_BUTTON_SIZE,
              fontSize: 'inherit',
              p: 0,
              color: 'common.white',
              bgcolor: 'rgba(0,0,0,0.35)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>

          <IconButton
            aria-label={isMuted ? labels.unmute : labels.mute}
            onClick={handleMuteClick}
            sx={{
              width: CONTROL_BUTTON_SIZE,
              height: CONTROL_BUTTON_SIZE,
              fontSize: 'inherit',
              p: 0,
              color: 'common.white',
              bgcolor: 'rgba(0,0,0,0.35)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' },
            }}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
