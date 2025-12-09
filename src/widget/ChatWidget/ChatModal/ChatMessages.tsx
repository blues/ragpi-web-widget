import { ChatMessage } from "../types";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface Props {
  messages: ChatMessage[];
}

export const ChatMessages = ({ messages }: Props) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500 text-center">
            Ask the Blues AI technical and/or product questions. Want to talk
            to a human? Reach out on the{" "}
            <a
              href="https://discuss.blues.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Blues Forum
            </a>
            .
          </p>
        </div>
      ) : (
        <div>
          {messages.map((message, index) => (
            <div key={index}>
              {message.role === "user" ? (
                <div className="flex justify-end mb-8">
                  <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2 max-w-[60%] text-left">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="text-gray-800 prose max-w-none text-left space-y-3">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        code({ children, className, node, ref, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return match ? (
                            <SyntaxHighlighter
                              {...props}
                              PreTag="div"
                              children={String(children).replace(/\n$/, "")}
                              language={match[1]}
                              style={vscDarkPlus}
                            />
                          ) : (
                            <code {...props} className={className}>
                              {children}
                            </code>
                          );
                        },
                        table({ ...props }) {
                          return (
                            <div className="overflow-x-auto">
                              <table
                                className="border-collapse border border-solid border-gray-300"
                                {...props}
                              />
                            </div>
                          );
                        },
                        thead({ ...props }) {
                          return <thead className="bg-gray-100" {...props} />;
                        },
                        tr({ ...props }) {
                          return (
                            <tr
                              className="border-b border-solid border-gray-300"
                              {...props}
                            />
                          );
                        },
                        th({ ...props }) {
                          return (
                            <th
                              className="border border-solid border-gray-300 px-4 py-2 text-left"
                              {...props}
                            />
                          );
                        },
                        td({ ...props }) {
                          return (
                            <td
                              className="border border-solid border-gray-300 px-4 py-2"
                              {...props}
                            />
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};
