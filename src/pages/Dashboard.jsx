import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Zap, Database, GitBranch, Radio, Plus, Play, Workflow,
  Clock, ArrowUpRight, CheckCircle2, XCircle, Activity
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────
const responseTimeData = [
  { day: 'Mon', avg: 120, p95: 280 },
  { day: 'Tue', avg: 95,  p95: 245 },
  { day: 'Wed', avg: 140, p95: 320 },
  { day: 'Thu', avg: 110, p95: 290 },
  { day: 'Fri', avg: 85,  p95: 210 },
  { day: 'Sat', avg: 75,  p95: 190 },
  { day: 'Sun', avg: 90,  p95: 230 },
];

const requestDistribution = [
  { name: 'GET',    value: 45, color: '#10b981' },
  { name: 'POST',   value: 30, color: '#6366f1' },
  { name: 'PUT',    value: 15, color: '#f59e0b' },
  { name: 'DELETE', value: 10, color: '#ef4444' },
];

const sparklineData = {
  requests:  [30, 45, 35, 50, 55, 40, 60, 70, 65, 80, 75, 90],
  queries:   [20, 30, 25, 35, 40, 30, 45, 50, 48, 55, 52, 60],
  workflows: [5,  8,  6,  10, 12, 9,  14, 16, 15, 18, 17, 20],
  events:    [80, 120, 100, 150, 170, 130, 180, 200, 190, 220, 210, 250],
};

const recentActivity = [
  { method: 'GET',    endpoint: '/api/users',          status: 200, time: '45ms',  when: '2 min ago' },
  { method: 'POST',   endpoint: '/api/orders',         status: 201, time: '120ms', when: '5 min ago' },
  { method: 'PUT',    endpoint: '/api/users/42',       status: 200, time: '89ms',  when: '8 min ago' },
  { method: 'DELETE', endpoint: '/api/sessions/15',    status: 204, time: '32ms',  when: '12 min ago' },
  { method: 'GET',    endpoint: '/api/products',       status: 200, time: '67ms',  when: '15 min ago' },
  { method: 'POST',   endpoint: '/api/auth/login',     status: 200, time: '230ms', when: '18 min ago' },
  { method: 'GET',    endpoint: '/api/workflows/list', status: 200, time: '55ms',  when: '22 min ago' },
  { method: 'POST',   endpoint: '/api/events/publish', status: 500, time: '340ms', when: '25 min ago' },
];

const activeWorkflows = [
  { name: 'User Registration',  progress: 75, status: 'Running' },
  { name: 'Order Processing',   progress: 100, status: 'Completed' },
  { name: 'Data Import Pipeline', progress: 45, status: 'Running' },
  { name: 'Payment Reconciliation', progress: 60, status: 'Running' },
];

const systemServices = [
  { name: 'API Gateway',   status: 'healthy', route: '/api-playground' },
  { name: 'Auth Service',  status: 'healthy' },
  { name: 'Database',      status: 'healthy', route: '/db-sandbox' },
  { name: 'Kafka Broker',  status: 'healthy', route: '/events' },
  { name: 'Camunda',       status: 'healthy', route: '/workflows' },
  { name: 'Redis Cache',   status: 'healthy' },
  { name: 'MQTT Broker',   status: 'healthy', route: '/events' },
  { name: 'NiFi',          status: 'healthy', route: '/workflows' },
];

// ─── Helpers ─────────────────────────────────────────────────
const methodColor = {
  GET: 'bg-emerald-500/20 text-emerald-400',
  POST: 'bg-indigo-500/20 text-indigo-400',
  PUT: 'bg-amber-500/20 text-amber-400',
  DELETE: 'bg-red-500/20 text-red-400',
};

const statusColor = (code) => {
  if (code < 300) return 'text-emerald-400';
  if (code < 400) return 'text-amber-400';
  return 'text-red-400';
};

const statusDot = {
  healthy: 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]',
  warning: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]',
  error:   'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]',
};

const workflowStatusBadge = {
  Running:   'bg-indigo-500/20 text-indigo-400',
  Completed: 'bg-emerald-500/20 text-emerald-400',
  Failed:    'bg-red-500/20 text-red-400',
};

const workflowStatusIcon = {
  Running:   <Activity className="w-3 h-3" />,
  Completed: <CheckCircle2 className="w-3 h-3" />,
  Failed:    <XCircle className="w-3 h-3" />,
};

// ─── Animated Counter ────────────────────────────────────────
function AnimatedCounter({ value, duration = 1.6 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const hasAnimated = useRef(false);

  // Initial animation: count up from 0 once on first view
  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    let start = 0;
    const end = value;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); hasAnimated.current = true; }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, duration]);

  // After initial animation, update count directly for live increments
  useEffect(() => {
    if (hasAnimated.current) {
      setCount(value);
    }
  }, [value]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// ─── Mini Sparkline ──────────────────────────────────────────
function Sparkline({ data, color }) {
  const mapped = data.map((v, i) => ({ v, i }));
  return (
    <div className="absolute bottom-0 right-0 w-28 h-12 opacity-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mapped} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} fill={`url(#spark-${color})`} strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Custom Tooltip for Line Chart ──────────────────────────
function ResponseTimeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-light border border-surface-lighter rounded-lg px-4 py-3 shadow-xl">
      <p className="text-text-secondary text-xs mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-sm" style={{ color: p.color }}>
          {p.dataKey === 'avg' ? 'Avg' : 'P95'}: <span className="font-semibold">{p.value}ms</span>
        </p>
      ))}
    </div>
  );
}

// ─── Custom Active Shape for Pie ─────────────────────────────
function renderActiveShape(props) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#f1f5f9" fontSize={14} fontWeight={600}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={12}>
        {(percent * 100).toFixed(0)}%
      </text>
      <Pie
        cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
        data={[{ value: 1 }]}
      />
    </g>
  );
}

// ─── Animation Variants ──────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Main Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [activePieIndex, setActivePieIndex] = useState(0);
  const chartsRef = useRef(null);
  const chartsInView = useInView(chartsRef, { once: true, margin: '-80px' });

  // Live metric counters
  const [liveMetrics, setLiveMetrics] = useState({
    requests: 12847, queries: 8234, workflows: 342, events: 45892,
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate live metric updates every 2-4 seconds
  useEffect(() => {
    const t = setInterval(() => {
      setLiveMetrics(prev => ({
        requests:  prev.requests  + Math.floor(Math.random() * 15) + 1,
        queries:   prev.queries   + Math.floor(Math.random() * 8) + 1,
        workflows: prev.workflows + (Math.random() > 0.7 ? 1 : 0),
        events:    prev.events    + Math.floor(Math.random() * 25) + 3,
      }));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const metrics = [
    { title: 'API Requests',     value: liveMetrics.requests,  change: 12.5, icon: Zap,       color: '#6366f1', spark: sparklineData.requests },
    { title: 'DB Queries',       value: liveMetrics.queries,   change: 8.3,  icon: Database,  color: '#06b6d4', spark: sparklineData.queries },
    { title: 'Workflows Run',    value: liveMetrics.workflows, change: 15.7, icon: GitBranch, color: '#a855f7', spark: sparklineData.workflows },
    { title: 'Events Processed', value: liveMetrics.events,    change: 23.1, icon: Radio,     color: '#10b981', spark: sparklineData.events },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <motion.div
        className="max-w-[1440px] mx-auto px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Header ──────────────────────────────────────── */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Welcome back, <span className="gradient-text">Shivam!</span>
            </h1>
            <p className="text-text-secondary mt-1">APIForge Lab Dashboard</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-text-secondary text-sm bg-surface-light rounded-lg px-4 py-2 border border-surface-lighter">
              <Clock className="w-4 h-4" />
              <span>{now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              <span className="text-text-primary font-mono">{now.toLocaleTimeString()}</span>
            </div>

            <div className="flex gap-2">
              {[
                { label: 'New API',        icon: Plus,     route: '/api-playground' },
                { label: 'Run Query',      icon: Play,     route: '/db-sandbox' },
                { label: 'Start Workflow', icon: Workflow, route: '/workflows' },
              ].map(({ label, icon: Icon, route }) => (
                <button
                  key={label}
                  onClick={() => navigate(route)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20
                    transition-all duration-200 hover:scale-[1.03] cursor-pointer"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.header>

        {/* ── Metric Cards ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.title}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative overflow-hidden rounded-xl bg-surface-light border border-surface-lighter
                  p-5 hover:border-primary/30 transition-colors duration-300"
              >
                <Sparkline data={m.spark} color={m.color} />
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${m.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: m.color }} />
                  </div>
                  <span className="text-text-secondary text-sm font-medium">{m.title}</span>
                </div>
                <div className="text-3xl font-bold text-text-primary mb-1">
                  <AnimatedCounter value={m.value} />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <ArrowUpRight className="w-3 h-3" />
                  {m.change}% <span className="text-text-secondary ml-1">from last week</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Charts Row ──────────────────────────────────── */}
        <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* Line Chart */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-surface-light border border-surface-lighter rounded-xl p-6"
          >
            <h3 className="text-text-primary font-semibold mb-1">API Response Times</h3>
            <p className="text-text-secondary text-xs mb-5">Last 7 days — Avg &amp; P95 latency (ms)</p>
            <div className="h-72">
              {chartsInView && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={responseTimeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="p95Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 500]} />
                    <Tooltip content={<ResponseTimeTooltip />} />
                    <Area type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2.5} fill="url(#avgGrad)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#6366f1' }} name="Avg" animationDuration={1200} />
                    <Area type="monotone" dataKey="p95" stroke="#06b6d4" strokeWidth={2.5} fill="url(#p95Grad)" dot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#06b6d4' }} name="P95" animationDuration={1400} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Donut Chart */}
          <motion.div
            variants={itemVariants}
            className="bg-surface-light border border-surface-lighter rounded-xl p-6 flex flex-col items-center justify-center"
          >
            <h3 className="text-text-primary font-semibold mb-1 self-start">Request Distribution</h3>
            <p className="text-text-secondary text-xs mb-4 self-start">By HTTP method</p>
            <div className="h-56 w-full relative">
              {chartsInView && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={requestDistribution}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_, i) => setActivePieIndex(i)}
                      animationBegin={200}
                      animationDuration={1000}
                    >
                      {requestDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex gap-4 mt-2 flex-wrap justify-center">
              {requestDistribution.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Bottom Row ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
          {/* Recent API Activity */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1 bg-surface-light border border-surface-lighter rounded-xl p-5 overflow-hidden"
          >
            <h3 className="text-text-primary font-semibold mb-4">Recent API Activity</h3>
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {recentActivity.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg hover:bg-surface-lighter/50 transition-colors"
                >
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${methodColor[a.method]} min-w-[52px] text-center`}>
                    {a.method}
                  </span>
                  <span className="text-text-primary truncate flex-1 font-mono text-xs">{a.endpoint}</span>
                  <span className={`font-semibold text-xs ${statusColor(a.status)}`}>{a.status}</span>
                  <span className="text-text-secondary text-xs w-12 text-right">{a.time}</span>
                  <span className="text-text-muted text-xs hidden xl:block w-20 text-right">{a.when}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Active Workflows */}
          <motion.div
            variants={itemVariants}
            className="bg-surface-light border border-surface-lighter rounded-xl p-5"
          >
            <h3 className="text-text-primary font-semibold mb-4">Active Workflows</h3>
            <div className="space-y-4">
              {activeWorkflows.map((w, i) => (
                <motion.div
                  key={w.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-text-primary text-sm font-medium">{w.name}</span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${workflowStatusBadge[w.status]}`}>
                      {workflowStatusIcon[w.status]}
                      {w.status}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-lighter rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          w.status === 'Completed' ? '#10b981' :
                          w.status === 'Failed' ? '#ef4444' : '#6366f1',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${w.progress}%` }}
                      transition={{ duration: 1, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-text-secondary text-xs mt-1 block">{w.progress}% complete</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div
            variants={itemVariants}
            className="bg-surface-light border border-surface-lighter rounded-xl p-5"
          >
            <h3 className="text-text-primary font-semibold mb-4">System Health</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {systemServices.map((s, i) => (
                <motion.div
                  key={s.name}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.05 }}
                  onClick={() => s.route && navigate(s.route)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-lighter/50 transition-colors ${s.route ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusDot[s.status]}`} />
                    <span className={`text-sm ${s.route ? 'text-primary hover:underline' : 'text-text-primary'}`}>{s.name}</span>
                    {s.route && <ArrowUpRight className="w-3 h-3 text-text-muted" />}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium ${s.status === 'healthy' ? 'text-emerald-400' : s.status === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
                      {s.status === 'healthy' ? 'Healthy' : s.status === 'warning' ? 'Warning' : 'Error'}
                    </span>
                    {s.note && <p className="text-text-muted text-[10px]">{s.note}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Footer ──────────────────────────────────────── */}
        <motion.footer
          variants={itemVariants}
          className="text-center py-6 border-t border-surface-lighter"
        >
          <p className="text-text-secondary text-sm">
            Made by <span className="text-primary font-semibold">Senior SDET SHIVAM SHARMA</span>
          </p>
          <p className="text-text-muted text-xs mt-1">APIForge Lab — v1.0.0</p>
        </motion.footer>
      </motion.div>
    </div>
  );
}
