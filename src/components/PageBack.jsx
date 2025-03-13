'use client';

import { useAppState } from '@/lib/useAppState';

export default function PageBack() {
  const { state, navigateTo } = useAppState();

  const handleClick = () => {
    navigateTo(1, 0);
  };

  return (
    <div
      className="grid z-1 justify-items-center items-center relative"
      style={{
        height: `${state.contentHeight}px`,
        width: `${state.contentWidth}px`,
        gridTemplateColumns: '1fr'
      }}
    >
      <button
        onClick={handleClick}
        className="w-full h-full bg-transparent border-none outline-none appearance-none"
        style={{
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          objectFit: 'contain'
        }}
      ></button>
    </div>
  );
}
