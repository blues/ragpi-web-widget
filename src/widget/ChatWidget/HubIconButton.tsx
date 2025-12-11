import { useEffect, useRef, useState } from 'react';

interface Props {
  onClick: () => void;
  position?: 'bottom-left' | 'bottom-right';
}

export const HubIconButton = ({ onClick, position = 'bottom-right' }: Props) => {
  const [shouldShiftLeft, setShouldShiftLeft] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only check for overlaps if the position is bottom-right
    if (position !== 'bottom-right') {
      setShouldShiftLeft(false);
      return;
    }

    const checkOverlap = () => {
      if (!buttonRef.current) return;

      // Get the button's current bounding rect
      const currentButtonRect = buttonRef.current.getBoundingClientRect();

      // Calculate where the button WOULD BE if positioned on the right (bottom-right position)
      // We need to check overlap based on the default right position, not the current position
      // to avoid a feedback loop where the button moves left, checks again, and moves back right
      const buttonWidth = currentButtonRect.width;
      const buttonHeight = currentButtonRect.height;
      const rightMargin = 24; // 1.5rem = 24px (from right-6 class)
      const bottomMargin = 24; // 1.5rem = 24px (from bottom-6 class)

      // Calculate the hypothetical right position rect
      const hypotheticalRightRect = {
        right: window.innerWidth - rightMargin,
        left: window.innerWidth - rightMargin - buttonWidth,
        bottom: window.innerHeight - bottomMargin,
        top: window.innerHeight - bottomMargin - buttonHeight,
      };

      // Find all elements with "REPL" in their class name
      const replElements = document.querySelectorAll('[class*="REPL"]');

      let hasOverlap = false;

      replElements.forEach((element) => {
        const rect = element.getBoundingClientRect();

        // Check if the element is visible (not hidden)
        const isVisible = rect.width > 0 && rect.height > 0 &&
          window.getComputedStyle(element).visibility !== 'hidden' &&
          window.getComputedStyle(element).display !== 'none';

        if (!isVisible) return;

        // Check if there's a horizontal and vertical overlap with the HYPOTHETICAL right position
        const horizontalOverlap =
          hypotheticalRightRect.right > rect.left && hypotheticalRightRect.left < rect.right;
        const verticalOverlap =
          hypotheticalRightRect.bottom > rect.top && hypotheticalRightRect.top < rect.bottom;

        if (horizontalOverlap && verticalOverlap) {
          hasOverlap = true;
        }
      });

      setShouldShiftLeft(hasOverlap);
    };

    // Check overlap initially
    checkOverlap();

    // Set up a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(checkOverlap);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style'],
    });

    // Also check on window resize
    window.addEventListener('resize', checkOverlap);

    // Check periodically as a fallback
    const interval = setInterval(checkOverlap, 1000);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkOverlap);
      clearInterval(interval);
    };
  }, [position]);

  // Determine the position class based on the original position and overlap detection
  const positionClass = position === 'bottom-left' || (position === 'bottom-right' && shouldShiftLeft)
    ? 'left-6'
    : 'right-6';

  return (
    <div
      ref={buttonRef}
      className={`fixed bottom-6 ${positionClass} z-50`}
    >
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 hover:scale-110"
        style={{ backgroundColor: 'rgba(62, 90, 255, 0.8)' }}
        aria-label="Show widget"
      >
        <span className="material-icons-hub text-white text-2xl">x</span>
      </button>
    </div>
  );
};
