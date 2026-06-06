// Lightweight client for the APIForge Lab Project Assistant API.
//
// The assistant runs as a separate Python service (see assistant/ + README).
// The base URL is configurable via the VITE_ASSISTANT_API env var so the same
// build works in dev, preview, and deployed environments. When the service is
// unreachable, callers degrade gracefully (the ChatWidget shows a hint).

const DEFAULT_BASE = 'http://127.0.0.1:8000';

export const ASSISTANT_API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ASSISTANT_API) ||
  DEFAULT_BASE;

/** Check whether the assistant backend is reachable. */
export async function checkHealth(base = ASSISTANT_API_BASE) {
  try {
    const res = await fetch(`${base}/health`, { method: 'GET' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Stream a chat answer via Server-Sent Events.
 *
 * @param {Object}   opts
 * @param {string}   opts.message       The user's question.
 * @param {string?}  opts.sessionId     Existing session id (for memory).
 * @param {Function} opts.onSession     Called with the resolved session id.
 * @param {Function} opts.onToken       Called with each streamed token.
 * @param {Function} opts.onDone        Called when streaming completes.
 * @param {Function} opts.onError       Called on transport/parse errors.
 * @param {string?}  opts.base          API base URL override.
 * @returns {Function} abort()          Call to cancel the in-flight stream.
 */
export function streamChat({
  message,
  sessionId,
  onSession,
  onToken,
  onDone,
  onError,
  base = ASSISTANT_API_BASE,
}) {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${base}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id: sessionId, stream: true }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Assistant responded ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Parse the SSE stream line-by-line (events separated by blank lines).
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith('data:')) continue;
          const payload = JSON.parse(line.slice(5).trim());
          if (payload.type === 'session') onSession?.(payload.session_id);
          else if (payload.type === 'token') onToken?.(payload.content);
          else if (payload.type === 'done') onDone?.(payload.session_id);
          else if (payload.type === 'error') onError?.(new Error(payload.message));
        }
      }
      onDone?.(sessionId);
    } catch (err) {
      if (err.name !== 'AbortError') onError?.(err);
    }
  })();

  return () => controller.abort();
}

/** Send thumbs up/down feedback for the feedback loop. */
export async function sendFeedback(payload, base = ASSISTANT_API_BASE) {
  try {
    await fetch(`${base}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    /* feedback is best-effort */
  }
}
