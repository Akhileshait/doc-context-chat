"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}

interface IMessage {
  role: "user" | "assistant";
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState<string>("");
  const [messages, setMessages] = React.useState<IMessage[]>([]);

  const handleSendButton = async () => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
    ]);
    setMessage("");
    const res = await fetch(`http://localhost:8000/chat?message=${message}`);
    const data = await res.json();
    console.log("Response from server:", data);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: data?.message,
        documents: data?.docs,
      },
    ]);
  };

  return (
    <div className="p-4 flex justify-center items-center">
      <div className="w-full h-[85vh] overflow-y-auto flex flex-col">
        {messages.map((msg, index) => (
          <div key={index} className="">
            <strong>{msg.role}</strong>: {msg.content}
            {/* {msg.documents && (
              <ul>
                {msg.documents.map((doc, docIndex) => (
                  <li key={docIndex}>{doc.pageContent}</li>
                ))}
              </ul>
            )} */}
          </div>
        ))}
      </div>
      <div className="fixed bottom-5 w-200 flex gap-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <Button onClick={handleSendButton} disabled={!message.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;
