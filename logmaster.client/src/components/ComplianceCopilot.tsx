import { useState, useRef, useEffect } from 'react';
import { askCopilot } from '../api/copilot';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export function ComplianceCopilot({ tripId }: { tripId: number }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  function timeNow() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage: Message = { role: 'user', content: question, time: timeNow() };
    setMessages((m) => [...m, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const answer = await askCopilot(tripId, userMessage.content);
      setMessages((m) => [...m, { role: 'assistant', content: answer, time: timeNow() }]);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: err.response?.data?.message ?? 'Something went wrong.', time: timeNow() },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger button — bottom-right, always visible */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-lime text-graphite shadow-xl flex items-center justify-center hover:scale-105 transition z-50"
          title="Ask Compliance Copilot"
        >
          <span className="text-2xl">💬</span>
        </button>
      )}

      {/* Floating chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[480px] bg-graphite-card rounded-2xl shadow-2xl border border-graphite-border flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-graphite-border shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-lime/15 flex items-center justify-center text-lime text-sm font-bold shrink-0">
                CC
              </div>
              <div>
                <p className="text-sm font-medium">Compliance Copilot</p>
                <p className="text-xs text-gray-500">Trip #{tripId}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-lg leading-none px-1">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center text-xs text-gray-600 mt-8 px-4">
                Ask me anything about this trip — try <br />
                <span className="text-gray-400">"Why is this trip flagged?"</span>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-end gap-2 max-w-[85%]">
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-lime/15 flex items-center justify-center text-[10px] text-lime font-bold shrink-0">
                      CC
                    </div>
                  )}
                  <div
                    className={`text-sm rounded-2xl px-3.5 py-2 leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-lime text-graphite rounded-br-sm'
                        : 'bg-graphite-input text-gray-100 rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
                <span className="text-[10px] text-gray-600 mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-lime/15 flex items-center justify-center text-[10px] text-lime font-bold shrink-0">
                  CC
                </div>
                <div className="bg-graphite-input rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleAsk} className="flex items-center gap-2 px-3 py-3 border-t border-graphite-border shrink-0">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Message Compliance Copilot…"
              className="flex-1 bg-graphite-input border border-graphite-border rounded-full px-4 py-2 text-sm placeholder:text-gray-600"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="w-9 h-9 rounded-full bg-lime text-graphite flex items-center justify-center disabled:opacity-40 shrink-0"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}