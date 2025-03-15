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

// กำหนดประเภทของหน้า
const PAGE_START = [1];
const PAGE_BACK = [2, 4, 6, 8, 10, 12, 13, 15, 16];
const PAGE_BACK_N = [3, 11, 17, 19];
const PAGE_QUIZ = [5, 7, 9, 14, 18];
const PAGE_PP = [20];
const PAGE_RESULTS = [21];
const NAVIGATION_ENABLED_PAGES = [...PAGE_BACK, ...PAGE_BACK_N, ...PAGE_START];

const TOTAL_PAGES = 21;

function MainApp() {
  const { state, setContentDimensions } = useAppState();
  const [imageSrc, setImageSrc] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [starImage, setStarImage] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const imageRef = useRef(null);
  const resultImageRef = useRef(null);

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


  useEffect(() => {
    const getPageMedia = async () => {
      if (PAGE_RESULTS.includes(state.page)) {
        setImageSrc(null);
      } else {
        try {
          setImageSrc(`/images/layer1/${state.page}.webp`);
        } catch (error) {
          setImageSrc(null);
          console.error('Image load error:', error);
        }
      }

      try {
        setVideoSrc(`/videos/layer0/${state.page}.webm`);
      } catch (error) {
        setVideoSrc(null);
      }
    };

    getPageMedia();
  }, [state.page]);

	useEffect(() => {
		const nextPage = state.page + 1;
		if (nextPage <= TOTAL_PAGES) {
		const preloadImage = new Image();
		preloadImage.src = `/images/layer1/${nextPage}.webp`;

		const preloadVideo = document.createElement("video");
		preloadVideo.src = `/videos/layer0/${nextPage}.webm`;
		preloadVideo.preload = "auto";
		}
	}, [state.page]);

	useEffect(() => {
		const nextPage = state.page + 1;
		if (nextPage <= TOTAL_PAGES) {
			const linkImage = document.createElement("link");
			linkImage.rel = "preload";
			linkImage.href = `/images/layer1/${nextPage}.webp`;
			linkImage.as = "image";
			document.head.appendChild(linkImage);

			const linkVideo = document.createElement("link");
			linkVideo.rel = "preload";
			linkVideo.href = `/videos/layer0/${nextPage}.webm`;
			linkVideo.as = "video";
			document.head.appendChild(linkVideo);
		}
	}, [state.page]);

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


  const renderPageComponent = () => {
	if (PAGE_START.includes(state.page)) {
	  return <PageStart />;
	} else if (PAGE_BACK.includes(state.page) || PAGE_BACK_N.includes(state.page)) {
	  return <PageBack />;
	} else if (PAGE_QUIZ.includes(state.page)) {
	  // รอให้ contentHeight มีค่าก่อน render PageQuiz
	  if (state.contentHeight > 0) {
		return <PageQuiz />;
	  }
	  return null; // หรือแสดง loading state ถ้าต้องการ
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

  return (
    <main className="flex justify-center items-center min-h-screen bg-aquamarine relative">
      {imageSrc && !PAGE_RESULTS.includes(state.page) && (
        <div className="absolute inset-0 z-2 flex items-center justify-center px-3 py-3">
          <img
            ref={imageRef}
            src={imageSrc}
            alt={`Page ${state.page}`}
            onLoad={handleImageLoad}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
          />
        </div>
      )}

      {starImage && PAGE_RESULTS.includes(state.page) && (
        <div className="absolute inset-0 z-2 flex items-center justify-center px-3 pb-16 pt-3">
          <img
            ref={resultImageRef}
            src={starImage}
            alt="Your Star Result"
            onLoad={handleStarImageLoad}
            className="max-w-full max-h-[calc(100lvh-5lvh)] flex justify-center items-center w-auto h-auto object-contain rounded-lg"
          />
        </div>
      )}

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
      <div className="bg-black min-h-screen">
        <MainApp />
      </div>
    </AppStateProvider>
  );
}
