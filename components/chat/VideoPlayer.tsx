import React, { useState, useRef } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  thumbnail?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  thumbnail,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        // Handle play() interruption gracefully
        console.log('Video play interrupted:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  const handleMouseEnter = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    setShowControls(false);
  };

  return (
    <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        className="w-full h-auto max-h-96 object-cover cursor-pointer"
        poster={thumbnail}
        onClick={handleVideoClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.log('Video error:', e);
          setIsPlaying(false);
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 cursor-pointer"
          onClick={handleVideoClick}
        >
          <div className="w-20 h-20 bg-white bg-opacity-95 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all shadow-lg">
            <svg className="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}
      
      {/* Video Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              <span className="text-sm font-medium">
                {title || 'Video'}
              </span>
            </div>
            <div className="text-xs opacity-75">
              Click to {isPlaying ? 'pause' : 'play'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
