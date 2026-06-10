import { useEffect, useRef, useState } from 'react';

interface Props {
  onClick: () => void;
  position?: 'bottom-left' | 'bottom-right';
}

export const HubIconButton = ({ onClick, position = 'bottom-right' }: Props) => {
  const [shouldShiftLeft, setShouldShiftLeft] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const checkOverlap = () => {
      frame = 0;
      // Only check for overlaps if the position is bottom-right
      if (position !== 'bottom-right') {
        setShouldShiftLeft(false);
        setShouldHide(false);
        return;
      }
      // Use actual dimensions if available, otherwise use default (48x48 for w-12 h-12)
      const buttonWidth = buttonRef.current?.getBoundingClientRect().width || 48;
      const buttonHeight = buttonRef.current?.getBoundingClientRect().height || 48;
      const rightMargin = 24; // 1.5rem = 24px (from right-6 class)
      const bottomMargin = 24; // 1.5rem = 24px (from bottom-6 class)

      // Calculate the button's hypothetical position in the bottom-right
      const buttonTop = window.innerHeight - bottomMargin - buttonHeight;
      const buttonRight = window.innerWidth - rightMargin;
      const buttonLeft = buttonRight - buttonWidth;

      // Find all elements with "REPL" in their class name
      const replElements = document.querySelectorAll('[class*="REPL"]');

      let hasOverlap = false;
      let isFullScreen = false;

      replElements.forEach((element) => {
        const rect = element.getBoundingClientRect();

        // Check if the element is visible (not hidden)
        const isVisible = rect.width > 0 && rect.height > 0 &&
          window.getComputedStyle(element).visibility !== 'hidden' &&
          window.getComputedStyle(element).display !== 'none';

        if (!isVisible) return;

        // Check if REPL is full screen (covers > 90% of viewport width)
        if (rect.width > window.innerWidth * 0.9) {
          isFullScreen = true;
        }

        // Check for both horizontal AND vertical overlap with the button's position
        const horizontalOverlap = rect.right > buttonLeft && rect.left < buttonRight;
        const verticalOverlap = rect.bottom > buttonTop && rect.top < window.innerHeight;

        if (horizontalOverlap && verticalOverlap) {
          hasOverlap = true;
        }
      });

      setShouldHide(isFullScreen);
      setShouldShiftLeft(hasOverlap && !isFullScreen);
    };

    // Coalesce bursts of mutations/resizes into a single layout read per frame.
    // The observer below watches the whole host document, so without this a busy
    // page could trigger checkOverlap (and its getBoundingClientRect /
    // getComputedStyle reads) many times per frame — classic layout thrashing.
    const scheduleCheck = () => {
      if (frame) return;
      frame = requestAnimationFrame(checkOverlap);
    };

    // Check overlap initially
    checkOverlap();

    // Set up a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(scheduleCheck);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style'],
    });

    // Also check on window resize
    window.addEventListener('resize', scheduleCheck);

    // Safety net for layout shifts the observer can't see (e.g. async font
    // loads). Longer than the old 1s tick since the observer now handles churn.
    const interval = setInterval(scheduleCheck, 2000);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', scheduleCheck);
      clearInterval(interval);
    };
  }, [position]);

  // Hide completely if REPL is full screen
  if (shouldHide) {
    return null;
  }

  // Determine the position class based on the original position and overlap detection
  const positionClass = position === 'bottom-left' || (position === 'bottom-right' && shouldShiftLeft)
    ? 'left-6'
    : 'right-6';

  return (
    <div
      ref={buttonRef}
      className={`fixed bottom-6 ${positionClass} z-[9999]`}
    >
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 hover:scale-110"
        style={{ backgroundColor: 'rgba(62, 90, 255, 0.8)' }}
        aria-label="Show widget"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="white">
          <path d="m19 9 1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"/>
        </svg>
      </button>
    </div>
  );
};
