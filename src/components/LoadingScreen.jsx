// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// // ใช้ window.appCache หรือตัวแปร global เพื่อให้ทุก component เข้าถึงได้
// if (typeof window !== 'undefined' && !window.appCache) {
//   window.appCache = {
//     images: {},
//     videos: {},
//     stars: {},
//     loaded: false
//   };
// }

// const LoadingScreen = ({ onLoadComplete }) => {
//   const [progress, setProgress] = useState(0);
//   const [loadedItems, setLoadedItems] = useState(0);
//   const [totalItems, setTotalItems] = useState(0);
//   const [isComplete, setIsComplete] = useState(false);
//   const [statusText, setStatusText] = useState('กำลังเตรียมโหลด...');
//   const [isMobile, setIsMobile] = useState(false);
//   const videoRef = useRef(null);

//   // ตรวจสอบว่าเป็นอุปกรณ์ mobile หรือไม่
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const checkMobile = () => {
//         setIsMobile(window.innerWidth < 768);
//       };

//       checkMobile();
//       window.addEventListener('resize', checkMobile);

//       return () => {
//         window.removeEventListener('resize', checkMobile);
//       };
//     }
//   }, []);

//   // โหลดและแสดงวิดีโอพื้นหลัง
//   useEffect(() => {
//     if (!videoRef.current) return;

//     videoRef.current.src = '/videos/layer0/2.webm';
//     videoRef.current.load();

//     videoRef.current.onloadeddata = () => {
//       videoRef.current.play().catch(err => {
//         console.warn('Auto-play prevented:', err);
//         document.addEventListener('click', () => {
//           videoRef.current?.play().catch(e => console.log('Play error:', e));
//         }, { once: true });
//       });
//     };
//   }, []);

//   useEffect(() => {
//     const imageCount = 21;
//     const videoCount = 21;
//     const starCount = 5;
//     const totalFilesToLoad = imageCount + videoCount + starCount;
//     setTotalItems(totalFilesToLoad);

//     if (typeof window !== 'undefined' && window.appCache && window.appCache.loaded) {
//       console.log('ไฟล์ถูกโหลดไว้แล้ว กำลังเริ่มใช้งานแอปพลิเคชัน');
//       setProgress(100);
//       setLoadedItems(totalFilesToLoad);
//       setIsComplete(true);
//       setTimeout(() => onLoadComplete(), 500);
//       return;
//     }

//     const preloadMedia = async () => {
//       let loadedCount = 0;
//       let failedCount = 0;
//       const cache = typeof window !== 'undefined' ? window.appCache : { images: {}, videos: {} };

//       const updateProgress = () => {
//         loadedCount++;
//         const currentProgress = Math.floor((loadedCount / totalFilesToLoad) * 100);
//         setProgress(currentProgress);
//         setLoadedItems(loadedCount);
//       };

//       setStatusText('กำลังโหลดรูปภาพ...');
//       for (let i = 1; i <= imageCount; i++) {
//         const imgPath = `/images/layer1/${i}.webp`;
//         try {
//           const response = await fetch(imgPath);
//           const blob = await response.blob();
//           const blobUrl = URL.createObjectURL(blob);
//           cache.images[i] = blobUrl;

//           const img = new Image();
//           img.src = blobUrl;
//           await new Promise((resolve) => {
//             img.onload = resolve;
//             img.onerror = resolve;
//           });

//           updateProgress();
//         } catch (error) {
//           console.warn(`ไม่สามารถโหลดภาพ: ${imgPath}`, error);
//           failedCount++;
//           updateProgress();
//         }
//       }

//       setStatusText('กำลังโหลดวิดีโอ...');
//       for (let i = 1; i <= videoCount; i++) {
//         const videoPath = `/videos/layer0/${i}.webm`;
//         try {
//           const response = await fetch(videoPath);
//           const blob = await response.blob();
//           const blobUrl = URL.createObjectURL(blob);
//           cache.videos[i] = blobUrl;

//           const video = document.createElement('video');
//           video.preload = 'metadata';
//           video.muted = true;
//           video.src = blobUrl;

//           await new Promise((resolve) => {
//             video.onloadedmetadata = resolve;
//             video.onerror = resolve;
//             video.load();
//           });

//           updateProgress();
//         } catch (error) {
//           console.warn(`ไม่สามารถโหลดวิดีโอ: ${videoPath}`, error);
//           failedCount++;
//           updateProgress();
//         }
//       }

//       setStatusText('กำลังโหลดภาพดาว...');
//       const starImages = [
//         { key: 'ASTER', path: '/images/stars/ASTER.webp' },
//         { key: 'CASSIOPHIA', path: '/images/stars/CASSIOPHIA.webp' },
//         { key: 'ESTELLA', path: '/images/stars/ESTELLA.webp' },
//         { key: 'LYNA', path: '/images/stars/LYNA.webp' },
//         { key: 'NOVA', path: '/images/stars/NOVA.webp' }
//       ];

//       for (const star of starImages) {
//         try {
//           const response = await fetch(star.path);
//           const blob = await response.blob();
//           const blobUrl = URL.createObjectURL(blob);
//           cache.stars[star.key] = blobUrl;

//           const img = new Image();
//           img.src = blobUrl;
//           await new Promise((resolve) => {
//             img.onload = resolve;
//             img.onerror = resolve;
//           });

//           updateProgress();
//         } catch (error) {
//           console.warn(`ไม่สามารถโหลดภาพดาว: ${star.path}`, error);
//           failedCount++;
//           updateProgress();
//         }
//       }

//       if (failedCount > 0) {
//         console.warn(`การโหลดเสร็จสิ้น แต่มี ${failedCount} ไฟล์ที่ไม่สามารถโหลดได้`);
//       }

//       if (typeof window !== 'undefined') {
//         window.appCache.loaded = true;
//       }

//       setStatusText('โหลดเสร็จสิ้น กำลังเริ่มต้น...');
//       setIsComplete(true);
//       setTimeout(() => onLoadComplete(), 800);
//     };

//     preloadMedia();
//   }, [onLoadComplete]);

//   return (
//     <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
//       {/* วิดีโอพื้นหลัง */}
//       <div className="absolute inset-0 z-0">
//         <video
//           ref={videoRef}
//           className="absolute w-full h-full object-cover"
//           muted
//           loop
//           playsInline
//         />
//         <div className="absolute inset-0  bg-opacity-40"></div>
//       </div>

//       {/* แสดง Logo */}
//       <div className="flex justify-center space-x-2 mb-8 mt-4 z-10">
//         <motion.img
//           src="/logo/Aster.webp"
//           alt="Logo 1"
//           className="w-12 h-12 object-contain"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         />
//         <motion.img
//           src="/logo/Cassiopeia.webp"
//           alt="Logo 2"
//           className="w-12 h-12 object-contain"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//         />
//         <motion.img
//           src="/logo/Estella.webp"
//           alt="Logo 3"
//           className="w-12 h-12 object-contain"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//         />
//         <motion.img
//           src="/logo/Lyra.webp"
//           alt="Logo 4"
//           className="w-12 h-12 object-contain"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//         />
//         <motion.img
//           src="/logo/Nova.webp"
//           alt="Logo 5"
//           className="w-12 h-12 object-contain"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.4 }}
//         />
//       </div>

//       <motion.div
//         className="mb-6 text-center z-10"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//       >
//         <motion.div
//           className={`text-aquamarine ${isMobile ? 'text-6xl' : 'text-4xl'} text-white font-bold mb-2`}
//           animate={{
//             textShadow: [
//               '15 15 30px rgba(79, 209, 197, 0.5)',
//               '30 30 15px rgba(79, 209, 197, 0.8)',
//               '15 15 30px rgba(79, 209, 197, 0.5)'
//             ]
//           }}
//           transition={{ duration: 2, repeat: Infinity }}
//           style={{ textShadow: '0 0 10px rgba(79, 209, 197, 0.8)' }}
//         >
//           Galactic self
//         </motion.div>
//         <motion.div
//           className="text-white text-lg mb-6"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3, duration: 0.8 }}
//         >
//           <spen className="text-2xl"> ค้นพบดวงดาวของคุณ </spen><br/>
// 		  <span className="text-[#00bcd4] text-xs">www.galactic-self.vercel.app</span> <br/>
// 		  <spen className="text-xs">by</spen><span className=" text-xs text-[#C3002F] "> Thammasat</span><span className=" text-xs text-[#FFD13F] "> University</span>
//         </motion.div>
//       </motion.div>

//       <motion.div
//         className="text-green-400 text-xl mb-2 z-10 size-xl"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         key={statusText}
//       >
//         {statusText}
//       </motion.div>

//       <motion.div
//         className="text-white text-lg mb-4 z-10"
//         initial={{ scale: 0.8, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//       >
//         ({progress}%)
//       </motion.div>

//       {/* Loading Gauge */}
//       <motion.div
//         className={`${isMobile ? 'w-64' : 'w-80'} h-5 bg-gray-800 rounded-full overflow-hidden shadow-lg z-10`}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <motion.div
//           className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
//           style={{ width: `${progress}%` }}
//           transition={{ type: "spring", stiffness: 50 }}
//         >
//           {progress > 5 && (
//             <motion.div
//               className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent"
//               animate={{ x: ["0%", "100%"] }}
//               transition={{
//                 duration: 1.5,
//                 repeat: Infinity,
//                 ease: "linear"
//               }}
//               style={{ opacity: 0.4 }}
//             />
//           )}
//         </motion.div>
//       </motion.div>

//       <motion.div
//         className="text-white text-sm mt-2 z-10"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 0.8 }}
//         transition={{ delay: 0.6 }}
//       >
//         โหลดแล้ว {loadedItems} จาก {totalItems} ไฟล์
//       </motion.div>

//       <AnimatePresence>
//         {isComplete && (
//           <motion.div
//             className="text-green-400 mt-4 z-10"
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: [0, -10, 0] }}
//             exit={{ opacity: 0 }}
//             transition={{
//               y: { repeat: Infinity, duration: 1.2 },
//               opacity: { duration: 0.3 }
//             }}
//           >
//             โหลดเสร็จสิ้น กำลังเริ่มต้น...
// 			<br/><br/><br/>
// 			<span className='text-white'>Dev web: jamamaboy(github)</span>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default LoadingScreen;

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ใช้ window.appCache หรือตัวแปร global เพื่อให้ทุก component เข้าถึงได้
if (typeof window !== 'undefined' && !window.appCache) {
  window.appCache = {
    images: {},
    videos: {},
    stars: {},
    loaded: false
  };
}

const LoadingScreen = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadedItems, setLoadedItems] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [statusText, setStatusText] = useState('กำลังเตรียมโหลด...');
  const [isMobile, setIsMobile] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  // ตรวจสอบว่าเป็นอุปกรณ์ mobile หรือไม่
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);

      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    }
  }, []);

  // โหลดและแสดงวิดีโอพื้นหลัง - ปรับปรุงเพื่อให้ทำงานได้ดีกว่าเดิม
  useEffect(() => {
    if (!videoRef.current) return;

    const handleVideoError = (err) => {
      console.warn('Video loading error:', err);
      setVideoLoaded(true); // ถือว่าโหลดเสร็จแล้ว แม้ว่าจะมี error
    };

    const loadVideo = () => {
      try {
        videoRef.current.src = '/videos/layer0/2.webm';
        videoRef.current.load();

        videoRef.current.onloadeddata = () => {
          setVideoLoaded(true);
          videoRef.current.play().catch(err => {
            console.warn('Auto-play prevented:', err);
            document.addEventListener('click', () => {
              videoRef.current?.play().catch(e => console.log('Play error:', e));
            }, { once: true });
          });
        };

        videoRef.current.onerror = handleVideoError;

        // ตั้ง timeout เพื่อป้องกันการรอนานเกินไป
        setTimeout(() => {
          if (!videoLoaded) {
            setVideoLoaded(true);
            console.warn('Video loading timeout - continuing anyway');
          }
        }, 5000);
      } catch (error) {
        console.warn('Video init error:', error);
        setVideoLoaded(true);
      }
    };

    loadVideo();
  }, [videoLoaded]);

  useEffect(() => {
    const imageCount = 21;
    const videoCount = 21;
    const starCount = 5;
    const totalFilesToLoad = imageCount + videoCount + starCount;
    setTotalItems(totalFilesToLoad);

    if (typeof window !== 'undefined' && window.appCache && window.appCache.loaded) {
      console.log('ไฟล์ถูกโหลดไว้แล้ว กำลังเริ่มใช้งานแอปพลิเคชัน');
      setProgress(100);
      setLoadedItems(totalFilesToLoad);
      setIsComplete(true);
      setTimeout(() => onLoadComplete(), 500);
      return;
    }

    const preloadMedia = async () => {
      let loadedCount = 0;
      let failedCount = 0;
      const cache = typeof window !== 'undefined' ? window.appCache : { images: {}, videos: {}, stars: {} };

      const updateProgress = () => {
        loadedCount++;
        const currentProgress = Math.floor((loadedCount / totalFilesToLoad) * 100);
        setProgress(currentProgress);
        setLoadedItems(loadedCount);
      };

      // แก้ไขการโหลดรูปภาพเพื่อรองรับการทำงานบน mobile network
      setStatusText('กำลังโหลดรูปภาพ...');
      for (let i = 1; i <= imageCount; i++) {
        const imgPath = `/images/layer1/${i}.webp`;
        try {
          // ใช้ timeout เพื่อป้องกันการรอนาน
          const imagePromise = new Promise(async (resolve) => {
            try {
              const response = await fetch(imgPath);
              if (response.ok) {
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                cache.images[i] = blobUrl;

                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = blobUrl;
              } else {
                resolve(false);
              }
            } catch (error) {
              console.warn(`ไม่สามารถโหลดภาพ: ${imgPath}`, error);
              resolve(false);
            }
          });

          // ตั้ง timeout 10 วินาที
          const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 10000));

          // ใช้ Promise.race เพื่อรับค่าจากตัวที่เสร็จก่อน
          const result = await Promise.race([imagePromise, timeoutPromise]);

          if (!result) {
            failedCount++;
          }
          updateProgress();
        } catch (error) {
          console.warn(`ไม่สามารถโหลดภาพ: ${imgPath}`, error);
          failedCount++;
          updateProgress();
        }
      }

      // ปรับปรุงการโหลดวิดีโอในลักษณะเดียวกัน
      setStatusText('กำลังโหลดวิดีโอ...');
      for (let i = 1; i <= videoCount; i++) {
        const videoPath = `/videos/layer0/${i}.webm`;
        try {
          const videoPromise = new Promise(async (resolve) => {
            try {
              const response = await fetch(videoPath);
              if (response.ok) {
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                cache.videos[i] = blobUrl;

                // ไม่ต้องรอให้โหลดเสร็จ เพียงแค่ตรวจสอบว่า fetch ได้หรือไม่
                resolve(true);
              } else {
                resolve(false);
              }
            } catch (error) {
              console.warn(`ไม่สามารถโหลดวิดีโอ: ${videoPath}`, error);
              resolve(false);
            }
          });

          // ตั้ง timeout 10 วินาที
          const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 10000));

          const result = await Promise.race([videoPromise, timeoutPromise]);

          if (!result) {
            failedCount++;
          }
          updateProgress();
        } catch (error) {
          console.warn(`ไม่สามารถโหลดวิดีโอ: ${videoPath}`, error);
          failedCount++;
          updateProgress();
        }
      }

      // ปรับปรุงการโหลดภาพดาวในลักษณะเดียวกัน
      setStatusText('กำลังโหลดภาพดาว...');
      const starImages = [
        { key: 'ASTER', path: '/images/stars/ASTER.webp' },
        { key: 'CASSIOPHIA', path: '/images/stars/CASSIOPHIA.webp' },
        { key: 'ESTELLA', path: '/images/stars/ESTELLA.webp' },
        { key: 'LYNA', path: '/images/stars/LYNA.webp' },
        { key: 'NOVA', path: '/images/stars/NOVA.webp' }
      ];

      for (const star of starImages) {
        try {
          const starPromise = new Promise(async (resolve) => {
            try {
              const response = await fetch(star.path);
              if (response.ok) {
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                cache.stars[star.key] = blobUrl;

                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = blobUrl;
              } else {
                resolve(false);
              }
            } catch (error) {
              console.warn(`ไม่สามารถโหลดภาพดาว: ${star.path}`, error);
              resolve(false);
            }
          });

          // ตั้ง timeout 10 วินาที
          const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 10000));

          const result = await Promise.race([starPromise, timeoutPromise]);

          if (!result) {
            failedCount++;
          }
          updateProgress();
        } catch (error) {
          console.warn(`ไม่สามารถโหลดภาพดาว: ${star.path}`, error);
          failedCount++;
          updateProgress();
        }
      }

      if (failedCount > 0) {
        console.warn(`การโหลดเสร็จสิ้น แต่มี ${failedCount} ไฟล์ที่ไม่สามารถโหลดได้`);
      }

      if (typeof window !== 'undefined') {
        window.appCache.loaded = true;
      }

      setStatusText('โหลดเสร็จสิ้น กำลังเริ่มต้น...');
      setIsComplete(true);
      setTimeout(() => onLoadComplete(), 800);
    };

    preloadMedia();
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* วิดีโอพื้นหลัง */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="absolute w-full h-full object-cover"
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* แสดง Logo */}
      <div className="flex justify-center space-x-2 mb-8 mt-4 z-10">
        <motion.img
          src="/logo/Aster.webp"
          alt="Logo 1"
          className="w-12 h-12 object-contain"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.img
          src="/logo/Cassiopeia.webp"
          alt="Logo 2"
          className="w-12 h-12 object-contain"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        <motion.img
          src="/logo/Estella.webp"
          alt="Logo 3"
          className="w-12 h-12 object-contain"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.img
          src="/logo/Lyra.webp"
          alt="Logo 4"
          className="w-12 h-12 object-contain"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
        <motion.img
          src="/logo/Nova.webp"
          alt="Logo 5"
          className="w-12 h-12 object-contain"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        />
      </div>

      <motion.div
        className="mb-6 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className={`text-aquamarine ${isMobile ? 'text-6xl' : 'text-4xl'} text-white font-bold mb-2`}
          animate={{
            textShadow: [
              '15 15 30px rgba(79, 209, 197, 0.5)',
              '30 30 15px rgba(79, 209, 197, 0.8)',
              '15 15 30px rgba(79, 209, 197, 0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ textShadow: '0 0 10px rgba(79, 209, 197, 0.8)' }}
        >
          Galactic self
        </motion.div>
        <motion.div
          className="text-white text-lg mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="text-2xl"> ค้นพบดวงดาวของคุณ </span><br/>
          <span className="text-[#00bcd4] text-xs">www.galactic-self.vercel.app</span> <br/>
          <span className="text-xs">by</span><span className="text-xs text-[#C3002F]"> Thammasat</span><span className="text-xs text-[#FFD13F]"> University</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="text-green-400 text-xl mb-2 z-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={statusText}
      >
        {statusText}
      </motion.div>

      <motion.div
        className="text-white text-lg mb-4 z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        ({progress}%)
      </motion.div>

      {/* Loading Gauge */}
      <motion.div
        className={`${isMobile ? 'w-64' : 'w-80'} h-5 bg-gray-800 rounded-full overflow-hidden shadow-lg z-10`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          style={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          {progress > 5 && (
            <motion.div
              className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ x: ["0%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ opacity: 0.4 }}
            />
          )}
        </motion.div>
      </motion.div>

      <motion.div
        className="text-white text-sm mt-2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.6 }}
      >
        โหลดแล้ว {loadedItems} จาก {totalItems} ไฟล์
      </motion.div>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="text-green-400 mt-4 z-10 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              y: { repeat: Infinity, duration: 1.2 },
              opacity: { duration: 0.3 }
            }}
          >
            โหลดเสร็จสิ้น กำลังเริ่มต้น...
            <br/><br/><br/>
            <span className='text-white'>Dev web: jamamaboy(github)</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingScreen;
