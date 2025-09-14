import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { customFetch, requestTypeEnum } from "../../lib/customFetch";

// create socket ONCE, outside the component
const socket = io("ws://localhost:8000", {
  autoConnect: false,
  reconnectionAttempts: 3,
  reconnectionDelay: 10000,
});

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [unsentMessage, setUnsentMessage] = useState("");
  const [chatRoom, setChatRoom] = useState("");
  const [enableRag, setEnableRag] = useState(false);

  const sendMessage = (messageBody: string) => {
    socket.emit("send-message", {
      messageBody,
      enableRag,
    });
    setUnsentMessage("");
  };

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const token = sessionStorage.getItem("Authorization");
    socket.emit("connect-to-chat-room", { token });

    const handleChatCreated = ({ message, chatRoom }) => {
      setChatRoom(chatRoom);
      console.log(message, "chat-created message");
    };

    const handleNewHumanMessage = ({ newMessage }) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    const handleNewLlmResponse = ({ newLlmMessage }) => {
      setMessages((prev) => [...prev, newLlmMessage]);
    };

    socket.on("chat-created", handleChatCreated);
    socket.on("new-human-message", handleNewHumanMessage);
    socket.on("new-llm-response", handleNewLlmResponse);

    return () => {
      socket.off("chat-created", handleChatCreated);
      socket.off("new-human-message", handleNewHumanMessage);
      socket.off("new-llm-response", handleNewLlmResponse);
    };
  }, []);

   useEffect(() => {
    const getExistingMessages = async () => {
      try {
        const response = await customFetch('http://localhost:8000/api/chat', requestTypeEnum.GET);
        
        if (response.messages && Array.isArray(response.messages)) {
          setMessages(response.messages);
        }
      } catch (error) {
        console.error('Failed to fetch existing messages:', error);
      }
    };

    getExistingMessages();
  }, []);


  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md ${
              msg.isHuman
                ? "bg-blue-100 self-end text-right"
                : "bg-gray-100 self-start text-left"
            }`}
          >
            {msg.body}
          </div>
        ))}
      </div>

      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md m-10">
        <div className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
          <input
            type="text"
            placeholder="Chat with case compass"
            className="flex-1 bg-transparent focus:outline-none placeholder-gray-500"
            value={unsentMessage}
            onChange={(e) => setUnsentMessage(e.target.value)}
          />

          <button
            onClick={() => sendMessage(unsentMessage)}
            className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
          <button onClick={() => setEnableRag(!enableRag)}>
            {
              enableRag ? 'Disable Rag' : 'Enable Rag'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
