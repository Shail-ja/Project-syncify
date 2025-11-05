import React, { useMemo, useRef, useState, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCloud, setShowCloud] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      content:
        "Hi! I can guide you through the app flow and share efficiency tips. Ask me how to start or where you're stuck.",
    },
  ]);

  const backendUrl = useMemo(() => {
    const configured = import.meta.env.VITE_BACKEND_URL;
    return (configured ? configured.replace(/\/$/, "") : "http://localhost:3000");
  }, []);

  const listRef = useRef<HTMLDivElement | null>(null);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { id: generateId(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/assistant/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const content: string = data?.reply?.content ?? "Sorry, I didn't catch that.";
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: "Network error. Is the backend running?" },
      ]);
    } finally {
      setLoading(false);
      // Scroll to bottom
      queueMicrotask(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCloud(true);
      const hide = setTimeout(() => setShowCloud(false), 4000);
      return () => clearTimeout(hide);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  

return (
  <>
    {/* 💬 Floating Chat Button */}
    <button
      aria-label={open ? "Close assistant" : "Open assistant"}
      onClick={() => setOpen((v) => !v)}
      className={`chatbot-btn ${open ? "open" : ""}`}
    >
      {open ? <span className="close-icon">×</span> : "🤖"}
    </button>

    {/* ☁️ Cloud Speech Bubble */}
    {!open && showCloud && (
      <div className="chatbot-cloud">
        <span>Hi, I’m here to help!</span>
        <div className="cloud-tail" />
      </div>
    )}

    {/* 🧠 Chat Window */}
    {open && (
      <div className="chatbot-box">
        <div className="chatbot-header">Assistant</div>
        <div ref={listRef} className="chatbot-messages">
          {messages.map((m) => (
            <div key={m.id} className="chatbot-msg" style={{ justifyContent: m.role === "assistant" ? "flex-start" : "flex-end" }}>
              <div
                className="chatbot-bubble"
                style={{
                  background: m.role === "assistant" ? "#111827" : "#1f2937",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="chatbot-typing">Assistant is typing…</div>}
        </div>
        <div className="chatbot-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about flow or efficiency…"
          />
          <button onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    )}

    <style>{`
      
      .chatbot-btn {
        position: fixed;
        right: 20px;
        bottom: 20px;
        height: 60px;
        width: 60px;
        border-radius: 50%;
        border: none;
        color: #fff;
        // background: linear-gradient(135deg, #6366f1, #14b8a6);
        font-size: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.6),
          0 0 30px rgba(99, 102, 241, 0.4);
        transition: all 0.3s ease;
        animation: bounce 2.5s ease-in-out infinite;
        z-index: 999;
      }

      .chatbot-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 0 25px rgba(99, 102, 241, 0.8);
      }

      .chatbot-btn.open {
        background: linear-gradient(135deg, #ef4444, #f97316);
        animation: none;
      }

      .close-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 50px;
        width: 50px;
        font-size: 38px;
        transform: translateY(-2px);
      }

      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      /* Glowing Cloud Bubble */
      .chatbot-cloud {
        position: fixed;
        right: 92px;
        bottom: 86px;
        color: #111827;
        font-weight: 600;
        font-size: 15px;
        padding: 20px 30px;
        border-radius: 60px;
        background: radial-gradient(circle at 30% 30%, #ffffff 0%, #f3f6fb 100%);
        border: 1.5px solid rgba(226, 232, 240, 0.9);
        box-shadow:
          0 8px 24px rgba(15, 23, 42, 0.2),
          0 0 25px rgba(124, 58, 237, 0.25),
          inset 0 0 20px rgba(255, 255, 255, 0.7);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        z-index: 998;
        animation: floatCloud 3s ease-in-out infinite, pulseGlow 4s ease-in-out infinite;
        filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.25));
        transition: all 0.4s ease;
        overflow: visible;
      }

      .chatbot-cloud span {
        position: relative;
        z-index: 5; 
      }

      /* Inner soft lobes */
      .chatbot-cloud::before,
      .chatbot-cloud::after {
        content: "";
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.95) 0%, rgba(240, 244, 248, 0.85) 70%, transparent 100%);
        pointer-events: none;
        filter: blur(1px);
      }
      .chatbot-cloud::before {
        width: 85px;
        height: 85px;
        left: 20px;
        top: -20px;
      }
      .chatbot-cloud::after {
        width: 65px;
        height: 65px;
        left: 110px;
        top: -10px;
      }

      /* ☁️ Rounded glowing tail */
      .cloud-tail {
        position: absolute;
        right: -12px;
        bottom: 20px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: radial-gradient(circle at 45% 45%, #ffffff 0%, #f0f4f8 100%);
        border: 1.5px solid rgba(226, 232, 240, 0.9);
        box-shadow:
          0 0 10px rgba(139, 92, 246, 0.3),
          inset 0 0 6px rgba(255, 255, 255, 0.8);
        animation: pulseTail 4s ease-in-out infinite;
        z-index: -1;
      }

      /* ✨ Animations */
      @keyframes floatCloud {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }

      @keyframes pulseGlow {
        0%, 100% {
          box-shadow:
            0 8px 24px rgba(15, 23, 42, 0.2),
            0 0 25px rgba(124, 58, 237, 0.25),
            inset 0 0 10px rgba(255, 255, 255, 0.6);
        }
        50% {
          box-shadow:
            0 8px 24px rgba(15, 23, 42, 0.2),
            0 0 35px rgba(99, 102, 241, 0.45),
            inset 0 0 14px rgba(255, 255, 255, 0.75);
        }
      }

      @keyframes pulseTail {
        0%, 100% { box-shadow: 0 0 8px rgba(99, 102, 241, 0.25); }
        50% { box-shadow: 0 0 14px rgba(139, 92, 246, 0.45); }
      }

      @keyframes fadeIn { from{ opacity:0; transform: translateY(6px);} to{ opacity:1; transform: translateY(0);} }

      /* Chat Window */
      .chatbot-box {
        position: fixed;
        right: 16px;
        bottom: 84px;
        width: 360px;
        max-height: 520px;
        background: #0b1220;
        color: #e5e7eb;
        border: 1px solid #243041;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 50;
        animation: fadeIn 0.3s ease;
      }

      .chatbot-header {
        padding: 12px;
        border-bottom: 1px solid #243041;
        font-weight: 600;
      }

      .chatbot-messages {
        padding: 12px;
        overflow-y: auto;
        flex: 1;
      }

      .chatbot-msg {
        display: flex;
        margin-bottom: 10px;
      }

      .chatbot-bubble {
        border: 1px solid #243041;
        border-radius: 10px;
        padding: 8px 10px;
        max-width: 85%;
        white-space: pre-wrap;
      }

      .chatbot-typing {
        opacity: 0.7;
        font-size: 12px;
      }

      .chatbot-input {
        display: flex;
        gap: 8px;
        padding: 12px;
        border-top: 1px solid #243041;
      }

      .chatbot-input input {
        flex: 1;
        background: #0b1220;
        color: #e5e7eb;
        border: 1px solid #243041;
        border-radius: 8px;
        padding: 10px 12px;
        outline: none;
      }

      .chatbot-input button {
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 12px;
        cursor: pointer;
        opacity: 1;
        transition: 0.2s;
      }

      .chatbot-input button:disabled {
        opacity: 0.7;
      }

      .chatbot-input button:hover:not(:disabled) {
        background: #1d4ed8;
      }
    `}</style>
  </>
);
}
