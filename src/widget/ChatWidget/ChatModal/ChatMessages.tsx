import { ChatMessage } from "../types";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
// Use Light build instead of Prism - saves ~400KB
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
// Import only commonly used languages
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import cpp from "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
import c from "react-syntax-highlighter/dist/esm/languages/hljs/c";
// Use a lighter style. Import the single style file directly instead of the
// styles/hljs barrel so the bundler can't pull in all ~99 themes.
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";
import { remarkGfmTable } from "./remarkGfmTable";

// Register only the languages we need
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('c', c);

interface Props {
  messages: ChatMessage[];
}

export const ChatMessages = ({ messages }: Props) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          {!isMobile && (
            <p className="text-gray-500 text-center">
              Ask Blues AI your technical or product questions. Want to talk to a
              human? Reach out on the{" "}
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
          )}
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
                      remarkPlugins={[remarkGfmTable]}
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
                              style={docco}
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
                        a({ ...props }) {
                          return (
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
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
