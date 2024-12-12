import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';

interface MediaPlayerProps {
  url: string;
  type: 'video' | 'audio';
  fileName: string;
}

export function MediaPlayer({ url, type, fileName }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMouseMoving, setIsMouseMoving] = useState(true);
  const [subtitleTracks, setSubtitleTracks] = useState<TextTrack[]>([]);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState<number>(-1);
  const mouseTimeoutRef = useRef<NodeJS.Timeout>();
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => setCurrentTime(media.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(media.duration);
      // Check for embedded subtitle tracks
      if ('textTracks' in media) {
        const tracks = Array.from(media.textTracks);
        setSubtitleTracks(tracks);
        console.log('Available subtitle tracks:', tracks);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsMouseMoving(true);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
      mouseTimeoutRef.current = setTimeout(() => {
        setIsMouseMoving(false);
      }, 3000); // Hide after 3 seconds of no movement
    };

    const playerElement = playerRef.current;
    if (playerElement) {
      playerElement.addEventListener('mousemove', handleMouseMove);
      playerElement.addEventListener('mouseenter', handleMouseMove);
    }

    return () => {
      if (playerElement) {
        playerElement.removeEventListener('mousemove', handleMouseMove);
        playerElement.removeEventListener('mouseenter', handleMouseMove);
      }
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mediaRef.current) return;
    const time = parseFloat(e.target.value);
    mediaRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mediaRef.current) return;
    const value = parseFloat(e.target.value);
    mediaRef.current.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    if (isMuted) {
      mediaRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      mediaRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    if (!playerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await playerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const handleSubtitleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !mediaRef.current) return;

    const url = URL.createObjectURL(file);
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = file.name;
    track.src = url;
    
    if ('textTracks' in mediaRef.current) {
      // Remove previous uploaded subtitle track if exists
      Array.from(mediaRef.current.textTracks).forEach(track => {
        if (track.label === 'uploaded') {
          track.mode = 'disabled';
        }
      });
      
      mediaRef.current.appendChild(track);
      const newTrack = mediaRef.current.textTracks[mediaRef.current.textTracks.length - 1];
      newTrack.mode = 'showing';
      setSubtitleTracks(Array.from(mediaRef.current.textTracks));
      setCurrentSubtitleTrack(mediaRef.current.textTracks.length - 1);
    }
  };

  const toggleSubtitleTrack = (index: number) => {
    if (!mediaRef.current || !('textTracks' in mediaRef.current)) return;
    
    Array.from(mediaRef.current.textTracks).forEach((track, i) => {
      track.mode = i === index ? 'showing' : 'hidden';
    });
    setCurrentSubtitleTrack(index);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      ref={playerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-xl overflow-hidden bg-black relative group ${!isMouseMoving && isPlaying ? 'cursor-none' : ''}`}
    >
      {type === 'video' ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={url}
          className="w-full aspect-video"
          onClick={togglePlay}
        />
      ) : (
        <div>
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={url}
            className="hidden"
          />
          <div className="aspect-[3/1] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-white text-center p-4">
              <h3 className="text-lg font-medium truncate max-w-xs">
                {fileName}
              </h3>
              <p className="text-sm opacity-75">Audio Player</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${isMouseMoving || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white text-xs">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-gray-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:bg-blue-500"
          />
          <span className="text-white text-xs">
            {formatTime(duration)}
          </span>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="text-white hover:text-blue-500 transition-colors"
          >
            {isPlaying ? (
              <PauseIcon className="w-6 h-6" />
            ) : (
              <PlayIcon className="w-6 h-6" />
            )}
          </motion.button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-white hover:text-blue-500 transition-colors"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:bg-blue-500"
            />
          </div>

          {type === 'video' && (
            <>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".srt,.vtt"
                  onChange={handleSubtitleUpload}
                  className="hidden"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-white hover:text-blue-500 transition-colors"
                  title="Upload subtitles"
                >
                  <LanguageIcon className="w-5 h-5" />
                </motion.button>
                {subtitleTracks.length > 0 && (
                  <select
                    value={currentSubtitleTrack}
                    onChange={(e) => toggleSubtitleTrack(Number(e.target.value))}
                    className="bg-transparent text-white text-sm border border-white/20 rounded px-1"
                  >
                    <option value={-1}>No subtitles</option>
                    {subtitleTracks.map((track, index) => (
                      <option key={index} value={index}>
                        {track.label || `Track ${index + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className="text-white hover:text-blue-500 transition-colors ml-auto"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="w-5 h-5" />
                ) : (
                  <ArrowsPointingOutIcon className="w-5 h-5" />
                )}
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}