
import { useState } from "react";

// ✅ define types
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
      text: "Hi 👋 I am your F1 ChatBot Assistant. Ask me anything about Formula 1!",
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

      // ✅ type the response
      // const data: { results: Result[] } = await res.json();

      // const botReply =
      //   data.results?.map((r: Result) => r.text).join("\n\n") ||
      //   "No relevant information found....djbgfgdcndhvg";
      const data: { answer: string; sources: Result[] } = await res.json();

      const botReply =
        data.answer || "⚠️ No response from server";
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: botReply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Error fetching response" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h2>🏎️ F1 ChatBot</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          height: "400px",
          overflowY: "auto",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              marginBottom: "10px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",
                background:
                  msg.role === "user" ? "#007bff" : "#f1f1f1",
                color: msg.role === "user" ? "white" : "black",
                maxWidth: "70%",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}

        {loading && <p>Bot is typing...</p>}
      </div>

      <div style={{ display: "flex" }}>
        <input
          style={{ flex: 1, padding: "10px" }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about F1..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />

        <button onClick={handleSend} style={{ padding: "10px" }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default App;