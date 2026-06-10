export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: string;
}

export interface ChatRequest {
  sources: string[];
  messages: ChatMessage[];
}

// Imperative handle the widget exposes so the embedding page can drive the chat
// panel programmatically (see the window.ragpiWidget API wired up in index.tsx)
// instead of synthesizing clicks on the button.
export interface WidgetControls {
  /** Show the widget (if hidden) and open the chat panel. */
  open: () => void;
  /** Close the chat panel. Leaves the launcher button in place. */
  close: () => void;
  /** Open if closed, close if open. */
  toggle: () => void;
  /** Whether the chat panel is currently open. */
  isOpen: () => boolean;
}
