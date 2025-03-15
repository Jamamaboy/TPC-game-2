'use client';
import { useAppState } from '@/lib/useAppState';
import { useState, useEffect, useRef } from 'react';

export default function PageQuiz() {
  const { state, navigateTo, updatePagePoints } = useAppState();
  const [invisibleButtons, setInvisibleButtons] = useState([]);
  const [contentReady, setContentReady] = useState(false);
  const observerRef = useRef(null);
  const timeoutRef = useRef(null);

  // ฟังก์ชันสำหรับหา element รูปภาพในหน้าปัจจุบัน
  const findImageElement = () => {
    // หารูปภาพที่กำลังแสดงอยู่
    const imageElement = document.querySelector('img[alt^="Page"]');
    return imageElement;
  };

  // ฟังก์ชันสำหรับคำนวณตำแหน่งจากรูปภาพที่แสดงอยู่
  const calculateFromActualImage = () => {
    const imageElement = findImageElement();
    if (!imageElement) {
      console.warn("Cannot find image element");
      return;
    }

    // ใช้ getBoundingClientRect เพื่อรับตำแหน่งและขนาดที่แท้จริงของรูปภาพ
    const rect = imageElement.getBoundingClientRect();

    console.log("Actual image dimensions:", {
      top: rect.top,
      left: rect.left,
      height: rect.height,
      width: rect.width
    });

    // คำนวณตำแหน่งปุ่มโดยอิงจากความสูงและตำแหน่งจริงของรูปภาพ
    calculateButtonPositions(rect);
  };

  // ฟังก์ชันคำนวณตำแหน่งปุ่ม
  const calculateButtonPositions = (imgRect) => {
    if (!imgRect || !imgRect.height || imgRect.height <= 0) {
      console.warn("Invalid image dimensions for button calculation");
      return;
    }

    console.log("Calculating buttons based on actual image:", {
      imageRect: imgRect
    });

    const buttonPositions = [50, 58.75, 67.45, 76.55, 85.55]; // เปอร์เซ็นต์จากขอบบนของภาพ
    const buttonHeightPercent = 7; // ความสูงปุ่น 7% ของภาพ

    const buttons = buttonPositions.map((position, index) => {
      // คำนวณตำแหน่งจากขอบบนของรูปภาพ + ตำแหน่งเปอร์เซ็นต์ของปุ่ม
      const topPx = imgRect.top + (position / 100 * imgRect.height);
      const heightPx = (buttonHeightPercent / 100 * imgRect.height);

      return {
        top: topPx,
        left: imgRect.left,
        width: imgRect.width,
        height: heightPx,
        index: index + 1,
      };
    });

    console.log("New button positions:", buttons);
    setInvisibleButtons(buttons);
    setContentReady(true);
  };

  // ติดตั้ง Resize Observer เพื่อติดตามการเปลี่ยนแปลงขนาดของรูปภาพ
  useEffect(() => {
    // กำหนดฟังก์ชันที่จะใช้กับ Observer
    const observerCallback = () => {
      // ใช้ timeout เพื่อให้แน่ใจว่ารูปภาพได้ render เสร็จสมบูรณ์แล้ว
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        calculateFromActualImage();
      }, 100);
    };

    // ตรวจสอบว่า ResizeObserver ใช้ได้ในเบราวเซอร์นี้หรือไม่
    if (typeof ResizeObserver !== 'undefined') {
      observerRef.current = new ResizeObserver(observerCallback);

      // ค้นหารูปภาพและเริ่มการสังเกตเมื่อพบ
      const imageElement = findImageElement();
      if (imageElement) {
        observerRef.current.observe(imageElement);
        console.log("Started observing image element");
      } else {
        console.warn("Image element not found for observation");
        // ถ้าไม่พบรูปภาพทันที ลองค้นหาอีกครั้งหลังจากรอสักครู่
        setTimeout(() => {
          const retryImage = findImageElement();
          if (retryImage) {
            observerRef.current.observe(retryImage);
            console.log("Started observing image element (retry)");
          }
        }, 500);
      }
    } else {
      // ถ้า ResizeObserver ไม่พร้อมใช้งาน ใช้วิธี timeout แทน
      timeoutRef.current = setTimeout(calculateFromActualImage, 500);

      // และใช้ window resize เป็นตัว fallback
      window.addEventListener('resize', calculateFromActualImage);
    }

    // คำนวณตำแหน่งปุ่มเมื่อหน้าโหลดเสร็จ
    timeoutRef.current = setTimeout(calculateFromActualImage, 200);

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('resize', calculateFromActualImage);
    };
  }, [state.page]); // ทำเมื่อเปลี่ยนหน้าเท่านั้น

  // เพิ่ม event listener สำหรับการโหลดรูปภาพ
  useEffect(() => {
    const handleImageLoad = () => {
      console.log("Image loaded event detected");
      calculateFromActualImage();
    };

    // เพิ่ม event listener สำหรับรูปภาพที่โหลดแล้ว
    window.addEventListener('load', handleImageLoad);
    document.addEventListener('DOMContentLoaded', handleImageLoad);

    // ตรวจสอบรูปภาพที่อาจโหลดเสร็จแล้ว
    const imageElement = findImageElement();
    if (imageElement && imageElement.complete) {
      console.log("Image already loaded, calculating positions");
      calculateFromActualImage();
    }

    return () => {
      window.removeEventListener('load', handleImageLoad);
      document.removeEventListener('DOMContentLoaded', handleImageLoad);
    };
  }, [state.page]);

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

  // ถ้ายังไม่พร้อมแสดงปุ่ม
  if (!contentReady || invisibleButtons.length === 0) {
    return (
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* ซ่อน loading เพื่อไม่ให้กระพริบ */}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      <div className="relative w-full h-full">
        {invisibleButtons.map((button) => (
          <button
            key={button.index}
            onClick={() => handleClick(getPointsForPage(state.page, button.index), button.index)}
            className="absolute pointer-events-auto"
            style={{
              top: `${button.top}px`,
              left: `${button.left}px`,
              width: `${button.width}px`,
              height: `${button.height}px`,
              backgroundColor: 'transparent', // เปลี่ยนเป็นสีชั่วคราวเพื่อ debug ได้ เช่น 'rgba(255, 0, 0, 0.3)'
              // backgroundColor: 'rgba(255, 0, 0, 0.1)', // ใช้เพื่อ debug
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
