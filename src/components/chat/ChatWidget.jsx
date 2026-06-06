import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Sparkles, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { streamChat, checkHealth, ASSISTANT_API_BASE } from '../../lib/api';

const SUGGESTIONS = [
  'What does this project do?',
  'Explain the API Playground page',
  'How do I run the tests?',
  'Suggest optimizations for the codebase',
];

const WELCOME = {
  role: 'assistant',
  content:
    "Hi! I'm the **APIForge Lab Project Assistant**. Ask me anything about this codebase — " +
    'architecture, modules, APIs, workflows, how to run things, or where to extend it.',
};

/**
 * Floating, real-time chat widget backed by the Project Assistant API.
 * Streams tokens over SSE, keeps a session id for conversational memory, and
 * degrades gracefully when the backend is offline.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(null); // null = unknown, true/false = checked
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef(null);
  const abortRef = useRef(null);
  const scrollRef = useRef(null);

  // Probe backend health when the panel is first opened.
  useEffect(() => {
    if (open && online === null) {
      checkHealth().then((h) => setOnline(Boolean(h)));
    }
  }, [open, online]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const send = useCallback(
    (text) => {
      const question = (text ?? input).trim();
      if (!question || busy) return;
      setInput('');
      setBusy(true);
      setMessages((m) => [...m, { role: 'user', content: question }, { role: 'assistant', content: '' }]);

      abortRef.current = streamChat({
        message: question,
        sessionId: sessionRef.current,
        onSession: (id) => {
          sessionRef.current = id;
        },
        onToken: (tok) => {
          setMessages((m) => {
            const next = [...m];
            next[next.length - 1] = {
              role: 'assistant',
              content: next[next.length - 1].content + tok,
            };
            return next;
          });
        },
        onDone: () => setBusy(false),
        onError: (err) => {
          setOnline(false);
          setBusy(false);
          setMessages((m) => {
            const next = [...m];
            next[next.length - 1] = {
              role: 'assistant',
              content: `⚠️ Couldn't reach the assistant API (${err.message}). Start it with \`python -m assistant.cli.serve\`.`,
            };
            return next;
          });
        },
      });
    },
    [input, busy],
  );

  const reset = () => {
    abortRef.current?.();
    sessionRef.current = null;
    setMessages([WELCOME]);
    setBusy(false);
  };

  return (
    <>
      {/* Launcher button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
        aria-label="Open Project Assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 text-surface" />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot className="h-6 w-6 text-surface" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-[60] flex h-[32rem] w-[min(92vw,24rem)] flex-col overflow-hidden rounded-2xl border border-surface-light/40 bg-surface/95 shadow-2xl backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-surface-light/40 bg-surface-light/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="h-4 w-4 text-surface" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Project Assistant</p>
                  <p className="flex items-center gap-1 text-[11px] text-text-muted">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${online === false ? 'bg-danger' : 'bg-success'}`} />
                    {online === false ? 'offline' : 'ready'} · {ASSISTANT_API_BASE.replace(/^https?:\/\//, '')}
                  </p>
                </div>
              </div>
              <button onClick={reset} className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-lighter/50 hover:text-primary" aria-label="Reset conversation">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {online === false && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Assistant API not reachable. Run <code className="rounded bg-surface px-1">python -m assistant.cli.serve</code> and reopen this panel.
                  </span>
                </div>
              )}
              {messages.map((msg, i) => (
                <Bubble key={i} role={msg.role} content={msg.content} streaming={busy && i === messages.length - 1} />
              ))}
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-surface-light/60 px-3 py-1 text-[11px] text-text-secondary transition-colors hover:border-primary hover:text-primary">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-surface-light/40 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the codebase…"
                className="flex-1 rounded-lg border border-surface-light/60 bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
              />
              <button type="submit" disabled={busy || !input.trim()} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-surface transition-opacity disabled:opacity-40" aria-label="Send">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ role, content, streaming }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-sm bg-primary text-surface'
            : 'rounded-bl-sm border border-surface-light/40 bg-surface-light/40 text-text-secondary'
        }`}
      >
        {content || (streaming ? '…' : '')}
        {streaming && content && <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-primary align-middle" />}
      </div>
    </div>
  );
}
