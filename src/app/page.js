'use client';

import { useAppState, AppStateProvider } from '@/lib/useAppState';
import PageStart from '@/components/PageStart';
import PageBack from '@/components/PageBack';
import PageQuiz from '@/components/PageQuiz';
import PagePp from '@/components/PagePp';
import PageResults from '@/components/PageResults';
import NavigationOverlay from '@/components/NavigationOverlay';
import AudioButton from '@/components/AudioButton';
import LoadingScreen from '@/components/LoadingScreen';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// กำหนดประเภทของหน้า
const PAGE_START = [1];
const PAGE_BACK = [2, 4, 6, 8, 10, 12, 13, 15, 16];
const PAGE_BACK_N = [3, 11, 17, 19];
const PAGE_QUIZ = [5, 7, 9, 14, 18];
const PAGE_PP = [20];
const PAGE_RESULTS = [21];
const NAVIGATION_ENABLED_PAGES = [...PAGE_BACK, ...PAGE_BACK_N, ...PAGE_START];

const TOTAL_PAGES = 21;

// Animation variants สำหรับการเปลี่ยนหน้า
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(10px)',
  },
  in: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  out: {
    opacity: 0,
    scale: 1.1,
    filter: 'blur(10px)',
  }
};

// Animation variants สำหรับการเปลี่ยนวิดีโอพื้นหลัง
const videoVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  }
};

// Animation variants สำหรับการเปลี่ยน overlay
const overlayVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  }
};

// Animation transitions
const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.2
};

// Animation variants สำหรับ star reveal
const starRevealVariants = {
  initial: {
    opacity: 0,
    scale: 0.5,
    y: 20,
    filter: 'blur(10px) brightness(1.5)',
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px) brightness(1)',
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

function MainApp() {
  const { state, setContentDimensions } = useAppState();
  const [imageSrc, setImageSrc] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [starImage, setStarImage] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resourcesReady, setResourcesReady] = useState(false);
  const [prevPage, setPrevPage] = useState(1);
  const [direction, setDirection] = useState(0); // 1 = forward, -1 = backward, 0 = initial
  const [isAnimating, setIsAnimating] = useState(false); // ใช้ติดตามสถานะการ animate

  const imageRef = useRef(null);
  const resultImageRef = useRef(null);

  // ตรวจจับการเปลี่ยนหน้าเพื่อกำหนดทิศทางการ animate
  useEffect(() => {
    if (state.page !== prevPage) {
      if (state.page > prevPage) {
        setDirection(1); // forward
      } else {
        setDirection(-1); // backward
      }
      setPrevPage(state.page);

      // ตั้งค่าสถานะการ animate เป็น true และกลับเป็น false หลังจาก animation เสร็จสิ้น
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 600); // ตั้งเวลานานกว่า duration ของ animation เล็กน้อย

      return () => clearTimeout(timer);
    }
  }, [state.page, prevPage]);

  // ฟังก์ชันสำหรับเมื่อโหลดเสร็จสิ้น
  const handleLoadComplete = () => {
    setIsLoading(false);
    setResourcesReady(true);
    console.log('โหลด assets เสร็จเรียบร้อย พร้อมเริ่มต้นแอป');
  };

  useEffect(() => {
    if (PAGE_RESULTS.includes(state.page)) {
      // Calculate total points - ใช้ผลรวมจากคะแนนทั้งหมด
      const totalPoints = state.points.reduce((acc, curr) => acc + curr, 0);

      console.log('Total points calculated:', totalPoints);
      console.log('Points breakdown:', state.points);
      console.log('Page points detailed:', state.pagePoints);

      // Determine which star to show based on points
      let starKey = '';
      let starPath = '';

      if (totalPoints >= 0 && totalPoints <= 5.70) {
        starKey = 'ASTER';
        starPath = '/images/stars/ASTER.webp';
      } else if (totalPoints > 5.70 && totalPoints <= 6.20) {
        starKey = 'CASSIOPHIA';
        starPath = '/images/stars/CASSIOPHIA.webp';
      } else if (totalPoints > 6.20 && totalPoints <= 6.70) {
        starKey = 'ESTELLA';
        starPath = '/images/stars/ESTELLA.webp';
      } else if (totalPoints > 6.70 && totalPoints <= 7.30) {
        starKey = 'LYNA';
        starPath = '/images/stars/LYNA.webp';
      } else {
        starKey = 'NOVA';
        starPath = '/images/stars/NOVA.webp';
      }

      // ใช้ภาพดาวจาก cache ถ้ามี
      if (typeof window !== 'undefined' && window.appCache && window.appCache.stars[starKey]) {
        console.log('Using cached star image for:', starKey);
        setStarImage(window.appCache.stars[starKey]);
      } else {
        // ถ้าไม่มีใน cache ใช้ path ปกติ
        console.log('Star selected (from path):', starPath);
        setStarImage(starPath);
      }
    } else {
      setStarImage(null);
    }
  }, [state.page, state.points, state.pagePoints]);

  // ฟังก์ชันสำหรับเรียกใช้ไฟล์จาก cache
  useEffect(() => {
    if (!resourcesReady) return;

    // สำหรับหน้า 21 (ผลลัพธ์) เราต้องการแสดงวิดีโอพื้นหลัง แต่ไม่ต้องการแสดงรูปภาพ
    if (PAGE_RESULTS.includes(state.page)) {
      setImageSrc(null);

      // หน้าผลลัพธ์ยังคงโหลดวิดีโอพื้นหลัง
      if (typeof window !== 'undefined' && window.appCache) {
        const pageNumber = state.page;

        if (window.appCache.videos[pageNumber]) {
          setVideoSrc(window.appCache.videos[pageNumber]);
        } else {
          // Fallback ถ้าไม่มีใน cache
          setVideoSrc(`/videos/layer0/${pageNumber}.webm`);
        }
      }
      return;
    }

    // ดึงไฟล์จาก cache ที่เราโหลดไว้ตั้งแต่ต้น
    if (typeof window !== 'undefined' && window.appCache) {
      // ใช้ข้อมูลจาก cache แทนการโหลดใหม่
      const pageNumber = state.page;

      if (window.appCache.images[pageNumber]) {
        setImageSrc(window.appCache.images[pageNumber]);
      } else {
        // Fallback ถ้าไม่มีใน cache
        setImageSrc(`/images/layer1/${pageNumber}.webp`);
      }

      if (window.appCache.videos[pageNumber]) {
        setVideoSrc(window.appCache.videos[pageNumber]);
      } else {
        // Fallback ถ้าไม่มีใน cache
        setVideoSrc(`/videos/layer0/${pageNumber}.webm`);
      }
    }
  }, [state.page, resourcesReady]);

  // cleanup function สำหรับเมื่อ component unmount
  useEffect(() => {
    return () => {
      // เมื่อ component unmount (เช่น ปิดเว็บ) เราจะลบ blob URLs เพื่อไม่ให้ memory leak
      if (typeof window !== 'undefined' && window.appCache) {
        Object.values(window.appCache.images).forEach(blobUrl => {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (e) {
            // ignore errors
          }
        });

        Object.values(window.appCache.videos).forEach(blobUrl => {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (e) {
            // ignore errors
          }
        });

        Object.values(window.appCache.stars).forEach(blobUrl => {
          try {
            URL.revokeObjectURL(blobUrl);
          } catch (e) {
            // ignore errors
          }
        });
      }
    };
  }, []);

  const handleImageLoad = (event) => {
    const img = event.currentTarget;
    setContentDimensions(img.offsetHeight, img.offsetWidth);
    setIsImageLoaded(true);
  };

  const handleVideoLoad = (event) => {
    const video = event.currentTarget;
    setContentDimensions(video.offsetHeight, video.offsetWidth);
  };

  const handleStarImageLoad = (event) => {
    const img = event.currentTarget;
    setContentDimensions(img.offsetHeight, img.offsetWidth);
    resultImageRef.current = img;
  };

  useEffect(() => {
    const handleResize = () => {
      if (isImageLoaded && imageRef.current) {
        setContentDimensions(imageRef.current.offsetHeight, imageRef.current.offsetWidth);
      } else if (resultImageRef.current) {
        setContentDimensions(resultImageRef.current.offsetHeight, resultImageRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isImageLoaded, state.page, setContentDimensions]);

  // แยกการ render หน้า Quiz ออกมาเพื่อให้สามารถจัดการกับ z-index และ events ได้ดีขึ้น
  const renderQuizPage = () => {
    if (PAGE_QUIZ.includes(state.page) && state.contentHeight > 0) {
      return (
        <div className="absolute inset-0 z-30 pointer-events-auto">
          <PageQuiz />
        </div>
      );
    }
    return null;
  };

  const renderPageComponent = () => {
    // ไม่รวม PageQuiz ในการ render ตรงนี้ เพราะจะ render แยกต่างหาก
    if (PAGE_START.includes(state.page)) {
      return <PageStart />;
    } else if (PAGE_BACK.includes(state.page) || PAGE_BACK_N.includes(state.page)) {
      return <PageBack />;
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

  // ถ้ากำลังโหลด แสดงเฉพาะ LoadingScreen
  if (isLoading) {
    return <LoadingScreen onLoadComplete={handleLoadComplete} />;
  }

  // เลือก animation variant ตามทิศทางการเปลี่ยนหน้า
  const getDirectionVariants = () => {
    if (direction === 1) {
      return {
        initial: { opacity: 0, x: 100, filter: 'blur(10px)' },
        in: { opacity: 1, x: 0, filter: 'blur(0px)' },
        out: { opacity: 0, x: -100, filter: 'blur(10px)' }
      };
    } else if (direction === -1) {
      return {
        initial: { opacity: 0, x: -100, filter: 'blur(10px)' },
        in: { opacity: 1, x: 0, filter: 'blur(0px)' },
        out: { opacity: 0, x: 100, filter: 'blur(10px)' }
      };
    } else {
      return pageVariants;
    }
  };

  // แสดงเนื้อหาหลักเมื่อโหลดเสร็จแล้ว
  return (
    <main className="flex justify-center items-center min-h-screen bg-aquamarine relative overflow-hidden">
      <AnimatePresence mode="wait">
        {/* วิดีโอพื้นหลัง */}
        {videoSrc && (
          <motion.div
            key={`video-${state.page}`}
            className="absolute inset-0 w-full h-full z-1"
            initial="initial"
            animate="in"
            exit="out"
            variants={videoVariants}
            transition={pageTransition}
          >
            <video
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              onLoadedMetadata={handleVideoLoad}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* รูปภาพหลัก */}
        {imageSrc && !PAGE_RESULTS.includes(state.page) && (
          <motion.div
            key={`image-${state.page}`}
            className="absolute inset-0 z-2 flex items-center justify-center px-3 py-3"
            initial="initial"
            animate="in"
            exit="out"
            variants={getDirectionVariants()}
            transition={pageTransition}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt={`Page ${state.page}`}
              onLoad={handleImageLoad}
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
            />
          </motion.div>
        )}

        {/* ภาพดาวในหน้าผลลัพธ์ */}
        {starImage && PAGE_RESULTS.includes(state.page) && (
          <motion.div
            key="star-result"
            className="absolute inset-0 z-2 flex items-center justify-center px-3 pb-16 pt-3"
            initial="initial"
            animate="in"
            variants={starRevealVariants}
          >
            <img
              ref={resultImageRef}
              src={starImage}
              alt="Your Star Result"
              onLoad={handleStarImageLoad}
              className="max-w-full max-h-[calc(100lvh-5lvh)] flex justify-center items-center w-auto h-auto object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Overlay */}
      <AnimatePresence>
        {shouldShowNavigationOverlay && (
          <motion.div
            key={`nav-${state.page}`}
            initial="initial"
            animate="in"
            exit="out"
            variants={overlayVariants}
            transition={pageTransition}
            className="z-20"
          >
            <NavigationOverlay />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Components (ยกเว้น Quiz) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`page-component-${state.page}`}
          className="z-10"
          initial="initial"
          animate="in"
          exit="out"
          variants={getDirectionVariants()}
          transition={pageTransition}
        >
          {renderPageComponent()}
        </motion.div>
      </AnimatePresence>

      {/* Quiz Page - แสดงแยกจาก animation flow เพื่อให้ invisibleButton ทำงานได้ */}
      {renderQuizPage()}

      {/* Audio Button */}
      <AudioButton />
    </main>
  );
}

export default function Home() {
  return (
    <AppStateProvider>
      <div className="bg-black min-h-screen">
        <MainApp />
      </div>
    </AppStateProvider>
  );
}
