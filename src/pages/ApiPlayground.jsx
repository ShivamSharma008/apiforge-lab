import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  History,
  Play,
  Plus,
  Minus,
  X,
  Search,
  Terminal,
  Code2,
  Globe,
  ArrowRight,
  Zap,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_RESPONSES = {
  'GET /api/users': {
    status: 200,
    statusText: 'OK',
    body: [
      { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', createdAt: '2024-01-15T08:30:00Z' },
      { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'developer', createdAt: '2024-02-20T14:15:00Z' },
      { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'viewer', createdAt: '2024-03-10T09:45:00Z' },
    ],
  },
  'POST /api/users': {
    status: 201,
    statusText: 'Created',
    body: { id: 4, name: 'New User', email: 'newuser@example.com', role: 'developer', createdAt: '2024-12-01T10:00:00Z' },
  },
  'GET /api/users/:id': {
    status: 200,
    statusText: 'OK',
    body: {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      createdAt: '2024-01-15T08:30:00Z',
      lastLogin: '2024-11-28T16:20:00Z',
    },
  },
  'PUT /api/users/:id': {
    status: 200,
    statusText: 'OK',
    body: { id: 1, name: 'Alice Johnson Updated', email: 'alice.updated@example.com', role: 'admin', updatedAt: '2024-12-01T10:00:00Z' },
  },
  'DELETE /api/users/:id': {
    status: 204,
    statusText: 'No Content',
    body: null,
  },
  'GET /api/orders': {
    status: 200,
    statusText: 'OK',
    body: [
      {
        id: 'ORD-001',
        userId: 1,
        items: [{ product: 'API Pro Plan', quantity: 1, price: 49.99 }],
        total: 49.99,
        status: 'completed',
        createdAt: '2024-11-01T12:00:00Z',
      },
      {
        id: 'ORD-002',
        userId: 2,
        items: [
          { product: 'Enterprise License', quantity: 1, price: 199.99 },
          { product: 'Support Add-on', quantity: 1, price: 29.99 },
        ],
        total: 229.98,
        status: 'pending',
        createdAt: '2024-11-15T09:30:00Z',
      },
    ],
  },
  'POST /api/orders': {
    status: 201,
    statusText: 'Created',
    body: {
      id: 'ORD-003',
      userId: 1,
      items: [{ product: 'Starter Plan', quantity: 1, price: 19.99 }],
      total: 19.99,
      status: 'processing',
      createdAt: '2024-12-01T10:00:00Z',
    },
  },
  'GET /api/products': {
    status: 200,
    statusText: 'OK',
    body: [
      { id: 'PROD-001', name: 'API Pro Plan', description: 'Professional API access with 10k requests/day', price: 49.99, category: 'subscription', available: true },
      { id: 'PROD-002', name: 'Enterprise License', description: 'Unlimited API access with priority support', price: 199.99, category: 'subscription', available: true },
      { id: 'PROD-003', name: 'Support Add-on', description: '24/7 premium technical support', price: 29.99, category: 'addon', available: true },
      { id: 'PROD-004', name: 'Analytics Dashboard', description: 'Real-time API analytics and monitoring', price: 39.99, category: 'addon', available: false },
    ],
  },
};

const SAMPLE_BODIES = {
  'POST /api/users': JSON.stringify({ name: 'New User', email: 'newuser@example.com', role: 'developer' }, null, 2),
  'PUT /api/users/:id': JSON.stringify({ name: 'Updated Name', email: 'updated@example.com' }, null, 2),
  'POST /api/orders': JSON.stringify({ userId: 1, items: [{ product: 'Starter Plan', quantity: 1, price: 19.99 }] }, null, 2),
};

const DEFAULT_BODY = JSON.stringify({ key: 'value' }, null, 2);

const API_CATALOG = [
  {
    category: 'Users',
    endpoints: [
      { method: 'GET', path: '/api/users' },
      { method: 'POST', path: '/api/users' },
      { method: 'GET', path: '/api/users/:id' },
      { method: 'PUT', path: '/api/users/:id' },
      { method: 'DELETE', path: '/api/users/:id' },
    ],
  },
  {
    category: 'Orders',
    endpoints: [
      { method: 'GET', path: '/api/orders' },
      { method: 'POST', path: '/api/orders' },
    ],
  },
  {
    category: 'Products',
    endpoints: [{ method: 'GET', path: '/api/products' }],
  },
];

const BASE_URL = 'https://api.apiforge.dev';

const MOCK_RESPONSE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Request-Id': 'req_a1b2c3d4e5f6',
  'X-RateLimit-Limit': '1000',
  'X-RateLimit-Remaining': '997',
  'Cache-Control': 'no-cache',
  Server: 'ApiForge/1.0',
  'Access-Control-Allow-Origin': '*',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const METHOD_COLORS = {
  GET: 'text-success',
  POST: 'text-primary',
  PUT: 'text-warning',
  DELETE: 'text-danger',
  PATCH: 'text-warning',
};

const METHOD_BG = {
  GET: 'bg-emerald-500/15 text-success',
  POST: 'bg-indigo-500/15 text-primary',
  PUT: 'bg-amber-500/15 text-warning',
  DELETE: 'bg-red-500/15 text-danger',
  PATCH: 'bg-amber-500/15 text-warning',
};

function statusColor(code) {
  if (code >= 200 && code < 300) {
    if (code === 201) return 'bg-indigo-500/15 text-primary';
    if (code === 204) return 'bg-amber-500/15 text-warning';
    return 'bg-emerald-500/15 text-success';
  }
  if (code === 404) return 'bg-red-500/15 text-danger';
  return 'bg-red-500/15 text-danger';
}

function timeColor(ms) {
  if (ms < 100) return 'text-success';
  if (ms < 200) return 'text-warning';
  return 'text-danger';
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------------------------------------------------------------------
// JSON Syntax Highlighting
// ---------------------------------------------------------------------------

function highlightJson(json) {
  if (json === null || json === undefined) return <span className="text-text-secondary italic">No Content</span>;

  const str = typeof json === 'string' ? json : JSON.stringify(json, null, 2);

  const tokenRegex = /("(?:\\.|[^"\\])*")\s*:/g;
  const parts = [];
  let lastIndex = 0;
  const raw = str;

  // Tokenize the JSON string manually for coloring
  const tokens = [];
  const re =
    /("(?:\\.|[^"\\])*")\s*(?=:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b|\bnull\b)|([{}[\]:,])/g;
  let m;
  let idx = 0;

  while ((m = re.exec(raw)) !== null) {
    // Push any whitespace / unmatched text before this token
    if (m.index > idx) {
      tokens.push({ type: 'ws', value: raw.slice(idx, m.index) });
    }

    if (m[1] !== undefined) {
      tokens.push({ type: 'key', value: m[1] });
    } else if (m[2] !== undefined) {
      tokens.push({ type: 'string', value: m[2] });
    } else if (m[3] !== undefined) {
      tokens.push({ type: 'number', value: m[3] });
    } else if (m[4] !== undefined) {
      tokens.push({ type: 'bool', value: m[4] });
    } else if (m[5] !== undefined) {
      tokens.push({ type: 'punct', value: m[5] });
    }

    idx = m.index + m[0].length;
  }

  if (idx < raw.length) {
    tokens.push({ type: 'ws', value: raw.slice(idx) });
  }

  return (
    <>
      {tokens.map((tok, i) => {
        switch (tok.type) {
          case 'key':
            return (
              <span key={i} className="text-accent">
                {tok.value}
              </span>
            );
          case 'string':
            return (
              <span key={i} className="text-success">
                {tok.value}
              </span>
            );
          case 'number':
            return (
              <span key={i} className="text-warning">
                {tok.value}
              </span>
            );
          case 'bool':
            return (
              <span key={i} className="text-primary">
                {tok.value}
              </span>
            );
          case 'punct':
            return (
              <span key={i} className="text-text-secondary">
                {tok.value}
              </span>
            );
          default:
            return <span key={i}>{tok.value}</span>;
        }
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MethodBadge({ method, small }) {
  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded text-xs tracking-wide ${METHOD_BG[method] || 'bg-surface-lighter text-text-secondary'} ${small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5'}`}
    >
      {method}
    </span>
  );
}

function KeyValueEditor({ pairs, onChange, label }) {
  const update = (index, field, value) => {
    const next = pairs.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    onChange(next);
  };
  const add = () => onChange([...pairs, { key: '', value: '' }]);
  const remove = (index) => onChange(pairs.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      {pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            className="flex-1 bg-surface border border-surface-lighter rounded px-3 py-1.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Key"
            value={pair.key}
            onChange={(e) => update(i, 'key', e.target.value)}
          />
          <input
            className="flex-1 bg-surface border border-surface-lighter rounded px-3 py-1.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Value"
            value={pair.value}
            onChange={(e) => update(i, 'value', e.target.value)}
          />
          <button
            onClick={() => remove(i)}
            className="p-1 rounded text-text-secondary hover:text-danger hover:bg-red-500/10 transition-colors"
            aria-label="Remove"
          >
            <Minus size={14} />
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-xs text-primary hover:text-accent transition-colors">
        <Plus size={14} /> Add {label || 'entry'}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ApiPlayground() {
  // Catalog state
  const [expandedCategories, setExpandedCategories] = useState({ Users: true, Orders: true, Products: true });

  // Request state
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState(`${BASE_URL}/api/users`);
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET /api/users');
  const [activeRequestTab, setActiveRequestTab] = useState('headers');
  const [headers, setHeaders] = useState([
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Authorization', value: 'Bearer <token>' },
  ]);
  const [body, setBody] = useState('');
  const [params, setParams] = useState([{ key: '', value: '' }]);

  // Response state
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [activeResponseTab, setActiveResponseTab] = useState('body');

  // History
  const [history, setHistory] = useState([]);

  // Copy tooltip
  const [copied, setCopied] = useState(false);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const selectEndpoint = useCallback(
    (ep) => {
      setMethod(ep.method);
      setUrl(`${BASE_URL}${ep.path}`);
      setSelectedEndpoint(`${ep.method} ${ep.path}`);
      const sampleKey = `${ep.method} ${ep.path}`;
      setBody(SAMPLE_BODIES[sampleKey] || DEFAULT_BODY);
      setActiveRequestTab('headers');
      setResponse(null);
    },
    [],
  );

  const toggleCategory = useCallback((cat) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }, []);

  const sendRequest = useCallback(() => {
    setLoading(true);
    setResponse(null);

    const delay = randomBetween(500, 1500);
    const responseTime = randomBetween(50, 300);

    setTimeout(() => {
      // Resolve mock
      const key = selectedEndpoint;
      const mock = MOCK_RESPONSES[key] || { status: 404, statusText: 'Not Found', body: { error: 'Endpoint not found' } };

      const bodyStr = mock.body !== null ? JSON.stringify(mock.body, null, 2) : null;
      const size = bodyStr ? new Blob([bodyStr]).size : 0;

      const res = {
        status: mock.status,
        statusText: mock.statusText,
        body: mock.body,
        bodyStr,
        time: responseTime,
        size,
        headers: { ...MOCK_RESPONSE_HEADERS },
      };

      setResponse(res);
      setActiveResponseTab('body');
      setLoading(false);

      // Add to history (max 5)
      setHistory((prev) => {
        const entry = {
          id: Date.now(),
          method,
          path: url.replace(BASE_URL, ''),
          status: mock.status,
          time: responseTime,
        };
        return [entry, ...prev].slice(0, 5);
      });
    }, delay);
  }, [selectedEndpoint, method, url]);

  const copyResponse = useCallback(() => {
    if (response?.bodyStr) {
      navigator.clipboard.writeText(response.bodyStr).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  }, [response]);

  const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(method);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      {/* Header */}
      <div className="border-b border-surface-lighter">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Terminal className="text-primary" size={24} />
          <h1 className="text-xl font-bold tracking-tight">
            API <span className="text-primary">Playground</span>
          </h1>
          <span className="ml-auto text-xs text-text-secondary flex items-center gap-1">
            <Zap size={12} className="text-warning" /> Interactive Testing
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ============================================================= */}
          {/* LEFT PANEL — Catalog & History */}
          {/* ============================================================= */}
          <div className="w-full lg:w-1/3 space-y-4">
            {/* Catalog */}
            <div className="bg-surface-light rounded-xl border border-surface-lighter overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-lighter flex items-center gap-2">
                <Globe size={16} className="text-accent" />
                <span className="text-sm font-semibold">API Endpoints</span>
              </div>

              <div className="divide-y divide-surface-lighter">
                {API_CATALOG.map((cat) => (
                  <div key={cat.category}>
                    <button
                      onClick={() => toggleCategory(cat.category)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-lighter/50 transition-colors"
                    >
                      {expandedCategories[cat.category] ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                      {cat.category}
                      <span className="ml-auto text-xs bg-surface-lighter rounded-full px-2 py-0.5">
                        {cat.endpoints.length}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedCategories[cat.category] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {cat.endpoints.map((ep) => {
                            const key = `${ep.method} ${ep.path}`;
                            const active = selectedEndpoint === key;
                            return (
                              <button
                                key={key}
                                onClick={() => selectEndpoint(ep)}
                                className={`w-full flex items-center gap-2.5 px-4 pl-8 py-2 text-sm transition-colors ${
                                  active
                                    ? 'bg-primary/10 border-l-2 border-primary'
                                    : 'hover:bg-surface-lighter/40 border-l-2 border-transparent'
                                }`}
                              >
                                <MethodBadge method={ep.method} small />
                                <span className={`font-mono text-xs ${active ? 'text-text-primary' : 'text-text-secondary'}`}>
                                  {ep.path}
                                </span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="bg-surface-light rounded-xl border border-surface-lighter overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-lighter flex items-center gap-2">
                <History size={16} className="text-accent" />
                <span className="text-sm font-semibold">Request History</span>
              </div>

              {history.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-text-secondary">No requests yet</div>
              ) : (
                <div className="divide-y divide-surface-lighter">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-center gap-2 px-4 py-2 text-xs">
                      <MethodBadge method={h.method} small />
                      <span className="font-mono text-text-secondary truncate flex-1">{h.path}</span>
                      <span className={`font-semibold ${statusColor(h.status).includes('success') ? 'text-success' : statusColor(h.status).includes('primary') ? 'text-primary' : statusColor(h.status).includes('warning') ? 'text-warning' : 'text-danger'}`}>
                        {h.status}
                      </span>
                      <span className={`flex items-center gap-0.5 ${timeColor(h.time)}`}>
                        <Clock size={10} />
                        {h.time}ms
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================= */}
          {/* RIGHT PANEL — Builder & Response */}
          {/* ============================================================= */}
          <div className="w-full lg:w-2/3 space-y-4">
            {/* Request Builder */}
            <div className="bg-surface-light rounded-xl border border-surface-lighter overflow-hidden">
              {/* URL Bar */}
              <div className="flex items-center gap-2 p-3 border-b border-surface-lighter">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className={`bg-surface border border-surface-lighter rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${METHOD_COLORS[method]}`}
                >
                  {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => (
                    <option key={m} value={m} className="bg-surface text-text-primary">
                      {m}
                    </option>
                  ))}
                </select>

                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-surface border border-surface-lighter rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter request URL"
                />

                <button
                  onClick={sendRequest}
                  disabled={loading}
                  className="flex items-center gap-2 bg-primary hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg px-5 py-2 text-sm transition-colors"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Send
                </button>
              </div>

              {/* Request Tabs */}
              <div className="flex border-b border-surface-lighter">
                {['headers', 'body', 'params'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveRequestTab(tab)}
                    className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors relative ${
                      activeRequestTab === tab
                        ? 'text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab}
                    {activeRequestTab === tab && (
                      <motion.div
                        layoutId="requestTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4">
                <AnimatePresence mode="wait">
                  {activeRequestTab === 'headers' && (
                    <motion.div
                      key="headers"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <KeyValueEditor pairs={headers} onChange={setHeaders} label="header" />
                    </motion.div>
                  )}

                  {activeRequestTab === 'body' && (
                    <motion.div
                      key="body"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {isBodyMethod ? (
                        <textarea
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          rows={8}
                          className="w-full bg-surface border border-surface-lighter rounded-lg px-4 py-3 text-sm font-mono text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                          placeholder="Request body (JSON)"
                        />
                      ) : (
                        <div className="flex items-center justify-center py-8 text-text-secondary text-sm">
                          <Code2 size={16} className="mr-2" />
                          No body for {method} requests
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeRequestTab === 'params' && (
                    <motion.div
                      key="params"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <KeyValueEditor pairs={params} onChange={setParams} label="parameter" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Response Viewer */}
            <AnimatePresence>
              {(loading || response) && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.25 }}
                  className="bg-surface-light rounded-xl border border-surface-lighter overflow-hidden"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 size={32} className="animate-spin text-primary" />
                      <span className="text-sm text-text-secondary">Sending request…</span>
                    </div>
                  ) : response ? (
                    <>
                      {/* Response Meta */}
                      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-surface-lighter">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${statusColor(response.status)}`}>
                          {response.status} {response.statusText}
                        </span>

                        <span className={`flex items-center gap-1 text-xs font-medium ${timeColor(response.time)}`}>
                          <Clock size={12} />
                          {response.time}ms
                        </span>

                        <span className="text-xs text-text-secondary">{response.size} bytes</span>

                        <div className="ml-auto relative">
                          <button
                            onClick={copyResponse}
                            className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors bg-surface-lighter/50 hover:bg-surface-lighter rounded px-2.5 py-1"
                          >
                            {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                            {copied ? 'Copied!' : 'Copy'}
                          </button>
                          <AnimatePresence>
                            {copied && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-success text-white text-[10px] font-medium rounded px-2 py-0.5 whitespace-nowrap"
                              >
                                Copied!
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Response Tabs */}
                      <div className="flex border-b border-surface-lighter">
                        {['body', 'headers'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveResponseTab(tab)}
                            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors relative ${
                              activeResponseTab === tab
                                ? 'text-primary'
                                : 'text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            {tab}
                            {activeResponseTab === tab && (
                              <motion.div
                                layoutId="responseTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                              />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Response Content */}
                      <div className="p-4">
                        <AnimatePresence mode="wait">
                          {activeResponseTab === 'body' && (
                            <motion.div
                              key="res-body"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.15 }}
                            >
                              <pre className="bg-surface rounded-lg border border-surface-lighter p-4 text-sm font-mono overflow-x-auto max-h-[400px] overflow-y-auto leading-relaxed">
                                {highlightJson(response.body)}
                              </pre>
                            </motion.div>
                          )}

                          {activeResponseTab === 'headers' && (
                            <motion.div
                              key="res-headers"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.15 }}
                            >
                              <div className="bg-surface rounded-lg border border-surface-lighter divide-y divide-surface-lighter overflow-hidden">
                                {Object.entries(response.headers).map(([k, v]) => (
                                  <div key={k} className="flex px-4 py-2 text-sm">
                                    <span className="w-1/3 font-mono text-accent truncate">{k}</span>
                                    <span className="w-2/3 font-mono text-text-secondary truncate">{v}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer / Watermark */}
      <div className="border-t border-surface-lighter mt-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 text-center text-xs text-text-secondary">
          Made by <span className="font-semibold text-primary">Senior SDET SHIVAM SHARMA</span>
        </div>
      </div>
    </div>
  );
}
