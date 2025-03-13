'use client';

import { useAppState, AppStateProvider } from '@/lib/useAppState';
import PageStart from '@/components/PageStart';
import PageBack from '@/components/PageBack';
import PageQuiz from '@/components/PageQuiz';
import PagePp from '@/components/PagePp';
import PageResults from '@/components/PageResults';
import NavigationOverlay from '@/components/NavigationOverlay';
import AudioButton from '@/components/AudioButton';
import { useEffect, useState, useRef } from 'react';

// Define page type constants
const PAGE_START = [1]; // หน้าเริ่มต้น
const PAGE_BACK = [2, 4, 6, 8, 10, 12, 13, 15, 16];
const PAGE_BACK_N = [3, 11, 17, 19];
const PAGE_QUIZ = [5, 7, 9, 14, 18];
const PAGE_PP = [20];
const PAGE_RESULTS = [21];

// Pages where we should allow navigation by clicking left/right sides of the screen
// Exclude quiz pages and results page where we need more precise interaction
const NAVIGATION_ENABLED_PAGES = [...PAGE_BACK, ...PAGE_BACK_N, ...PAGE_START];

function MainApp() {
  const { state, setContentDimensions } = useAppState();
  const [imageSrc, setImageSrc] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [starImage, setStarImage] = useState(null);
  const resultImageRef = useRef(null);

  // Function to calculate and set star image for results page
  useEffect(() => {
    if (PAGE_RESULTS.includes(state.page)) {
      // Calculate total points - ใช้ผลรวมจากคะแนนทั้งหมด
      const totalPoints = state.points.reduce((acc, curr) => acc + curr, 0);

      console.log('Total points calculated:', totalPoints);
      console.log('Points breakdown:', state.points);
      console.log('Page points detailed:', state.pagePoints);

      // Determine which star to show based on points
      let starPath = '';

      if (totalPoints >= 0 && totalPoints <= 5.70) {
        starPath = '/images/stars/ASTER.png';
      } else if (totalPoints > 5.70 && totalPoints <= 6.20) {
        starPath = '/images/stars/CASSIOPHIA.png';
      } else if (totalPoints > 6.20 && totalPoints <= 6.70) {
        starPath = '/images/stars/ESTELLA.png';
      } else if (totalPoints > 6.70 && totalPoints <= 7.30) {
        starPath = '/images/stars/LYNA.png';
      } else {
        starPath = '/images/stars/NOVA.png';
      }


      console.log('Star selected:', starPath);
      setStarImage(starPath);
    } else {
      setStarImage(null);
    }
  }, [state.page, state.points, state.pagePoints]);

  // Function to get the appropriate image source for the current page
  useEffect(() => {
    const getPageMedia = async () => {
      // ถ้าเป็นหน้าผลลัพธ์ จะใช้รูปดาวแทน
      if (PAGE_RESULTS.includes(state.page)) {
        setImageSrc(null);
      } else {
        // Determine image source for normal pages
        try {
          const imageNum = state.page;
          const imagePath = `/images/layer1/${imageNum}.webp`;
          setImageSrc(imagePath);
        } catch (error) {
          setImageSrc(null);
          console.error('Image load error:', error);
        }
      }

      // Determine video source (ใช้เหมือนเดิม)
      try {
        const videoPath = `/videos/layer0/${state.page}.webm`;
        setVideoSrc(videoPath);
      } catch (error) {
        setVideoSrc(null);
      }
    };

    getPageMedia();
  }, [state.page]);

  // Handle image load to set dimensions
  const handleImageLoad = (event) => {
    const img = event.currentTarget;
    setContentDimensions(img.offsetHeight, img.offsetWidth);
  };

  // Handle video load to set dimensions
  const handleVideoLoad = (event) => {
    const video = event.currentTarget;
    setContentDimensions(video.offsetHeight, video.offsetWidth);
  };

  // Handle star image load
  const handleStarImageLoad = (event) => {
    const img = event.currentTarget;
    setContentDimensions(img.offsetHeight, img.offsetWidth);
    resultImageRef.current = img;
  };

  // Render the appropriate component based on the current page
  const renderPageComponent = () => {
    if (PAGE_START.includes(state.page)) {
      return <PageStart />;
    } else if (PAGE_BACK.includes(state.page) || PAGE_BACK_N.includes(state.page)) {
      return <PageBack />;
    } else if (PAGE_QUIZ.includes(state.page)) {
      return <PageQuiz />;
    } else if (PAGE_PP.includes(state.page)) {
      return <PagePp />;
    } else if (PAGE_RESULTS.includes(state.page)) {
      return <PageResults starImageSrc={starImage} />;
    }

    return null;
  };

  // Check if navigation overlay should be enabled for the current page
  // ไม่แสดง NavigationOverlay ในหน้า quiz และหน้าผลลัพธ์
  const shouldShowNavigationOverlay = NAVIGATION_ENABLED_PAGES.includes(state.page) &&
                                    !PAGE_QUIZ.includes(state.page) &&
                                    !PAGE_RESULTS.includes(state.page);

  return (
    <main className="flex justify-center items-center min-h-screen bg-aquamarine relative">
      {/* Background image สำหรับหน้าทั่วไป */}
      {imageSrc && (
        <div className="absolute inset-0 z-2 flex items-center justify-center px-3 py-3">
          <img
            src={imageSrc}
            alt={`Page ${state.page}`}
            onLoad={handleImageLoad}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
          />
        </div>
      )}

      {/* Star image สำหรับหน้าผลลัพธ์ */}
      {starImage && PAGE_RESULTS.includes(state.page) && (
        <div className="absolute inset-0 z-2 flex items-center justify-center px-3 pb-16 pt-3">
          <img
            src={starImage}
            alt="Your Star Result"
            onLoad={handleStarImageLoad}
            className="max-w-full max-h-[calc(100vh-150px)] w-auto h-auto object-contain rounded-lg"
          />
        </div>
      )}

      {/* Background video */}
      {videoSrc && (
        <div className="absolute inset-0 w-full h-full z-1">
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            onLoadedMetadata={handleVideoLoad}
            className="w-full h-full object-cover"
          >
          </video>
        </div>
      )}

      {/* Navigation Overlay - Only show on pages where it makes sense */}
      {shouldShowNavigationOverlay && <NavigationOverlay />}

      {/* Current page component */}
      {renderPageComponent()}

      {/* Audio control button */}
      <AudioButton />
    </main>
  );
}

export default function Home() {
  return (
    <AppStateProvider>
      <MainApp />
    </AppStateProvider>
  );
}
