// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// // ใช้ window.appCache หรือตัวแปร global เพื่อให้ทุก component เข้าถึงได้
// if (typeof window !== 'undefined' && !window.appCache) {
//   window.appCache = {
//     images: {},
//     videos: {},
//     stars: {}, // เพิ่ม cache สำหรับภาพดาว
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

//     // ไม่ทำ cache สำหรับวิดีโอในหน้า loading
//     videoRef.current.src = '/videos/layer0/2.webm';
//     videoRef.current.load();

//     // เล่นวิดีโอโดยอัตโนมัติเมื่อโหลดเสร็จ
//     videoRef.current.onloadeddata = () => {
//       videoRef.current.play().catch(err => {
//         console.warn('Auto-play prevented:', err);
//         // User interaction might be needed to play video
//         document.addEventListener('click', () => {
//           videoRef.current?.play().catch(e => console.log('Play error:', e));
//         }, { once: true });
//       });
//     };
//   }, []);

//   useEffect(() => {
//     // จำนวนไฟล์ทั้งหมดที่ต้องโหลด: 21 ภาพ + 21 วิดีโอ + 5 star images
//     const imageCount = 21;
//     const videoCount = 21;
//     const starCount = 5;
//     const totalFilesToLoad = imageCount + videoCount + starCount;
//     setTotalItems(totalFilesToLoad);

//     // ถ้าเคยโหลดแล้ว ให้ข้ามไปเลย
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

//       // สร้างฟังก์ชันสำหรับอัปเดตความคืบหน้า
//       const updateProgress = () => {
//         loadedCount++;
//         const currentProgress = Math.floor((loadedCount / totalFilesToLoad) * 100);
//         setProgress(currentProgress);
//         setLoadedItems(loadedCount);
//       };

//       // โหลดภาพทั้งหมด
//       setStatusText('กำลังโหลดรูปภาพ...');
//       for (let i = 1; i <= imageCount; i++) {
//         const imgPath = `/images/layer1/${i}.webp`;

//         try {
//           // สร้าง Blob URL จากการใช้ fetch เพื่อให้เก็บไว้ใน cache
//           const response = await fetch(imgPath);
//           const blob = await response.blob();
//           const blobUrl = URL.createObjectURL(blob);

//           // เก็บ blob URL ไว้ใน cache
//           cache.images[i] = blobUrl;

//           // ทดสอบว่าโหลดได้จริง
//           const img = new Image();
//           img.src = blobUrl;
//           await new Promise((resolve) => {
//             img.onload = resolve;
//             img.onerror = resolve; // แม้จะเกิดข้อผิดพลาดก็ให้ทำงานต่อ
//           });

//           updateProgress();
//         } catch (error) {
//           console.warn(`ไม่สามารถโหลดภาพ: ${imgPath}`, error);
//           failedCount++;
//           updateProgress();
//         }
//       }

//       // โหลดวิดีโอทั้งหมด
//       setStatusText('กำลังโหลดวิดีโอ...');
//       for (let i = 1; i <= videoCount; i++) {
//         const videoPath = `/videos/layer0/${i}.webm`;

//         try {
//           // สร้าง Blob URL จากการใช้ fetch เพื่อให้เก็บไว้ใน cache
//           const response = await fetch(videoPath);
//           const blob = await response.blob();
//           const blobUrl = URL.createObjectURL(blob);

//           // เก็บ blob URL ไว้ใน cache
//           cache.videos[i] = blobUrl;

//           // ทดสอบว่าโหลดได้จริง โดยโหลดแค่ metadata
//           const video = document.createElement('video');
//           video.preload = 'metadata';
//           video.muted = true;
//           video.src = blobUrl;

//           await new Promise((resolve) => {
//             video.onloadedmetadata = resolve;
//             video.onerror = resolve; // แม้จะเกิดข้อผิดพลาดก็ให้ทำงานต่อ
//             video.load();
//           });

//           updateProgress();
//         } catch (error) {
//           console.warn(`ไม่สามารถโหลดวิดีโอ: ${videoPath}`, error);
//           failedCount++;
//           updateProgress();
//         }
//       }

//       // โหลดภาพดาว
//       setStatusText('กำลังโหลดภาพดาว...');
//       const starImages = [
//         { key: 'ASTER', path: '/images/stars/ASTER.png' },
//         { key: 'CASSIOPHIA', path: '/images/stars/CASSIOPHIA.png' },
//         { key: 'ESTELLA', path: '/images/stars/ESTELLA.png' },
//         { key: 'LYNA', path: '/images/stars/LYNA.png' },
//         { key: 'NOVA', path: '/images/stars/NOVA.png' }
//       ];

//       for (const star of starImages) {
//         try {
//           // สร้าง Blob URL จากการใช้ fetch เพื่อให้เก็บไว้ใน cache
//           const response = await fetch(star.path);
//           const blob = await response.blob();
//           const blobUrl = URL.createObjectURL(blob);

//           // เก็บ blob URL ไว้ใน cache
//           cache.stars[star.key] = blobUrl;

//           // ทดสอบว่าโหลดได้จริง
//           const img = new Image();
//           img.src = blobUrl;
//           await new Promise((resolve) => {
//             img.onload = resolve;
//             img.onerror = resolve; // แม้จะเกิดข้อผิดพลาดก็ให้ทำงานต่อ
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

//       // ตั้งค่าว่าโหลดเสร็จแล้ว
//       if (typeof window !== 'undefined') {
//         window.appCache.loaded = true;
//       }

//       setStatusText('โหลดเสร็จสิ้น กำลังเริ่มต้น...');
//       setIsComplete(true);

//       // เพิ่ม delay เล็กน้อยเพื่อให้แน่ใจว่า gauge แสดง 100% ก่อนที่จะหายไป
//       setTimeout(() => {
//         onLoadComplete();
//       }, 800);
//     };

//     // เริ่มกระบวนการโหลด
//     preloadMedia();
//   }, [onLoadComplete]);

//   return (
//     <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
// 		{/* วิดีโอพื้นหลัง */}
// 		<div className="absolute inset-0 z-0">
// 			<video
// 				ref={videoRef}
// 				className="absolute w-full h-full object-cover"
// 				muted
// 				loop
// 				playsInline
// 				src="/videos/layer0/2.webm" />
// 			<div className="absolute inset-0 bg-black bg-opacity-40"></div>
// 		</div>

// 		  {/* แสดง Logo */}
// 	<div className="flex justify-center space-x-2 mb-8 mt-4 z-10">
// 		<motion.img
// 			src="/logo/Aster.webp"
// 			alt="Logo 1"
// 			className="w-12 h-12 object-contain"
// 			initial={{ opacity: 0, y: -20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.5 }} />
// 		<motion.img
// 			src="/logo/Cassiopeia.webp"
// 			alt="Logo 2"
// 			className="w-12 h-12 object-contain"
// 			initial={{ opacity: 0, y: -20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.5, delay: 0.1 }} />
// 		<motion.img
// 			src="/logo/Estella.webp"
// 			alt="Logo 3"
// 			className="w-12 h-12 object-contain"
// 			initial={{ opacity: 0, y: -20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.5, delay: 0.2 }} />
// 		<motion.img
// 			src="/logo/Lyra.webp"
// 			alt="Logo 4"
// 			className="w-12 h-12 object-contain"
// 			initial={{ opacity: 0, y: -20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.5, delay: 0.3 }} />
// 		<motion.img
// 			src="/logo/Nova.webp"
// 			alt="Logo 5"
// 			className="w-12 h-12 object-contain"
// 			initial={{ opacity: 0, y: -20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.5, delay: 0.4 }} />
// 		</div>

// 		<motion.div
// 			className="mb-6 text-center z-10"
// 			initial={{ opacity: 0, y: 20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.8 }}
// 		>
// 		<motion.div
// 				className={text - aquamarine} $ {...isMobile ? 'text-3xl' : 'text-4xl'} font-bold mb-2 />}
// 			animate={{
// 				textShadow: [
// 					'0 0 0px rgba(79, 209, 197, 0.5)',
// 					'0 0 15px rgba(79, 209, 197, 0.8)',
// 					'0 0 0px rgba(79, 209, 197, 0.5)'
// 				]
// 			}}
// 			transition={{ duration: 2, repeat: Infinity }}
// 			style={{ textShadow: '0 0 10px rgba(79, 209, 197, 0.8)' }}
// 			>
// 			STAR QUIZ
// 		</motion.div>
// 		<motion.div
// 			className="text-white text-lg mb-6"
// 			initial={{ opacity: 0 }}
// 			animate={{ opacity: 1 }}
// 			transition={{ delay: 0.3, duration: 0.8 }}
// 		>
// 			ค้นพบดวงดาวของคุณ
// 			</motion.div>
// 		</motion.div>

// 		<motion.div className="text-white text-xl mb-2 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={statusText} // ทำให้มี animation ใหม่เมื่อข้อความเปลี่ยน
// 		>
// 			{statusText}
// 		</motion.div>

// 		<motion.div
// 			className="text-white text-lg mb-4 z-10"
// 			initial={{ scale: 0.8, opacity: 0 }}
// 			animate={{ scale: 1, opacity: 1 }}
// 		>
// 			({progress}%)
// 		</motion.div>


//       {/* Loading Gauge แบบสวยงาม */}
//       <motion.div
//         className={${isMobile ? 'w-64' : 'w-80'} h-5 bg-gray-800 rounded-full overflow-hidden shadow-lg z-10}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <motion.div
//           className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
//           style={{ width: ${progress}% }}
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

  // โหลดและแสดงวิดีโอพื้นหลัง
  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.src = '/videos/layer0/2.webm';
    videoRef.current.load();

    videoRef.current.onloadeddata = () => {
      videoRef.current.play().catch(err => {
        console.warn('Auto-play prevented:', err);
        document.addEventListener('click', () => {
          videoRef.current?.play().catch(e => console.log('Play error:', e));
        }, { once: true });
      });
    };
  }, []);

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
      const cache = typeof window !== 'undefined' ? window.appCache : { images: {}, videos: {} };

      const updateProgress = () => {
        loadedCount++;
        const currentProgress = Math.floor((loadedCount / totalFilesToLoad) * 100);
        setProgress(currentProgress);
        setLoadedItems(loadedCount);
      };

      setStatusText('กำลังโหลดรูปภาพ...');
      for (let i = 1; i <= imageCount; i++) {
        const imgPath = `/images/layer1/${i}.webp`;
        try {
          const response = await fetch(imgPath);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          cache.images[i] = blobUrl;

          const img = new Image();
          img.src = blobUrl;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });

          updateProgress();
        } catch (error) {
          console.warn(`ไม่สามารถโหลดภาพ: ${imgPath}`, error);
          failedCount++;
          updateProgress();
        }
      }

      setStatusText('กำลังโหลดวิดีโอ...');
      for (let i = 1; i <= videoCount; i++) {
        const videoPath = `/videos/layer0/${i}.webm`;
        try {
          const response = await fetch(videoPath);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          cache.videos[i] = blobUrl;

          const video = document.createElement('video');
          video.preload = 'metadata';
          video.muted = true;
          video.src = blobUrl;

          await new Promise((resolve) => {
            video.onloadedmetadata = resolve;
            video.onerror = resolve;
            video.load();
          });

          updateProgress();
        } catch (error) {
          console.warn(`ไม่สามารถโหลดวิดีโอ: ${videoPath}`, error);
          failedCount++;
          updateProgress();
        }
      }

      setStatusText('กำลังโหลดภาพดาว...');
      const starImages = [
        { key: 'ASTER', path: '/images/stars/ASTER.png' },
        { key: 'CASSIOPHIA', path: '/images/stars/CASSIOPHIA.png' },
        { key: 'ESTELLA', path: '/images/stars/ESTELLA.png' },
        { key: 'LYNA', path: '/images/stars/LYNA.png' },
        { key: 'NOVA', path: '/images/stars/NOVA.png' }
      ];

      for (const star of starImages) {
        try {
          const response = await fetch(star.path);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          cache.stars[star.key] = blobUrl;

          const img = new Image();
          img.src = blobUrl;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });

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
        <div className="absolute inset-0  bg-opacity-40"></div>
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
          <spen className="text-2xl"> ค้นพบดวงดาวของคุณ </spen><br/>
		  <span className="text-[#00bcd4] text-xs">www.galactic-self.vercel.app</span> <br/>
		  <spen className="text-xs">by</spen><span className=" text-xs text-[#C3002F] "> Thammasat</span><span className=" text-xs text-[#FFD13F] "> University</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="text-green-400 text-xl mb-2 z-10 size-xl"
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
            className="text-green-400 mt-4 z-10"
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
