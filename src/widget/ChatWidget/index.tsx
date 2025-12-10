import { useEffect, useRef, useState } from "react";
import root from "react-shadow";
import { ChatModal } from "./ChatModal";
import { ChatButton } from "./ChatButton";
import { HubIconButton } from "./HubIconButton";
import { ChatMessage, ChatRequest, ChatResponse } from "./types";
import styles from "./styles.css?inline";

interface Props {
  recaptchaSiteKey: string;
  ragpiGatewayUrl: string;
  ragpiSources: string[];
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  closedIconPosition?: 'bottom-left' | 'bottom-right';
}

export const ChatWidget = ({
  recaptchaSiteKey,
  ragpiGatewayUrl,
  ragpiSources,
  primaryColor,
  secondaryColor,
  logoUrl = "https://docs.ragpi.io/img/ragpi-logo-black.png",
  closedIconPosition = 'bottom-right',
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWidgetVisible, setIsWidgetVisible] = useState(() => {
    const stored = localStorage.getItem('ragpi-widget-visible');
    return stored === null ? true : stored === 'true';
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleHideWidget = () => {
    setIsWidgetVisible(false);
    setIsModalOpen(false);
  };

  const handleShowWidget = () => {
    setIsWidgetVisible(true);
  };

  const handleSendMessage = async (message: string, recaptchaToken: string) => {
    setIsFetching(true);
    setError(null);

    if (message.trim() === "") return;

    setMessages([...messages, { role: "user", content: message }]);
    try {
      const request: ChatRequest = {
        sources: ragpiSources,
        messages: [...messages, { role: "user", content: message }],
      };

      const response = await fetch(`${ragpiGatewayUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-recaptcha-token": recaptchaToken,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error === "verification_failed") {
          setError(
            "We have detected unusual activity. Please try again later."
          );
        } else {
          console.log("Error:", data);
          setError("An error occurred. Please try again later.");
        }
      } else {
        const data: ChatResponse = await response.json();

        setMessages([
          ...request.messages,
          { role: "assistant", content: data.message },
        ]);
      }

      setIsFetching(false);
    } catch (error) {
      console.error("Error:", error);
      setIsFetching(false);
      setError("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    const handleEscapeKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isModalOpen]);

  useEffect(() => {
    // Persist widget visibility to localStorage
    localStorage.setItem('ragpi-widget-visible', String(isWidgetVisible));
  }, [isWidgetVisible]);

  useEffect(() => {
    // Default Colors are set in the index.css file
    if (containerRef.current) {
      if (primaryColor) {
        containerRef.current.style.setProperty("--color-primary", primaryColor);
      } else {
        containerRef.current.style.removeProperty("--color-primary");
      }

      if (secondaryColor) {
        containerRef.current.style.setProperty(
          "--color-secondary",
          secondaryColor
        );
      } else {
        containerRef.current.style.removeProperty("--color-secondary");
      }
    }
  }, [primaryColor, secondaryColor]);

  return (
    <root.div ref={containerRef}>
      <style type="text/css">{styles}</style>

      {isWidgetVisible ? (
        <>
          <ChatButton onClick={handleOpenModal} onHide={handleHideWidget} />

          {isModalOpen && (
            <ChatModal
              logoUrl={logoUrl}
              recaptchaSiteKey={recaptchaSiteKey}
              onCloseModal={handleCloseModal}
              onSendMessage={handleSendMessage}
              messages={messages}
              loading={isFetching}
              error={error}
            />
          )}
        </>
      ) : (
        <HubIconButton onClick={handleShowWidget} position={closedIconPosition} />
      )}
    </root.div>
  );
};
