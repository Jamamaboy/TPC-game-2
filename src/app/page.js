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

// กำหนดประเภทของหน้า (Page Type Constants)
const PAGE_START = [1];
const PAGE_BACK = [2, 4, 6, 8, 10, 12, 13, 15, 16];
const PAGE_BACK_N = [3, 11, 17, 19];
const PAGE_QUIZ = [5, 7, 9, 14, 18];
const PAGE_PP = [20];
const PAGE_RESULTS = [21];
const NAVIGATION_ENABLED_PAGES = [...PAGE_BACK, ...PAGE_BACK_N, ...PAGE_START];

// จำนวนหน้าทั้งหมด
const TOTAL_PAGES = 21;


function MainApp() {
  const { state, setContentDimensions } = useAppState();
  const [preloadedImages, setPreloadedImages] = useState({});
  const [preloadedVideos, setPreloadedVideos] = useState({});
  const [starImage, setStarImage] = useState(null);
  const imageRef = useRef(null);
  const resultImageRef = useRef(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false); // ตรวจสอบว่าภาพโหลดเสร็จหรือยัง

  // โหลดภาพและวิดีโอล่วงหน้าเมื่อเริ่มต้น
  useEffect(() => {
    const preloadAssets = async () => {
      const imagePromises = [];
      const videoPromises = [];

      // โหลดภาพของทุกหน้า
      for (let i = 1; i <= TOTAL_PAGES; i++) {
        const imagePath = `/images/layer1/${i}.webp`;
        imagePromises.push(
          new Promise((resolve) => {
            const img = new Image();
            img.src = imagePath;
            img.onload = () => resolve({ [i]: imagePath });
            img.onerror = () => resolve({ [i]: null });
          })
        );
      }

      // โหลดวิดีโอของทุกหน้า
      for (let i = 1; i <= TOTAL_PAGES; i++) {
        const videoPath = `/videos/layer0/${i}.webm`;
        videoPromises.push(
          new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = videoPath;
            video.onloadeddata = () => resolve({ [i]: videoPath });
            video.onerror = () => resolve({ [i]: null });
          })
        );
      }

      // โหลดภาพดาวสำหรับหน้า Results
      const starImages = [
        '/images/stars/ASTER.png',
        '/images/stars/CASSIOPHIA.png',
        '/images/stars/ESTELLA.png',
        '/images/stars/LYNA.png',
        '/images/stars/NOVA.png'
      ];
      starImages.forEach((starPath) => {
        imagePromises.push(
          new Promise((resolve) => {
            const img = new Image();
            img.src = starPath;
            img.onload = () => resolve({ [starPath]: starPath });
            img.onerror = () => resolve({ [starPath]: null });
          })
        );
      });

      const loadedImages = await Promise.all(imagePromises);
      const loadedVideos = await Promise.all(videoPromises);

      // แปลงข้อมูลเป็น Object
      const imageMap = Object.assign({}, ...loadedImages);
      const videoMap = Object.assign({}, ...loadedVideos);

      setPreloadedImages(imageMap);
      setPreloadedVideos(videoMap);
    };

    preloadAssets();
  }, []);

  // คำนวณภาพดาวสำหรับหน้า Results
  useEffect(() => {
    if (PAGE_RESULTS.includes(state.page)) {
      const totalPoints = state.points.reduce((acc, curr) => acc + curr, 0);
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

      setStarImage(starPath);
    } else {
      setStarImage(null);
    }
  }, [state.page, state.points]);

  // จัดการเมื่อภาพโหลดเสร็จเพื่อกำหนดขนาดเนื้อหา
  const handleImageLoad = (event) => {
    const img = event.currentTarget;
    setContentDimensions(img.offsetHeight, img.offsetWidth);
    setIsImageLoaded(true); // ระบุว่าภาพโหลดเสร็จแล้ว
  };

  // จัดการเมื่อวิดีโอโหลดเสร็จเพื่อกำหนดขนาดเนื้อหา
  const handleVideoLoad = (event) => {
    const video = event.currentTarget;
    setContentDimensions(video.offsetHeight, video.offsetWidth);
  };

  // จัดการเมื่อภาพดาวโหลดเสร็จเพื่อกำหนดขนาดเนื้อหา
  const handleStarImageLoad = (event) => {
    const img = event.currentTarget;
    setContentDimensions(img.offsetHeight, img.offsetWidth);
    resultImageRef.current = img;
  };

  // อัปเดตขนาดเนื้อหาเมื่อหน้าต่างถูกปรับขนาด เฉพาะเมื่อภาพโหลดเสร็จ
  useEffect(() => {
    const handleResize = () => {
      if (isImageLoaded && imageRef.current) {
        setContentDimensions(imageRef.current.offsetHeight, imageRef.current.offsetWidth);
      } else if (resultImageRef.current) {
        setContentDimensions(resultImageRef.current.offsetHeight, resultImageRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // เรียกครั้งแรก (แต่จะไม่กำหนดถ้าภาพยังไม่โหลด)
    return () => window.removeEventListener('resize', handleResize);
  }, [isImageLoaded, state.page, setContentDimensions]);

  // แสดงผลคอมโพเนนต์ของหน้า
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

  const shouldShowNavigationOverlay = NAVIGATION_ENABLED_PAGES.includes(state.page) &&
                                    !PAGE_QUIZ.includes(state.page) &&
                                    !PAGE_RESULTS.includes(state.page);

  const currentImageSrc = preloadedImages[state.page];
  const currentVideoSrc = preloadedVideos[state.page];

  return (
    <main className="flex justify-center items-center min-h-screen bg-aquamarine relative">
      {/* ภาพพื้นหลัง */}
      {currentImageSrc && !PAGE_RESULTS.includes(state.page) && (
        <div className="absolute inset-0 z-2 flex items-center justify-center px-3 py-3">
          <img
            ref={imageRef}
            src={currentImageSrc}
            alt={`Page ${state.page}`}
            onLoad={handleImageLoad}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
          />
        </div>
      )}

      {/* ภาพดาว */}
      {starImage && PAGE_RESULTS.includes(state.page) && (
        <div className="absolute inset-0 z-2 flex items-center justify-center px-3 pb-16 pt-3">
          <img
            ref={resultImageRef}
            src={starImage}
            alt="Your Star Result"
            onLoad={handleStarImageLoad}
            className="max-w-full max-h-[calc(100vh-150px)] w-auto h-auto object-contain rounded-lg"
          />
        </div>
      )}

      {/* วิดีโอพื้นหลัง */}
      {currentVideoSrc && (
        <div className="absolute inset-0 w-full h-full z-1">
          <video
            src={currentVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            onLoadedMetadata={handleVideoLoad}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {shouldShowNavigationOverlay && <NavigationOverlay />}
      {renderPageComponent()}
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
