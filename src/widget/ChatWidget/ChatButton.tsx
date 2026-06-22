import { useEffect, useState } from "react";

interface Props {
  text?: string;
  onClick: () => void;
  onHide: () => void;
}

export const ChatButton = ({ text = "Ask Blues AI a question...", onClick, onHide }: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutText = isMac ? '⌘I' : 'Ctrl-I';

  useEffect(() => {
    // Detect mobile screen size and touch device
    const checkDeviceProperties = () => {
      const isTouchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isTouchCapable);
      setIsMobile(window.innerWidth < 768);
    };

    checkDeviceProperties();
    window.addEventListener('resize', checkDeviceProperties);

    return () => window.removeEventListener('resize', checkDeviceProperties);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        onClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick]);

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHide();
  };

  // Use shorter text on mobile
  const displayText = isMobile ? "Ask Blues AI" : text;
  // Show close button on touch devices or when hovered
  const showCloseButton = isTouchDevice || isHovered;
  // Thicker arrow on mobile
  const arrowStrokeWidth = isMobile ? "3" : "2";

  return (
    <div
      className="fixed bottom-6 z-50"
      style={{ left: '50%', transform: 'translateX(-50%)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <button
          onClick={onClick}
          className="bg-white hover:bg-gray-50 text-gray-600 rounded-lg px-5 py-2.5 cursor-pointer shadow-lg flex items-center gap-4 transition-all duration-500 hover:scale-105"
          style={{ border: '1px solid #D1D5DB' }}
          aria-label={displayText}
        >
          <span className="text-base">{displayText}</span>
          {!isMobile && <span className="text-sm text-gray-500 font-mono">{shortcutText}</span>}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(62, 90, 255, 1)' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M8 3L8 13M8 3L4 7M8 3L12 7"
                stroke="currentColor"
                strokeWidth={arrowStrokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
        {showCloseButton && (
          <button
            onClick={handleCloseClick}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-80 hover:opacity-100"
            aria-label="Hide widget"
            style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2L10 10M10 2L2 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
