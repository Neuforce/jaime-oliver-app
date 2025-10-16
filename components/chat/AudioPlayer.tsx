import React, { useState, useRef } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  duration?: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  title,
  duration,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationState, setDurationState] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.log('Audio play interrupted:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDurationState(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={(e) => {
          console.log('Audio error:', e);
          setIsPlaying(false);
        }}
      />
      
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Audio Info and Controls */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 text-sm">
              {title || 'Audio Message'}
            </h4>
            <span className="text-xs text-gray-500">
              {formatTime(currentTime)} / {formatTime(durationState)}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max={durationState || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${(currentTime / durationState) * 100}%, #e5e7eb ${(currentTime / durationState) * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>
        </div>

        {/* Audio Waveform Icon */}
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className={`w-1 h-4 bg-purple-400 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}></div>
            <div className={`w-1 h-6 bg-purple-500 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`w-1 h-3 bg-purple-400 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.2s' }}></div>
            <div className={`w-1 h-5 bg-purple-500 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.3s' }}></div>
            <div className={`w-1 h-2 bg-purple-400 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
