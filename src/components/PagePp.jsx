'use client';

import { useAppState } from '@/lib/useAppState';
import { useEffect, useState } from 'react';

export default function PagePp() {
  const { state, navigateTo } = useAppState();
  const [showButton, setShowButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // แสดงปุ่มหลังจากรอสักครู่
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // ฟังก์ชันเพื่อหาประเภทดาวจากคะแนนรวม
  const determineStarType = (totalPoints) => {
    if (totalPoints >= 0 && totalPoints <= 5.70) {
      return 'ASTER';
    } else if (totalPoints > 5.70 && totalPoints <= 6.20) {
      return 'CASSIOPHIA';
    } else if (totalPoints > 6.20 && totalPoints <= 6.70) {
      return 'ESTELLA';
    } else if (totalPoints > 6.70 && totalPoints <= 7.30) {
      return 'LYNA';
    } else {
      return 'NOVA';
    }
  };

  // ฟังก์ชันสำหรับส่งข้อมูลคะแนนไปยัง MongoDB และนำทางไปยังหน้าผลลัพธ์
  const handleClick = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // คำนวณคะแนนรวม
      const totalPoints = state.points.reduce((acc, curr) => acc + curr, 0);
      const starType = determineStarType(totalPoints);

      // เตรียมข้อมูลที่จะส่งไปยัง API
      const scoreData = {
        points: state.points,
        pagePoints: state.pagePoints,
        totalScore: totalPoints,
        starType: starType
      };

      // ส่งข้อมูลไปยัง API
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save score');
      }

      console.log('Score saved successfully:', result);

      // นำทางไปยังหน้าผลลัพธ์ (หน้า 21)
      navigateTo(1);

    } catch (err) {
      console.error('Error saving score:', err);
      setError(err.message || 'An error occurred');
      // ถึงแม้จะมีข้อผิดพลาด เรายังคงนำทางไปยังหน้าผลลัพธ์
      navigateTo(1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="grid z-20 justify-items-center items-center"
      style={{
        height: `${state.contentHeight}px`,
        width: `${state.contentWidth}px`,
        gridTemplateRows: '55% 39% 10%'
      }}
    >
      <div className="h-full"></div>

      {showButton && (
        <button
          onClick={handleClick}
          disabled={isLoading}
          className="font-[CloudLoop] text-20xl font-semibold w-[300px] h-[60px] cursor-pointer outline-none text-white rounded-2xl px-4 py-1 shadow-md transition-shadow duration-250 z-20"
          style={{
            backgroundImage: 'linear-gradient(45deg, #4568dc, #b06ab3)',
            boxShadow: '1px 1px 10px rgba(255, 255, 255, 0.438)',
            transform: 'translate(0)',
            WebkitTransform: 'translate(0)',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Saving...' : 'กดเพื่อพบกับแสงของตนเอง'}
        </button>
      )}

      {error && (
        <div className="text-red-500 text-xs mt-1">
          {error}
        </div>
      )}

      <div className="h-full"></div>
    </div>
  );
}
