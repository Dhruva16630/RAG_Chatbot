import { useState } from "react";
import Loader from "./components/Loader";

type Message = {
  role: "user" | "bot";
  text: string;
};

type Result = {
  text: string;
  score: number;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "I am your F1 ChatBot Assistant. Ask me about updated 2026 rules",
    },
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage: Message = { role: "user", text: query };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data: { answer: string; sources: Result[] } = await res.json();

      const botReply = data.answer || "No response from server";

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: botReply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: " Error fetching response" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <div className="sticky top-0 z-10 bg-[#0f172a] text-center py-4 text-xl font-semibold border-b border-gray-700">
        F1 ChatBot
      </div>

      <div className="flex-1 px-4 py-6 space-y-6 max-w-3xl w-full mx-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm leading-relaxed ${msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-100"
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <Loader />
          </div>
        )}
      </div>
      <div className="border-t border-gray-700 p-4 bg-[#0f172a] sticky bottom-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about F1..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />

          <button
            onClick={handleSend}
            className="bg-blue-500 px-5 py-3 rounded-xl hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;