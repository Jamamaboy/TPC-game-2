'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// LocalStorage key
const STORAGE_KEY = 'star_quiz_state';

// ฟังก์ชันโหลดข้อมูลจาก localStorage
const loadStateFromStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);

      // คืนค่าเฉพาะข้อมูลที่ต้องการเก็บ และกำหนดค่าเริ่มต้นสำหรับหน้าและประวัติ
      return {
        ...parsedState,
        page: 1,         // ให้เริ่มที่หน้า 1 เสมอเมื่อรีเฟรช
        history: [1]     // ล้างประวัติและให้เริ่มใหม่ที่หน้า 1
      };
    }
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
  }

  return null;
};

// ฟังก์ชันบันทึกข้อมูลลง localStorage
const saveStateToStorage = (state) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // เก็บเฉพาะข้อมูลที่จำเป็น ไม่เก็บหน้าปัจจุบันและประวัติ
    const stateToSave = {
      points: state.points,
      pagePoints: state.pagePoints,
      contentHeight: state.contentHeight,
      contentWidth: state.contentWidth
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
};

const initialState = {
  page: 1,
  points: [0],
  pagePoints: {}, // เก็บคะแนนแยกตามหน้า { pageNumber: { points: number, buttonIndex: number } }
  history: [1], // เริ่มต้นที่หน้า 1
  contentHeight: 0,
  contentWidth: 0
};

// Pages where keyboard/swipe navigation should be disabled
const NAVIGATION_DISABLED_PAGES = [5, 7, 9, 14, 18, 21];

const AppStateContext = createContext(undefined);

export function AppStateProvider({ children }) {
  // โหลดข้อมูลจาก localStorage ถ้ามี
  const savedState = loadStateFromStorage();
  const [state, setState] = useState(savedState || initialState);

  // บันทึกข้อมูลลง localStorage เมื่อ state เปลี่ยนแปลง
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // ฟังก์ชันสำหรับไปยังหน้าถัดไป
  const navigateTo = useCallback((pageIncrement, additionalPoint) => {
    setState(prev => {
      // คำนวณหน้าถัดไป
      const nextPage = prev.page + pageIncrement;

      // เพิ่มคะแนนถ้ามี (เฉพาะกรณีที่ไม่ใช้ updatePagePoints)
      const newPoints = [...prev.points];
      if (additionalPoint && additionalPoint > 0) {
        newPoints.push(additionalPoint);
      }

      // เพิ่มหน้าปัจจุบันเข้าไปในประวัติก่อนที่จะเปลี่ยนไปหน้าใหม่
      const newHistory = [...prev.history];

      // ตรวจสอบว่าหน้าปัจจุบันได้ถูกเพิ่มเข้าไปในประวัติแล้วหรือไม่
      if (newHistory[newHistory.length - 1] !== prev.page) {
        newHistory.push(prev.page);
      }

      console.log('Navigate forward:', {
        from: prev.page,
        to: nextPage,
        newHistory: newHistory
      });

      return {
        ...prev,
        page: nextPage,
        points: newPoints,
        history: newHistory,
      };
    });
  }, []);

  // ฟังก์ชันสำหรับบันทึกคะแนนเฉพาะหน้า
  const updatePagePoints = useCallback((pageNumber, points, buttonIndex) => {
    setState(prev => {
      // อัปเดตคะแนนสำหรับหน้านี้
      const newPagePoints = {
        ...prev.pagePoints,
        [pageNumber]: { points, buttonIndex }
      };

      // คำนวณคะแนนรวมใหม่
      const allPagePoints = Object.values(newPagePoints).map(item => item.points);
      const newTotalPoints = [0, ...allPagePoints]; // เริ่มด้วย 0 ตามค่าเริ่มต้น

      console.log('Update page points:', {
        page: pageNumber,
        points,
        buttonIndex,
        allPagePoints,
        totalPoints: newTotalPoints
      });

      return {
        ...prev,
        pagePoints: newPagePoints,
        points: newTotalPoints
      };
    });
  }, []);

  const setContentDimensions = useCallback((height, width) => {
    setState(prev => ({
      ...prev,
      contentHeight: height,
      contentWidth: width
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);

    // ล้างข้อมูลใน localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }

    console.log('Game reset: State cleared');
  }, []);

  // Add keyboard navigation - เฉพาะปุ่มลูกศรขวาเท่านั้น (ไปข้างหน้า)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip keyboard navigation for quiz and result pages
      if (NAVIGATION_DISABLED_PAGES.includes(state.page)) {
        return;
      }

      if (e.key === 'ArrowRight') {
        navigateTo(1, 0);
      }
    };

    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.page, navigateTo]);

  // Add touch swipe navigation - เฉพาะการปัดจากซ้ายไปขวาเท่านั้น (ไปข้างหน้า)
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      // Skip touch navigation for quiz and result pages
      if (NAVIGATION_DISABLED_PAGES.includes(state.page)) {
        return;
      }

      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe

      if (touchStartX - touchEndX > SWIPE_THRESHOLD) {
        // Swipe left to right (go forward)
        navigateTo(1, 0);
      }
    };

    // Add touch event listeners
    window.addEventListener('touchstart', handleTouchStart, false);
    window.addEventListener('touchend', handleTouchEnd, false);

    // Clean up touch event listeners on unmount
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [state.page, navigateTo]);

  // ใช้ useMemo สำหรับค่า context value เพื่อป้องกันการสร้างอ็อบเจกต์ใหม่ในทุก render
  const contextValue = {
    state,
    navigateTo,
    setContentDimensions,
    resetGame,
    updatePagePoints
  };

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
