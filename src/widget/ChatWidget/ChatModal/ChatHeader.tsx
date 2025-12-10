import { useEffect, useState } from "react";

interface Props {
  logoUrl: string;
  heading?: string;
  onCloseModal: () => void;
  onClearHistory: () => void;
}

export const ChatHeader = ({
  logoUrl,
  heading = "Blues AI: Your Technical Assistant",
  onCloseModal,
  onClearHistory,
}: Props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const displayHeading = isMobile ? "Blues AI" : heading;

  const handleClearHistory = () => {
    // Confirm before clearing
    if (window.confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
      onClearHistory();
    }
  };

  return (
    <div className="flex justify-between items-center p-4 border-b border-solid border-gray-300">
      <div className="flex items-center">
        <img src={logoUrl} alt="RAGPI Logo" className="h-8 mr-3" />
        <p className="text-2xl font-semibold text-gray-800">{displayHeading}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleClearHistory}
          className="text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
          aria-label="Clear chat history"
          title="Clear chat history"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
        <button
          onClick={onCloseModal}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
