import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Trash2,
  Download,
  Database,
  Table2,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  History,
  Columns3,
  LayoutList,
  X,
  Zap,
  Key,
  Link2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Theme Tokens (Tailwind v4 arbitrary values matching project palette)
// ---------------------------------------------------------------------------
const T = {
  surface: '#0f172a',
  surfaceLight: '#1e293b',
  surfaceLighter: '#334155',
  primary: '#6366f1',
  accent: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  editor: '#0d1117',
};

// ---------------------------------------------------------------------------
// Database Icons (inline SVG snippets for coloured logos)
// ---------------------------------------------------------------------------
const DbIcons = {
  PostgreSQL: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#336791" />
      <text x="6" y="16" fontSize="10" fill="white" fontWeight="bold">P</text>
    </svg>
  ),
  MySQL: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#00758F" />
      <text x="5" y="16" fontSize="10" fill="white" fontWeight="bold">M</text>
    </svg>
  ),
  MongoDB: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#47A248" />
      <text x="5" y="16" fontSize="9" fill="white" fontWeight="bold">M</text>
    </svg>
  ),
};

const DB_TYPES = ['PostgreSQL', 'MySQL', 'MongoDB'];

// ---------------------------------------------------------------------------
// Schema definitions
// ---------------------------------------------------------------------------
const SCHEMAS = {
  users: {
    columns: [
      { name: 'id', type: 'INT', constraint: 'PRIMARY KEY' },
      { name: 'name', type: 'VARCHAR(100)', constraint: '' },
      { name: 'email', type: 'VARCHAR(255)', constraint: '' },
      { name: 'role', type: 'VARCHAR(50)', constraint: '' },
      { name: 'created_at', type: 'TIMESTAMP', constraint: 'DEFAULT NOW()' },
    ],
  },
  orders: {
    columns: [
      { name: 'id', type: 'INT', constraint: 'PRIMARY KEY' },
      { name: 'user_id', type: 'INT', constraint: 'FOREIGN KEY → users.id' },
      { name: 'product', type: 'VARCHAR(100)', constraint: '' },
      { name: 'quantity', type: 'INT', constraint: '' },
      { name: 'total', type: 'DECIMAL(10,2)', constraint: '' },
      { name: 'status', type: 'VARCHAR(20)', constraint: '' },
      { name: 'created_at', type: 'TIMESTAMP', constraint: 'DEFAULT NOW()' },
    ],
  },
  products: {
    columns: [
      { name: 'id', type: 'INT', constraint: 'PRIMARY KEY' },
      { name: 'name', type: 'VARCHAR(100)', constraint: '' },
      { name: 'price', type: 'DECIMAL(10,2)', constraint: '' },
      { name: 'category', type: 'VARCHAR(50)', constraint: '' },
      { name: 'stock', type: 'INT', constraint: '' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Mock data rows
// ---------------------------------------------------------------------------
const MOCK_USERS = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', created_at: '2024-01-15 08:30:00' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'developer', created_at: '2024-02-20 14:15:00' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'viewer', created_at: '2024-03-10 09:45:00' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'developer', created_at: '2024-04-05 11:00:00' },
  { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', role: 'admin', created_at: '2024-05-18 16:30:00' },
];

const MOCK_ORDERS = [
  { id: 1, user_id: 1, product: 'Laptop Pro', quantity: 1, total: 1299.99, status: 'completed', created_at: '2024-06-01 10:00:00' },
  { id: 2, user_id: 2, product: 'Wireless Mouse', quantity: 2, total: 59.98, status: 'shipped', created_at: '2024-06-05 14:30:00' },
  { id: 3, user_id: 1, product: 'USB-C Hub', quantity: 1, total: 49.99, status: 'pending', created_at: '2024-06-10 09:15:00' },
  { id: 4, user_id: 4, product: 'Mechanical Keyboard', quantity: 1, total: 149.99, status: 'completed', created_at: '2024-06-12 11:45:00' },
];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Laptop Pro', price: 1299.99, category: 'Electronics', stock: 45 },
  { id: 2, name: 'Wireless Mouse', price: 29.99, category: 'Accessories', stock: 230 },
  { id: 3, name: 'USB-C Hub', price: 49.99, category: 'Accessories', stock: 120 },
  { id: 4, name: 'Mechanical Keyboard', price: 149.99, category: 'Peripherals', stock: 78 },
  { id: 5, name: '4K Monitor', price: 599.99, category: 'Electronics', stock: 32 },
];

const MOCK_JOIN = [
  { name: 'Alice Johnson', product: 'Laptop Pro' },
  { name: 'Bob Smith', product: 'Wireless Mouse' },
  { name: 'Alice Johnson', product: 'USB-C Hub' },
  { name: 'Diana Prince', product: 'Mechanical Keyboard' },
];

const MOCK_AGGREGATE = [
  { role: 'admin', count: 2 },
  { role: 'developer', count: 2 },
  { role: 'viewer', count: 1 },
];

// ---------------------------------------------------------------------------
// Simulated query engine
// ---------------------------------------------------------------------------
function executeQuery(sql) {
  const q = sql.trim().toLowerCase();
  const execTime = Math.floor(Math.random() * 136) + 15; // 15-150ms

  if (/^select\s+\*\s+from\s+users/i.test(q)) {
    return { success: true, rows: MOCK_USERS, columns: Object.keys(MOCK_USERS[0]), message: `${MOCK_USERS.length} rows returned`, execTime };
  }
  if (/^select\s+\*\s+from\s+orders/i.test(q)) {
    return { success: true, rows: MOCK_ORDERS, columns: Object.keys(MOCK_ORDERS[0]), message: `${MOCK_ORDERS.length} rows returned`, execTime };
  }
  if (/^select\s+\*\s+from\s+products/i.test(q)) {
    return { success: true, rows: MOCK_PRODUCTS, columns: Object.keys(MOCK_PRODUCTS[0]), message: `${MOCK_PRODUCTS.length} rows returned`, execTime };
  }
  if (/join/i.test(q) && /select/i.test(q)) {
    return { success: true, rows: MOCK_JOIN, columns: Object.keys(MOCK_JOIN[0]), message: `${MOCK_JOIN.length} rows returned`, execTime };
  }
  if (/group\s+by/i.test(q) && /count/i.test(q)) {
    return { success: true, rows: MOCK_AGGREGATE, columns: Object.keys(MOCK_AGGREGATE[0]), message: `${MOCK_AGGREGATE.length} rows returned`, execTime };
  }
  if (/^insert\s+into/i.test(q)) {
    return { success: true, rows: [], columns: [], message: '1 row inserted', execTime };
  }
  if (/^update\s+/i.test(q)) {
    return { success: true, rows: [], columns: [], message: '2 rows updated', execTime };
  }
  if (/^delete\s+from/i.test(q)) {
    return { success: true, rows: [], columns: [], message: '1 row deleted', execTime };
  }
  if (/^select/i.test(q)) {
    return { success: true, rows: MOCK_USERS.slice(0, 3), columns: Object.keys(MOCK_USERS[0]), message: '3 rows returned', execTime };
  }

  return { success: false, rows: [], columns: [], message: `ERROR: Unrecognized or unsupported query. Supported: SELECT, INSERT, UPDATE, DELETE. Try one of the quick-query buttons.`, execTime };
}

// ---------------------------------------------------------------------------
// Quick queries
// ---------------------------------------------------------------------------
const QUICK_QUERIES = [
  { label: 'SELECT * FROM users', query: 'SELECT * FROM users;' },
  { label: 'SELECT * FROM orders', query: 'SELECT * FROM orders;' },
  { label: 'INSERT INTO users', query: "INSERT INTO users (name, email, role)\nVALUES ('Grace Hopper', 'grace@example.com', 'developer');" },
  { label: 'JOIN query', query: "SELECT u.name, o.product\nFROM users u\nJOIN orders o ON u.id = o.user_id;" },
  { label: 'Aggregate query', query: "SELECT role, COUNT(*) AS count\nFROM users\nGROUP BY role;" },
];

const DEFAULT_SQL = `-- Welcome to the APIForge Lab Database Sandbox
-- Try running some queries below!

SELECT * FROM users;`;

// ---------------------------------------------------------------------------
// Toast Component
// ---------------------------------------------------------------------------
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-xl"
      style={{ background: T.surfaceLight, border: `1px solid ${T.border}`, color: T.textPrimary }}
    >
      <CheckCircle2 size={18} style={{ color: T.success }} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function DbSandbox() {
  const [dbType, setDbType] = useState('PostgreSQL');
  const [sql, setSql] = useState(DEFAULT_SQL);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeResultTab, setActiveResultTab] = useState('results');
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' });
  const [isRunning, setIsRunning] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedTable, setExpandedTable] = useState(null);
  const textareaRef = useRef(null);

  // ---- Execute ----
  const handleExecute = useCallback(() => {
    if (!sql.trim()) return;
    setIsRunning(true);
    const delay = Math.floor(Math.random() * 136) + 15;

    setTimeout(() => {
      const result = executeQuery(sql);
      result.execTime = delay;
      setResults(result);
      setHistory((prev) => [
        { sql: sql.trim(), timestamp: new Date().toLocaleTimeString(), success: result.success, message: result.message },
        ...prev,
      ].slice(0, 20));
      setActiveResultTab('results');
      setSortConfig({ key: null, dir: 'asc' });
      setIsRunning(false);
    }, delay);
  }, [sql]);

  // ---- Keyboard shortcut ----
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleExecute]);

  // ---- Sorting ----
  const sortedRows = results?.rows?.length
    ? [...results.rows].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const av = a[sortConfig.key];
        const bv = b[sortConfig.key];
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number') return sortConfig.dir === 'asc' ? av - bv : bv - av;
        return sortConfig.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      })
    : results?.rows ?? [];

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ---- Line numbers ----
  const lineCount = sql.split('\n').length;

  // ---- Table click in sidebar ----
  const handleTableClick = (tableName) => {
    setSql(`SELECT * FROM ${tableName};`);
    setExpandedTable((prev) => (prev === tableName ? null : tableName));
  };

  // ---- Constraint icon helper ----
  const constraintIcon = (c) => {
    if (c.includes('PRIMARY KEY')) return <Key size={12} className="inline mr-1" style={{ color: T.warning }} />;
    if (c.includes('FOREIGN KEY')) return <Link2 size={12} className="inline mr-1" style={{ color: T.accent }} />;
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.surface, color: T.textPrimary }}>
      {/* ==================== HEADER ==================== */}
      <header className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: T.border }}>
        <div className="flex items-center gap-3">
          <Database size={22} style={{ color: T.primary }} />
          <h1 className="text-lg font-bold tracking-tight">Database Sandbox</h1>
        </div>

        {/* DB Type Tabs */}
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: T.surfaceLight }}>
          {DB_TYPES.map((db) => (
            <button
              key={db}
              onClick={() => setDbType(db)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
              style={{
                background: dbType === db ? T.surfaceLighter : 'transparent',
                color: dbType === db ? T.textPrimary : T.textSecondary,
              }}
            >
              {DbIcons[db]}
              {db}
            </button>
          ))}
        </div>

        {/* Connection indicator */}
        <div className="flex items-center gap-2 text-sm" style={{ color: T.textSecondary }}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: T.success }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: T.success }} />
          </span>
          Connected to {dbType} sandbox
        </div>
      </header>

      {/* ==================== BODY ==================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ---------- LEFT PANEL: Editor ---------- */}
        <div className="flex flex-col" style={{ width: '40%', borderRight: `1px solid ${T.border}` }}>
          {/* Quick queries */}
          <div className="flex flex-wrap gap-2 px-4 py-3 border-b" style={{ borderColor: T.border }}>
            {QUICK_QUERIES.map((q) => (
              <button
                key={q.label}
                onClick={() => setSql(q.query)}
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 hover:scale-[1.03]"
                style={{ background: T.surfaceLighter, color: T.accent, border: `1px solid transparent` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Editor area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Line numbers */}
            <div
              className="select-none text-right py-4 pr-3 pl-3 text-xs font-mono leading-[1.625rem] overflow-hidden"
              style={{ background: T.editor, color: T.textSecondary, minWidth: 44 }}
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              spellCheck={false}
              className="flex-1 resize-none outline-none py-4 pr-4 font-mono text-sm leading-[1.625rem]"
              style={{ background: T.editor, color: T.textPrimary, caretColor: T.accent }}
            />
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: T.border, background: T.surfaceLight }}>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleExecute}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ background: T.success, color: '#fff' }}
              >
                {isRunning ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                    <Zap size={16} />
                  </motion.span>
                ) : (
                  <Play size={16} />
                )}
                {isRunning ? 'Running…' : 'Execute Query'}
              </motion.button>

              <button
                onClick={() => { setSql(''); setResults(null); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: T.surfaceLighter, color: T.textSecondary }}
              >
                <Trash2 size={14} /> Clear
              </button>
            </div>

            {results && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs" style={{ color: T.textSecondary }}>
                <Clock size={13} />
                Execution time: <span className="font-semibold" style={{ color: T.accent }}>{results.execTime}ms</span>
              </motion.div>
            )}
          </div>

          {/* Table browser */}
          <div className="border-t" style={{ borderColor: T.border, background: T.surfaceLight }}>
            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: T.textSecondary }}>
              Tables
            </div>
            {Object.keys(SCHEMAS).map((tbl) => (
              <div key={tbl}>
                <button
                  onClick={() => handleTableClick(tbl)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors"
                  style={{ color: T.textPrimary }}
                >
                  <motion.span animate={{ rotate: expandedTable === tbl ? 90 : 0 }} transition={{ duration: 0.15 }}>
                    <ChevronRight size={14} style={{ color: T.textSecondary }} />
                  </motion.span>
                  <Table2 size={14} style={{ color: T.primary }} />
                  {tbl}
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ background: T.surfaceLighter, color: T.textSecondary }}>
                    {SCHEMAS[tbl].columns.length} cols
                  </span>
                </button>
                <AnimatePresence>
                  {expandedTable === tbl && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {SCHEMAS[tbl].columns.map((col) => (
                        <div key={col.name} className="flex items-center gap-2 pl-12 pr-4 py-1 text-xs" style={{ color: T.textSecondary }}>
                          {constraintIcon(col.constraint)}
                          <span style={{ color: T.textPrimary }}>{col.name}</span>
                          <span className="ml-auto" style={{ color: T.accent }}>{col.type}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- RIGHT PANEL: Results ---------- */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Result Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b" style={{ borderColor: T.border, background: T.surfaceLight }}>
            {[
              { id: 'results', label: 'Results', icon: <LayoutList size={14} /> },
              { id: 'schema', label: 'Schema', icon: <Columns3 size={14} /> },
              { id: 'history', label: 'History', icon: <History size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveResultTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
                style={{
                  background: activeResultTab === tab.id ? T.surfaceLighter : 'transparent',
                  color: activeResultTab === tab.id ? T.textPrimary : T.textSecondary,
                }}
              >
                {tab.icon} {tab.label}
                {tab.id === 'results' && results?.rows?.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: T.primary, color: '#fff' }}>
                    {results.rows.length}
                  </span>
                )}
                {tab.id === 'history' && history.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: T.surfaceLighter, color: T.textSecondary }}>
                    {history.length}
                  </span>
                )}
              </button>
            ))}

            {/* Export button */}
            {results?.rows?.length > 0 && activeResultTab === 'results' && (
              <motion.button
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setToast('Results exported to CSV successfully!')}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{ background: T.surfaceLighter, color: T.accent }}
              >
                <Download size={13} /> Export CSV
              </motion.button>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              {/* ---- Results Tab ---- */}
              {activeResultTab === 'results' && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                  {!results ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: T.textSecondary }}>
                      <Database size={48} strokeWidth={1} />
                      <p className="text-sm">Execute a query to see results</p>
                      <p className="text-xs">Press <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: T.surfaceLighter }}>Ctrl + Enter</kbd> to run</p>
                    </div>
                  ) : !results.success ? (
                    <div className="p-6">
                      <div className="flex items-start gap-3 p-4 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: `1px solid ${T.danger}` }}>
                        <XCircle size={20} style={{ color: T.danger }} className="mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: T.danger }}>Query Error</p>
                          <p className="text-sm mt-1" style={{ color: T.textSecondary }}>{results.message}</p>
                        </div>
                      </div>
                    </div>
                  ) : results.rows.length === 0 ? (
                    <div className="p-6">
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="flex items-start gap-3 p-4 rounded-lg"
                        style={{ background: 'rgba(16,185,129,0.1)', border: `1px solid ${T.success}` }}
                      >
                        <CheckCircle2 size={20} style={{ color: T.success }} className="mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: T.success }}>Query Executed Successfully</p>
                          <p className="text-sm mt-1" style={{ color: T.textSecondary }}>{results.message}</p>
                          <p className="text-xs mt-1" style={{ color: T.textSecondary }}>Execution time: {results.execTime}ms</p>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="overflow-auto flex-1">
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: T.surfaceLight }}>
                            {results.columns.map((col) => (
                              <th
                                key={col}
                                onClick={() => handleSort(col)}
                                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors hover:bg-white/5"
                                style={{ color: T.textSecondary, borderBottom: `1px solid ${T.border}` }}
                              >
                                <span className="flex items-center gap-1">
                                  {col}
                                  {sortConfig.key === col ? (
                                    sortConfig.dir === 'asc' ? <ArrowUp size={12} style={{ color: T.accent }} /> : <ArrowDown size={12} style={{ color: T.accent }} />
                                  ) : (
                                    <ArrowUpDown size={12} className="opacity-30" />
                                  )}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedRows.map((row, i) => (
                            <motion.tr
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}
                              className="hover:bg-white/5 transition-colors"
                            >
                              {results.columns.map((col) => (
                                <td key={col} className="px-4 py-2 whitespace-nowrap" style={{ color: T.textPrimary, borderBottom: `1px solid ${T.border}` }}>
                                  {typeof row[col] === 'number' ? (
                                    <span style={{ color: T.warning }}>{row[col]}</span>
                                  ) : (
                                    row[col]
                                  )}
                                </td>
                              ))}
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Row count footer */}
                      <div className="flex items-center justify-between px-4 py-2 text-xs border-t" style={{ borderColor: T.border, color: T.textSecondary, background: T.surfaceLight }}>
                        <span>{results.rows.length} row{results.rows.length !== 1 ? 's' : ''} returned</span>
                        <span>Execution time: {results.execTime}ms</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ---- Schema Tab ---- */}
              {activeResultTab === 'schema' && (
                <motion.div key="schema" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
                  {Object.entries(SCHEMAS).map(([tableName, schema]) => (
                    <motion.div
                      key={tableName}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg overflow-hidden"
                      style={{ border: `1px solid ${T.border}` }}
                    >
                      <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: T.surfaceLight }}>
                        <Table2 size={16} style={{ color: T.primary }} />
                        <span className="font-semibold text-sm">{tableName}</span>
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: T.surfaceLighter, color: T.textSecondary }}>
                          {schema.columns.length} columns
                        </span>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: T.surfaceLighter }}>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase" style={{ color: T.textSecondary }}>Column</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase" style={{ color: T.textSecondary }}>Type</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold uppercase" style={{ color: T.textSecondary }}>Constraint</th>
                          </tr>
                        </thead>
                        <tbody>
                          {schema.columns.map((col, i) => (
                            <tr key={col.name} style={{ background: i % 2 === 0 ? T.surface : 'rgba(255,255,255,0.02)' }}>
                              <td className="px-4 py-2 font-mono text-sm" style={{ color: T.textPrimary }}>
                                {constraintIcon(col.constraint)}{col.name}
                              </td>
                              <td className="px-4 py-2 font-mono text-sm" style={{ color: T.accent }}>{col.type}</td>
                              <td className="px-4 py-2 text-xs" style={{ color: col.constraint ? T.warning : T.textSecondary }}>
                                {col.constraint || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* ---- History Tab ---- */}
              {activeResultTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                  {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: T.textSecondary }}>
                      <History size={40} strokeWidth={1} />
                      <p className="text-sm">No query history yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {history.map((entry, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="rounded-lg p-3 cursor-pointer hover:bg-white/5 transition-colors"
                          style={{ border: `1px solid ${T.border}`, background: T.surfaceLight }}
                          onClick={() => { setSql(entry.sql); setActiveResultTab('results'); }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              {entry.success ? (
                                <CheckCircle2 size={14} style={{ color: T.success }} />
                              ) : (
                                <XCircle size={14} style={{ color: T.danger }} />
                              )}
                              <span className="text-xs font-medium" style={{ color: entry.success ? T.success : T.danger }}>
                                {entry.message}
                              </span>
                            </div>
                            <span className="text-[10px] flex items-center gap-1" style={{ color: T.textSecondary }}>
                              <Clock size={10} /> {entry.timestamp}
                            </span>
                          </div>
                          <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed" style={{ color: T.textSecondary }}>
                            {entry.sql.length > 120 ? entry.sql.slice(0, 120) + '…' : entry.sql}
                          </pre>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ==================== WATERMARK ==================== */}
      <div className="text-center py-2 text-[10px] tracking-widest uppercase" style={{ color: T.textSecondary, opacity: 0.5 }}>
        Made by Senior SDET SHIVAM SHARMA
      </div>

      {/* ==================== TOAST ==================== */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
