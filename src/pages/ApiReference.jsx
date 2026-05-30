import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  ShoppingCart,
  Package,
  Shield,
  Radio,
  GitBranch,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';

/* ───────────────── animation variants ───────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const expandVariant = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

/* ───────────────── method color map ───────────────── */
const METHOD_STYLES = {
  GET: 'bg-emerald-500/20 text-emerald-400',
  POST: 'bg-indigo-500/20 text-indigo-400',
  PUT: 'bg-amber-500/20 text-amber-400',
  DELETE: 'bg-red-500/20 text-red-400',
};

const METHOD_BORDER = {
  GET: 'border-emerald-500/30',
  POST: 'border-indigo-500/30',
  PUT: 'border-amber-500/30',
  DELETE: 'border-red-500/30',
};

/* ───────────────── status code badges ───────────────── */
const STATUS_CODES = [
  { code: '200', label: 'OK', color: 'bg-emerald-500/20 text-emerald-400' },
  { code: '201', label: 'Created', color: 'bg-emerald-500/20 text-emerald-400' },
  { code: '400', label: 'Bad Request', color: 'bg-amber-500/20 text-amber-400' },
  { code: '401', label: 'Unauthorized', color: 'bg-red-500/20 text-red-400' },
  { code: '404', label: 'Not Found', color: 'bg-amber-500/20 text-amber-400' },
  { code: '500', label: 'Server Error', color: 'bg-red-500/20 text-red-400' },
];

function getSuccessCode(method) {
  return method === 'POST' ? '201' : '200';
}

/* ───────────────── endpoint data ───────────────── */
const CATEGORIES = [
  {
    name: 'Users API',
    icon: Users,
    description: 'Manage user accounts and profiles',
    endpoints: [
      {
        method: 'GET',
        path: '/api/users',
        description: 'List all users with optional pagination and filtering.',
        response: JSON.stringify(
          [
            {
              id: 'usr_a1b2c3d4',
              name: 'Shivam Sharma',
              email: 'shivam@apiforge.dev',
              role: 'admin',
              createdAt: '2025-01-15T09:30:00Z',
            },
            {
              id: 'usr_e5f6g7h8',
              name: 'Priya Patel',
              email: 'priya@apiforge.dev',
              role: 'developer',
              createdAt: '2025-02-20T14:15:00Z',
            },
          ],
          null,
          2
        ),
      },
      {
        method: 'GET',
        path: '/api/users/:id',
        description: 'Retrieve a single user by their unique identifier.',
        response: JSON.stringify(
          {
            id: 'usr_a1b2c3d4',
            name: 'Shivam Sharma',
            email: 'shivam@apiforge.dev',
            role: 'admin',
            createdAt: '2025-01-15T09:30:00Z',
          },
          null,
          2
        ),
      },
      {
        method: 'POST',
        path: '/api/users',
        description: 'Create a new user account.',
        request: JSON.stringify(
          { name: 'Ankit Verma', email: 'ankit@apiforge.dev', password: 'Str0ng!Pass#42', role: 'developer' },
          null,
          2
        ),
        response: JSON.stringify(
          {
            id: 'usr_i9j0k1l2',
            name: 'Ankit Verma',
            email: 'ankit@apiforge.dev',
            role: 'developer',
            createdAt: '2025-06-10T11:00:00Z',
          },
          null,
          2
        ),
      },
      {
        method: 'PUT',
        path: '/api/users/:id',
        description: 'Update an existing user\'s information.',
        request: JSON.stringify({ name: 'Ankit V.', email: 'ankit.v@apiforge.dev', role: 'lead' }, null, 2),
        response: JSON.stringify(
          {
            id: 'usr_i9j0k1l2',
            name: 'Ankit V.',
            email: 'ankit.v@apiforge.dev',
            role: 'lead',
            createdAt: '2025-06-10T11:00:00Z',
          },
          null,
          2
        ),
      },
      {
        method: 'DELETE',
        path: '/api/users/:id',
        description: 'Permanently delete a user account.',
        response: JSON.stringify({ message: 'User deleted successfully' }, null, 2),
      },
    ],
  },
  {
    name: 'Orders API',
    icon: ShoppingCart,
    description: 'Process and manage customer orders',
    endpoints: [
      {
        method: 'GET',
        path: '/api/orders',
        description: 'List all orders with status and summary.',
        response: JSON.stringify(
          [
            {
              id: 'ord_x1y2z3',
              userId: 'usr_a1b2c3d4',
              status: 'shipped',
              total: 249.98,
              items: 3,
              createdAt: '2025-05-22T08:45:00Z',
            },
            {
              id: 'ord_w4v5u6',
              userId: 'usr_e5f6g7h8',
              status: 'processing',
              total: 89.99,
              items: 1,
              createdAt: '2025-06-01T16:30:00Z',
            },
          ],
          null,
          2
        ),
      },
      {
        method: 'POST',
        path: '/api/orders',
        description: 'Create a new order for a user.',
        request: JSON.stringify(
          {
            userId: 'usr_a1b2c3d4',
            items: [
              { productId: 'prod_001', quantity: 2 },
              { productId: 'prod_007', quantity: 1 },
            ],
            shippingAddress: '42 DevOps Lane, Bengaluru, KA 560001',
          },
          null,
          2
        ),
        response: JSON.stringify(
          {
            id: 'ord_n7m8o9',
            userId: 'usr_a1b2c3d4',
            status: 'pending',
            total: 349.97,
            items: [
              { productId: 'prod_001', quantity: 2, price: 129.99 },
              { productId: 'prod_007', quantity: 1, price: 89.99 },
            ],
            shippingAddress: '42 DevOps Lane, Bengaluru, KA 560001',
            createdAt: '2025-06-10T12:00:00Z',
          },
          null,
          2
        ),
      },
      {
        method: 'GET',
        path: '/api/orders/:id',
        description: 'Retrieve a specific order with full item details.',
        response: JSON.stringify(
          {
            id: 'ord_x1y2z3',
            userId: 'usr_a1b2c3d4',
            status: 'shipped',
            total: 249.98,
            items: [
              { productId: 'prod_001', name: 'Wireless Keyboard', quantity: 1, price: 79.99 },
              { productId: 'prod_003', name: 'USB-C Hub', quantity: 2, price: 84.99 },
            ],
            shippingAddress: '42 DevOps Lane, Bengaluru, KA 560001',
            createdAt: '2025-05-22T08:45:00Z',
          },
          null,
          2
        ),
      },
    ],
  },
  {
    name: 'Products API',
    icon: Package,
    description: 'Browse and manage the product catalog',
    endpoints: [
      {
        method: 'GET',
        path: '/api/products',
        description: 'List all products with pricing and stock info.',
        response: JSON.stringify(
          [
            { id: 'prod_001', name: 'Wireless Keyboard', price: 79.99, category: 'peripherals', stock: 142 },
            { id: 'prod_003', name: 'USB-C Hub', price: 42.5, category: 'accessories', stock: 305 },
            { id: 'prod_007', name: '4K Monitor', price: 89.99, category: 'displays', stock: 58 },
          ],
          null,
          2
        ),
      },
      {
        method: 'POST',
        path: '/api/products',
        description: 'Add a new product to the catalog.',
        request: JSON.stringify(
          {
            name: 'Mechanical Keyboard',
            description: 'Cherry MX Blue switches, RGB backlit, hot-swappable',
            price: 129.99,
            category: 'peripherals',
            stock: 75,
          },
          null,
          2
        ),
        response: JSON.stringify(
          {
            id: 'prod_012',
            name: 'Mechanical Keyboard',
            description: 'Cherry MX Blue switches, RGB backlit, hot-swappable',
            price: 129.99,
            category: 'peripherals',
            stock: 75,
            createdAt: '2025-06-10T13:00:00Z',
          },
          null,
          2
        ),
      },
    ],
  },
  {
    name: 'Auth API',
    icon: Shield,
    description: 'Authentication and authorization endpoints',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticate a user and receive JWT tokens.',
        request: JSON.stringify({ email: 'shivam@apiforge.dev', password: 'Str0ng!Pass#42' }, null, 2),
        response: JSON.stringify(
          {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfYTFiMmMzZDQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDk1NTYwMDB9.kX9z...',
            refreshToken: 'rt_8f2e4a6b-c0d1-4e5f-a6b7-c8d9e0f1a2b3',
            user: { id: 'usr_a1b2c3d4', name: 'Shivam Sharma', email: 'shivam@apiforge.dev', role: 'admin' },
          },
          null,
          2
        ),
      },
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new account and receive a token.',
        request: JSON.stringify(
          { name: 'New User', email: 'newuser@apiforge.dev', password: 'S3cure_P@ss!' },
          null,
          2
        ),
        response: JSON.stringify(
          {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfbjN3MTIzIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NDk1NTYwMDB9.Qm7p...',
            user: { id: 'usr_n3w123', name: 'New User', email: 'newuser@apiforge.dev', role: 'user' },
          },
          null,
          2
        ),
      },
      {
        method: 'POST',
        path: '/api/auth/refresh',
        description: 'Refresh an expired access token using a valid refresh token.',
        request: JSON.stringify({ refreshToken: 'rt_8f2e4a6b-c0d1-4e5f-a6b7-c8d9e0f1a2b3' }, null, 2),
        response: JSON.stringify(
          {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfYTFiMmMzZDQiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NDk1NTk2MDB9.Xr2a...',
            refreshToken: 'rt_1a2b3c4d-e5f6-7890-abcd-ef1234567890',
          },
          null,
          2
        ),
      },
    ],
  },
  {
    name: 'Events API',
    icon: Radio,
    description: 'Publish and subscribe to real-time events',
    endpoints: [
      {
        method: 'POST',
        path: '/api/events/publish',
        description: 'Publish an event to a topic via Kafka or MQTT broker.',
        request: JSON.stringify(
          {
            topic: 'order.created',
            payload: { orderId: 'ord_n7m8o9', userId: 'usr_a1b2c3d4', total: 349.97 },
            broker: 'kafka',
          },
          null,
          2
        ),
        response: JSON.stringify(
          {
            status: 'published',
            topic: 'order.created',
            broker: 'kafka',
            partition: 3,
            offset: 14829,
            timestamp: '2025-06-10T12:01:00Z',
          },
          null,
          2
        ),
      },
      {
        method: 'GET',
        path: '/api/events/stream',
        description: 'Subscribe to a Server-Sent Events stream for real-time updates.',
        response:
          'event: order.created\ndata: {"orderId":"ord_n7m8o9","status":"pending"}\n\nevent: order.updated\ndata: {"orderId":"ord_n7m8o9","status":"shipped"}\n\nevent: heartbeat\ndata: {"ts":"2025-06-10T12:05:00Z"}',
      },
    ],
  },
  {
    name: 'Workflows API',
    icon: GitBranch,
    description: 'Define and execute automated workflows',
    endpoints: [
      {
        method: 'GET',
        path: '/api/workflows',
        description: 'List all available workflow definitions.',
        response: JSON.stringify(
          [
            {
              id: 'wf_onboard',
              name: 'User Onboarding',
              steps: 5,
              status: 'active',
              createdAt: '2025-03-01T10:00:00Z',
            },
            {
              id: 'wf_deploy',
              name: 'CI/CD Pipeline',
              steps: 8,
              status: 'active',
              createdAt: '2025-04-12T08:30:00Z',
            },
          ],
          null,
          2
        ),
      },
      {
        method: 'POST',
        path: '/api/workflows/start',
        description: 'Start a new workflow execution with input variables.',
        request: JSON.stringify(
          { workflowId: 'wf_onboard', variables: { userId: 'usr_n3w123', sendWelcomeEmail: true, assignMentor: true } },
          null,
          2
        ),
        response: JSON.stringify(
          {
            executionId: 'exec_7k8l9m',
            workflowId: 'wf_onboard',
            status: 'running',
            currentStep: 1,
            startedAt: '2025-06-10T14:00:00Z',
          },
          null,
          2
        ),
      },
      {
        method: 'GET',
        path: '/api/workflows/:id/status',
        description: 'Check the current execution status of a running workflow.',
        response: JSON.stringify(
          {
            id: 'exec_7k8l9m',
            status: 'running',
            currentStep: 3,
            steps: [
              { step: 1, name: 'Create Account', status: 'completed' },
              { step: 2, name: 'Send Welcome Email', status: 'completed' },
              { step: 3, name: 'Assign Mentor', status: 'in_progress' },
              { step: 4, name: 'Setup Workspace', status: 'pending' },
              { step: 5, name: 'Final Verification', status: 'pending' },
            ],
          },
          null,
          2
        ),
      },
    ],
  },
];

/* ───────────────── reusable section wrapper ───────────────── */
function AnimatedSection({ children, className = '', custom = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      custom={custom}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────── code block with copy ───────────────── */
function CodeBlock({ title, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="bg-[#1a1a2e] rounded-lg p-4 text-sm leading-relaxed overflow-x-auto font-mono text-text-secondary border border-white/5">
        {code}
      </pre>
    </div>
  );
}

/* ───────────────── single endpoint card ───────────────── */
function EndpointCard({ endpoint, isExpanded, onToggle }) {
  const { method, path, description, request, response } = endpoint;
  const successCode = getSuccessCode(method);
  const relevantCodes = STATUS_CODES.filter(
    (s) => s.code === successCode || ['400', '401', '404', '500'].includes(s.code)
  );

  return (
    <motion.div
      className={`border rounded-xl overflow-hidden transition-colors ${METHOD_BORDER[method]} ${
        isExpanded ? 'bg-surface-light/80' : 'bg-surface-light/40 hover:bg-surface-light/60'
      }`}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.15 }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 text-left cursor-pointer"
      >
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shrink-0 ${METHOD_STYLES[method]}`}>
          {method}
        </span>
        <code className="font-mono text-sm text-text-primary truncate">{path}</code>
        <span className="hidden sm:inline text-sm text-text-muted ml-2 truncate">{description}</span>
        <motion.span
          className="ml-auto shrink-0 text-text-muted"
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={expandVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 border-t border-white/5 pt-4 space-y-4">
              <p className="text-sm text-text-secondary sm:hidden">{description}</p>

              {request && <CodeBlock title="Request Body" code={request} />}
              <CodeBlock title="Response" code={response} />

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Status Codes</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {relevantCodes.map((s) => (
                    <span key={s.code} className={`px-2.5 py-1 rounded-md text-xs font-semibold ${s.color}`}>
                      {s.code} {s.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function ApiReference() {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [expandedEndpoints, setExpandedEndpoints] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.name, true]))
  );

  const toggleEndpoint = (key) =>
    setExpandedEndpoints((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleCategory = (name) =>
    setExpandedCategories((prev) => ({ ...prev, [name]: !prev[name] }));

  const methods = ['ALL', 'GET', 'POST', 'PUT', 'DELETE'];

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      endpoints: cat.endpoints.filter((ep) => {
        const matchesMethod = methodFilter === 'ALL' || ep.method === methodFilter;
        const matchesSearch =
          !q || ep.path.toLowerCase().includes(q) || ep.description.toLowerCase().includes(q);
        return matchesMethod && matchesSearch;
      }),
    })).filter((cat) => cat.endpoints.length > 0);
  }, [search, methodFilter]);

  const totalEndpoints = filteredCategories.reduce((sum, c) => sum + c.endpoints.length, 0);

  return (
    <div className="min-h-screen bg-surface">
      {/* ──── Hero ──── */}
      <section className="relative pt-28 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-text-secondary mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              Complete API Documentation
            </div>
          </AnimatedSection>
          <AnimatedSection custom={1}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold gradient-text leading-tight pb-2">
              API Reference
            </h1>
          </AnimatedSection>
          <AnimatedSection custom={2}>
            <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
              Explore every endpoint in APIForge Lab — complete with request/response examples,
              status codes, and interactive documentation.
            </p>
          </AnimatedSection>
          <AnimatedSection custom={3}>
            <p className="mt-2 text-sm text-text-muted">
              {CATEGORIES.reduce((s, c) => s + c.endpoints.length, 0)} endpoints across{' '}
              {CATEGORIES.length} categories
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ──── Search & Filter (sticky) ──── */}
      <div className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search endpoints by path or description…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-light border border-white/10 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {methods.map((m) => {
              const active = methodFilter === m;
              const base =
                m === 'ALL'
                  ? 'bg-white/10 text-text-primary'
                  : METHOD_STYLES[m];
              return (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    active ? `${base} ring-2 ring-white/20 scale-105` : `${base} opacity-50 hover:opacity-80`
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ──── Results summary ──── */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <p className="text-xs text-text-muted">
          Showing <span className="text-text-secondary font-semibold">{totalEndpoints}</span>{' '}
          endpoint{totalEndpoints !== 1 && 's'}
          {methodFilter !== 'ALL' && (
            <span>
              {' '}matching <span className={`font-bold ${METHOD_STYLES[methodFilter]?.split(' ')[1]}`}>{methodFilter}</span>
            </span>
          )}
          {search && (
            <span>
              {' '}for "<span className="text-text-secondary">{search}</span>"
            </span>
          )}
        </p>
      </div>

      {/* ──── Endpoint Categories ──── */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary text-lg">No endpoints match your search.</p>
            <p className="text-text-muted text-sm mt-1">Try a different term or clear your filters.</p>
          </div>
        )}

        {filteredCategories.map((category, catIdx) => {
          const Icon = category.icon;
          const isOpen = expandedCategories[category.name] !== false;

          return (
            <AnimatedSection key={category.name} custom={catIdx} className="space-y-3">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center gap-3 group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-bold text-text-primary">{category.name}</h2>
                  <p className="text-xs text-text-muted">{category.description}</p>
                </div>
                <span className="ml-auto flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-surface-lighter text-xs font-semibold text-text-secondary">
                    {category.endpoints.length}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-text-muted"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </span>
              </button>

              {/* Category endpoints */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    variants={expandVariant}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="space-y-2 overflow-hidden"
                  >
                    {category.endpoints.map((ep) => {
                      const key = `${ep.method}:${ep.path}`;
                      return (
                        <EndpointCard
                          key={key}
                          endpoint={ep}
                          isExpanded={!!expandedEndpoints[key]}
                          onToggle={() => toggleEndpoint(key)}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </AnimatedSection>
          );
        })}
      </main>

      {/* ──── Footer ──── */}
      <footer className="border-t border-white/5 py-10 text-center">
        <p className="text-sm text-text-muted">
          Built by{' '}
          <span className="font-semibold text-text-secondary">Senior SDET SHIVAM SHARMA</span>
        </p>
      </footer>
    </div>
  );
}
