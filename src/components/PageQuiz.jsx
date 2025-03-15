// 'use client';

// import { useAppState } from '@/lib/useAppState';
// import { useState, useEffect } from 'react';

// export default function PageQuiz() {
//   const { state, navigateTo, updatePagePoints } = useAppState();
//   const [invisibleButtons, setInvisibleButtons] = useState([]);
//   const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0);

//   // อัปเดต viewportHeight เมื่อหน้าต่างถูกรีไซส์
//   useEffect(() => {
//     const handleResize = () => {
//       setViewportHeight(window.innerHeight);
//     };
//     window.addEventListener('resize', handleResize);
//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   }, []);

//   // สร้างปุ่มโดยอิงจากความสูงของภาพ
//   useEffect(() => {
//     const getButtonPositions = () => {
//       if (state.contentHeight <= 0) return; // ป้องกันการคำนวณถ้าขนาดภาพยังไม่พร้อม

//       const buttonPositions = [50, 58.7, 67.4, 76.5, 85]; // เปอร์เซ็นต์จากขอบบนของภาพ
//       const buttonHeightPercent = 7; // ความสูงปุ่ม 7% ของภาพ

//       // คำนวณ offset (ช่องว่างด้านบนของภาพ)
//       const offset = (viewportHeight - state.contentHeight) / 2;

//       const buttons = buttonPositions.map((position, index) => {
//         const topPx = offset + (position / 100 * state.contentHeight);
//         const heightPx = (buttonHeightPercent / 100 * state.contentHeight);

//         return {
//           top: topPx,
//           height: heightPx,
//           index: index + 1,
//         };
//       });

//       setInvisibleButtons(buttons);
//     };

//     // เรียกเมื่อมี contentHeight
//     if (state.contentHeight > 0) {
//       getButtonPositions();
//     }
//   }, [state.page, state.contentHeight, viewportHeight]);

//   const handleClick = (additionalPoint, buttonIndex) => {
//     updatePagePoints(state.page, additionalPoint, buttonIndex);
//     navigateTo(1);
//   };

//   const getPointsForPage = (page, buttonIndex) => {
//     const pointsMap = {
//       5: [1.5, 0.8, 1.2, 1.0, 2.0],
//       7: [2.0, 1.2, 1.5, 1.0, 0.8],
//       9: [1.0, 1.2, 2.0, 0.8, 1.5],
//       14: [1.2, 2.0, 1.0, 1.5, 0.8],
//       18: [0.8, 1.0, 2.0, 1.2, 1.5],
//     };
//     return pointsMap[page]?.[buttonIndex - 1] || 0;
//   };

//   return (
//     <div className="absolute inset-0 z-20 pointer-events-none">
//       {[5, 7, 9, 14, 18].includes(state.page) && (
//         <div className="relative w-full h-full">
//           {invisibleButtons.map((button) => (
//             <button
//               key={button.index}
//               onClick={() => handleClick(getPointsForPage(state.page, button.index), button.index)}
//               className="absolute w-full pointer-events-auto"
//               style={{
//                 top: `${button.top}px`,
//                 height: `${button.height}px`,
//                 backgroundColor: 'transparent',
//                 border: 'none',
//                 outline: 'none',
//               }}
//               aria-label={`Option ${button.index}`}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useAppState } from '@/lib/useAppState';
import { useState, useEffect } from 'react';

export default function PageQuiz() {
  const { state, navigateTo, updatePagePoints } = useAppState();
  const [invisibleButtons, setInvisibleButtons] = useState([]);
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0);

  // อัปเดต viewportHeight เมื่อหน้าต่างถูกรีไซส์
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // ฟังก์ชันคำนวณตำแหน่งปุ่ม
  const calculateButtonPositions = () => {
    if (state.contentHeight <= 0) return;

    const buttonPositions = [50, 58.7, 67.4, 76.5, 85]; // เปอร์เซ็นต์จากขอบบนของภาพ
    const buttonHeightPercent = 7; // ความสูงปุ่ม 7% ของภาพ
    const offset = (viewportHeight - state.contentHeight) / 2;

    const buttons = buttonPositions.map((position, index) => {
      const topPx = offset + (position / 100 * state.contentHeight);
      const heightPx = (buttonHeightPercent / 100 * state.contentHeight);

      return {
        top: topPx,
        height: heightPx,
        index: index + 1,
      };
    });

    setInvisibleButtons(buttons);
  };

  // คำนวณตำแหน่งปุ่มเมื่อ state.contentHeight หรือ viewportHeight เปลี่ยน
  useEffect(() => {
    calculateButtonPositions();
  }, [state.contentHeight, viewportHeight, state.page]);

  const handleClick = (additionalPoint, buttonIndex) => {
    updatePagePoints(state.page, additionalPoint, buttonIndex);
    navigateTo(1);
  };

  const getPointsForPage = (page, buttonIndex) => {
    const pointsMap = {
      5: [1.5, 0.8, 1.2, 1.0, 2.0],
      7: [2.0, 1.2, 1.5, 1.0, 0.8],
      9: [1.0, 1.2, 2.0, 0.8, 1.5],
      14: [1.2, 2.0, 1.0, 1.5, 0.8],
      18: [0.8, 1.0, 2.0, 1.2, 1.5],
    };
    return pointsMap[page]?.[buttonIndex - 1] || 0;
  };

  // ถ้า contentHeight ยังไม่พร้อม ไม่ต้อง render ปุ่ม
  if (state.contentHeight <= 0) {
    return null; // หรือแสดง loading state
  }

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="relative w-full h-full">
        {invisibleButtons.map((button) => (
          <button
            key={button.index}
            onClick={() => handleClick(getPointsForPage(state.page, button.index), button.index)}
            className="absolute w-full pointer-events-auto"
            style={{
              top: `${button.top}px`,
              height: `${button.height}px`,
              backgroundColor: 'transparent', // เปลี่ยนเป็นสีชั่วคราวเพื่อ debug ได้ เช่น 'rgba(255, 0, 0, 0.3)'
              border: 'none',
              outline: 'none',
            }}
            aria-label={`Option ${button.index}`}
          />
        ))}
      </div>
    </div>
  );
}
