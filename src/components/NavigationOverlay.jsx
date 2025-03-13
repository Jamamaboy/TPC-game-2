'use client';

import { useAppState } from '@/lib/useAppState';

export default function NavigationOverlay() {
  const { navigateTo } = useAppState();

  const handleClick = () => {
    navigateTo(1, 0);
  };

  return (
    <div className="absolute inset-0 w-full h-full z-10" style={{ pointerEvents: 'auto' }}
      onClick={handleClick}
    >
      {/* คลิกที่ใดก็ได้บนหน้าจอเพื่อไปยังหน้าถัดไป */}
    </div>
  );
}
