'use client';
import { HeadphoneOff, Headphones } from 'lucide-react';
import { useState, useEffect } from 'react';


export default function AudioButton() {
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // สร้าง audio element ครั้งเดียวเมื่อ component mount
    const audioElement = new Audio('/Audio/song.mp3');
    audioElement.loop = true;
    setAudio(audioElement);

    // Cleanup function เมื่อ component unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, []);


  const toggleAudio = () => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error('Audio playback failed:', error);
        });
    }
  };

  return (
    <button
      onClick={toggleAudio}
      className="absolute top-4 right-4 z-50 bg-white bg-opacity-50 rounded-full p-3 shadow-md"
      aria-label={isPlaying ? "ปิดเพลง" : "เปิดเพลง"}
    >
      {isPlaying ? (
        <Headphones size={24} />
      ) : (
        <HeadphoneOff size={24} />
      )}
    </button>
  );
}
