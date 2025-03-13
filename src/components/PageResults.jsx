'use client';

import { useAppState } from '@/lib/useAppState';

export default function PageResults({ starImageSrc }) {
  const { resetGame } = useAppState();

  const downloadImage = () => {
    // ตรวจสอบว่ามีรูปภาพให้ดาวน์โหลดหรือไม่
    if (!starImageSrc) {
      console.error('No star image available to download');
      return;
    }

    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = starImageSrc;
    link.download = `Star⭐.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-10">
      <div
        className="w-full grid grid-cols-2 gap-4 p-4"
        style={{
          background: 'linear-gradient(to bottom, rgba(12, 30, 80, 0.95), rgba(2, 7, 30, 0.95))',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <button
          onClick={resetGame}
          className="font-[CloudLoop] text-base w-full py-2 px-4 text-black border border-black rounded-2xl bg-white transition-colors duration-300 shadow-md"
          style={{
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            outline: 'none',
            appearance: 'none'
          }}
        >
          ReStart Game
        </button>

        <button
          onClick={downloadImage}
          className="font-[CloudLoop] font-semibold w-full py-2 px-4 text-black border border-black rounded-2xl bg-white transition-colors duration-300 shadow-md"
          style={{
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            outline: 'none',
            appearance: 'none'
          }}
        >
          Download Image
        </button>
      </div>
    </div>
  );
}
