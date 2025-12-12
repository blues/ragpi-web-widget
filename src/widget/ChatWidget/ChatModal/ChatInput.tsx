import { KeyboardEvent, useState, useEffect, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

interface Props {
  recaptchaSiteKey: string;
  onSendMessage: (message: string, recaptchaToken: string) => void;
  loading: boolean;
  error: string | null;
}

export const ChatInput = ({
  recaptchaSiteKey,
  onSendMessage,
  loading,
  error,
}: Props) => {
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the input when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleTextAreaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || !inputText.trim()) return;

    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(recaptchaSiteKey, {
          action: "submit",
        })
        .then((token: string) => {
          onSendMessage(inputText, token);

          setInputText("");
        });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="py-4">
      <div className="flex items-center">
        <TextareaAutosize
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleTextAreaKeyDown}
          className="flex-1 border border-solid border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          placeholder="Type your message..."
          maxRows={10}
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="px-4 py-2 rounded-xl ml-3 text-white cursor-pointer"
          style={{
            backgroundColor: loading || !inputText.trim()
              ? 'rgba(62, 90, 255, 0.4)'
              : 'rgba(62, 90, 255, 0.8)',
            cursor: loading || !inputText.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? (
            <svg
              className="animate-spin size-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
              />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error} Try reaching out on the{" "}
          <a
            href="https://discuss.blues.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-red-700"
          >
            Blues Forum
          </a>
          .
        </div>
      )}
    </form>
  );
};
