import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "../types";
import { ChatMessages } from "./ChatMessages";
import { ChatFooter } from "./ChatFooter";

interface Props {
  recaptchaSiteKey: string;
  onCloseModal: () => void;
  onSendMessage: (message: string, recaptchaToken: string) => void;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  logoUrl: string;
}

export const ChatModal = ({
  recaptchaSiteKey,
  onCloseModal,
  onSendMessage,
  messages,
  loading,
  error,
  logoUrl,
}: Props) => {
  return (
    <div
      className="fixed inset-0 bg-gray-200/30 flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onCloseModal}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md md:max-w-4xl border-2 border-gray-800 animate-scaleIn"
        style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <ChatHeader onCloseModal={onCloseModal} logoUrl={logoUrl} />

        <div
          className="bg-white max-h-[80vh] flex flex-col p-4 rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <ChatMessages messages={messages} />

          <ChatInput
            recaptchaSiteKey={recaptchaSiteKey}
            onSendMessage={onSendMessage}
            loading={loading}
            error={error}
          />

          <ChatFooter />
        </div>
      </div>
    </div>
  );
};
