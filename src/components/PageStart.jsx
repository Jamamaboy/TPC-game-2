'use client';

import { useAppState } from '@/lib/useAppState';

export default function PageStart() {
  const { state, navigateTo } = useAppState();

  const handleClick = () => {
    navigateTo(1, 0);
  };

  return (
    <div
      className="grid z-1 justify-items-center items-center"
      style={{ height: `${state.contentHeight}px`, width: `${state.contentWidth}px` }}
    >
      <button
        onClick={handleClick}
        className="w-full h-full bg-transparent border-none outline-none appearance-none"
        style={{
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          objectFit: 'contain',
          fontSize: '1px',
        }}
      ></button>
    </div>
  );
}
