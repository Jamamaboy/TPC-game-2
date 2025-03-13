'use client';

import { useAppState } from '@/lib/useAppState';
import { useState, useEffect } from 'react';

export default function PageQuiz() {
  const { state, navigateTo, updatePagePoints } = useAppState();
  const [invisibleButtons, setInvisibleButtons] = useState([]);

  // สร้างปุ่มแบบ invisible ที่ตรงกับตำแหน่งตัวเลือกในรูปภาพ
  useEffect(() => {
    const getButtonPositions = () => {
      const buttonPositions = [52, 62, 72, 82, 92];
      const buttonHeight = 8; // ความสูงของปุ่มประมาณ 8% ของความสูงหน้าจอ

      // สร้างข้อมูลปุ่มจากตำแหน่งที่กำหนด
      const buttons = buttonPositions.map((position, index) => ({
        top: `${position - buttonHeight/2}%`, // ปรับให้ปุ่มอยู่ตรงกลางของตำแหน่งที่กำหนด
        height: `${buttonHeight}%`,
        index: index + 1
      }));

      setInvisibleButtons(buttons);

      console.log(`Quiz Page ${state.page}: Setting up invisible buttons`);
      console.log(`Button positions: ${buttonPositions.join('%, ')}%`);
      console.log(`Button height: ${buttonHeight}%`);
    };

    getButtonPositions();
  }, [state.page]);

  const handleClick = (additionalPoint, buttonIndex) => {
    console.log(`Quiz Page ${state.page}: Button ${buttonIndex} clicked`);
    console.log(`Points awarded: ${additionalPoint}`);

    // อัปเดตคะแนนสำหรับหน้านี้โดยเฉพาะ
    updatePagePoints(state.page, additionalPoint, buttonIndex);

    // ไปยังหน้าถัดไป
    navigateTo(1);
  };

  // Points mapping from the original app
  const getPointsForPage = (page, buttonIndex) => {
    const pointsMap = {
      // Page 5 points
      5: [1.5, 0.8, 1.2, 1.0, 2.0],
      // Page 7 points
      7: [2.0, 1.2, 1.5, 1.0, 0.8],
      // Page 9 points
      9: [1.0, 1.2, 2.0, 0.8, 1.5],
      // Page 14 points (was 13 in the original)
      14: [1.2, 2.0, 1.0, 1.5, 0.8],
      // Page 18 points (was 15 in the original)
      18: [0.8, 1.0, 2.0, 1.2, 1.5]
    };

    // Return the point value for the current page and button
    if (pointsMap[page] && pointsMap[page][buttonIndex - 1] !== undefined) {
      return pointsMap[page][buttonIndex - 1];
    }

    return 0;
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* แสดงปุ่มล่องหนเฉพาะในหน้า Quiz */}
      {[5, 7, 9, 14, 18].includes(state.page) && (
        <div className="relative w-full h-full">
          {invisibleButtons.map((button) => (
            <button
              key={button.index}
              onClick={() => handleClick(getPointsForPage(state.page, button.index), button.index)}
              className="absolute w-full pointer-events-auto"
              style={{
                top: button.top,
                height: button.height,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none'
              }}
              aria-label={`Option ${button.index}`}
            >
              {/* ถ้าต้องการแสดงตัวเลือกเพื่อการตรวจสอบ (debug) ให้เปิด comment บรรทัดนี้ */}
              {/* <span className="bg-white bg-opacity-20 border border-white border-opacity-30 p-2 rounded">Option {button.index}</span> */}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
