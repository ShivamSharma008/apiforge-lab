import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Wifi,
  Send,
  Pause,
  Play,
  Trash2,
  Filter,
  X,
  CheckCircle2,
  ChevronDown,
  Activity,
  Zap,
  BarChart3,
  Clock,
  Eye,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ═══════════════════════════════════════════════════════ */

const KAFKA_TOPICS = [
  'user.created',
  'user.updated',
  'order.placed',
  'order.completed',
  'payment.processed',
  'inventory.updated',
  'notification.sent',
];

const TOPIC_COLORS = {
  'user.created': 'bg-primary/20 text-primary-light',
  'user.updated': 'bg-accent/20 text-accent',
  'order.placed': 'bg-warning/20 text-warning',
  'order.completed': 'bg-success/20 text-success',
  'payment.processed': 'bg-danger/20 text-danger',
  'inventory.updated': 'bg-cyan-500/20 text-cyan-400',
  'notification.sent': 'bg-purple-500/20 text-purple-400',
};

const FIRST_NAMES = ['Shivam', 'Arjun', 'Priya', 'Sneha', 'Rahul', 'Ankit', 'Neha', 'Divya', 'Karan', 'Riya'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Joshi', 'Mishra', 'Rao', 'Reddy'];
const PRODUCTS = ['Laptop', 'Phone', 'Tablet', 'Headphones', 'Monitor', 'Keyboard', 'Mouse', 'SSD', 'RAM', 'GPU'];

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rndId = () => Math.random().toString(36).substring(2, 10);
const pick = (arr) => arr[rnd(0, arr.length - 1)];

function topicPayload(topic) {
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  switch (topic) {
    case 'user.created':
      return { userId: `usr-${rndId()}`, name, email: `${name.split(' ')[0].toLowerCase()}@example.com`, plan: pick(['free', 'pro', 'enterprise']), createdAt: new Date().toISOString() };
    case 'user.updated':
      return { userId: `usr-${rndId()}`, field: pick(['email', 'name', 'avatar', 'plan']), oldValue: 'old_value', newValue: 'new_value', updatedAt: new Date().toISOString() };
    case 'order.placed':
      return { orderId: `ord-${rndId()}`, userId: `usr-${rndId()}`, items: [{ product: pick(PRODUCTS), qty: rnd(1, 5), price: rnd(10, 999) }], total: rnd(10, 2000), currency: 'USD' };
    case 'order.completed':
      return { orderId: `ord-${rndId()}`, status: 'completed', deliveredAt: new Date().toISOString(), rating: rnd(3, 5) };
    case 'payment.processed':
      return { paymentId: `pay-${rndId()}`, orderId: `ord-${rndId()}`, amount: rnd(10, 2000), method: pick(['credit_card', 'debit_card', 'upi', 'paypal']), status: 'success' };
    case 'inventory.updated':
      return { sku: `SKU-${rndId().toUpperCase()}`, product: pick(PRODUCTS), warehouse: pick(['WH-01', 'WH-02', 'WH-03']), delta: rnd(-50, 200), stock: rnd(0, 1000) };
    case 'notification.sent':
      return { notifId: `ntf-${rndId()}`, channel: pick(['email', 'sms', 'push', 'slack']), recipient: `usr-${rndId()}`, template: pick(['welcome', 'order_confirm', 'password_reset', 'promo']), status: 'delivered' };
    default:
      return { data: 'sample' };
  }
}

function formatTs(d) {
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

function generateEvent(source = null) {
  const s = source || pick(['kafka', 'mqtt']);
  const topic = s === 'kafka' ? pick(KAFKA_TOPICS) : `devices/sensor-${rnd(1, 10).toString().padStart(3, '0')}/${pick(['temperature', 'humidity', 'pressure'])}`;
  const partition = rnd(0, 3);
  const offset = rnd(1000, 99999);
  const payload = s === 'kafka' ? topicPayload(topic) : { sensorId: `sensor-${rndId()}`, value: +(Math.random() * 100).toFixed(2), unit: pick(['°C', '%', 'hPa']), ts: Date.now() };
  return {
    id: rndId(),
    timestamp: new Date(),
    source: s,
    topic,
    key: s === 'kafka' ? (Object.values(topicPayload(topic))[0] || rndId()) : null,
    payload,
    partition: s === 'kafka' ? partition : null,
    offset: s === 'kafka' ? offset : null,
    qos: s === 'mqtt' ? rnd(0, 2) : null,
  };
}

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════ */

function Dropdown({ value, onChange, options, label, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && <label className="block text-xs text-text-secondary mb-1">{label}</label>}
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between bg-surface px-3 py-2 rounded-lg border border-surface-lighter text-sm text-text-primary hover:border-primary/50 transition-colors">
        <span className="truncate">{value}</span>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute z-50 mt-1 w-full bg-surface-light border border-surface-lighter rounded-lg shadow-xl max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <li key={typeof opt === 'string' ? opt : opt.value} onClick={() => { onChange(typeof opt === 'string' ? opt : opt.value); setOpen(false); }} className={`px-3 py-2 text-sm cursor-pointer hover:bg-surface-lighter transition-colors ${(typeof opt === 'string' ? opt : opt.value) === value ? 'text-primary' : 'text-text-primary'}`}>
                {typeof opt === 'string' ? opt : opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toast({ message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: 30, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed bottom-6 right-6 z-[100] bg-surface-light border border-success/40 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 max-w-sm">
      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
      <span className="text-sm text-text-primary">{message}</span>
      <button onClick={onClose} className="ml-auto"><X className="w-4 h-4 text-text-secondary hover:text-text-primary" /></button>
    </motion.div>
  );
}

function EventDetailModal({ event, onClose }) {
  if (!event) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-surface-light border border-surface-lighter rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-lighter">
          <div className="flex items-center gap-3">
            {event.source === 'kafka' ? <Radio className="w-5 h-5 text-primary" /> : <Wifi className="w-5 h-5 text-accent" />}
            <h3 className="text-lg font-semibold text-text-primary">Event Detail</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-lighter transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          <Row label="Timestamp" val={formatTs(event.timestamp)} />
          <Row label="Source" val={event.source.toUpperCase()} />
          <Row label="Topic" val={event.topic} />
          {event.key && <Row label="Key" val={String(event.key)} />}
          {event.partition !== null && <Row label="Partition" val={event.partition} />}
          {event.offset !== null && <Row label="Offset" val={event.offset} />}
          {event.qos !== null && <Row label="QoS" val={event.qos} />}
          <div>
            <span className="text-xs text-text-secondary block mb-1">Payload</span>
            <pre className="code-editor text-xs text-text-primary whitespace-pre-wrap break-all max-h-60 overflow-y-auto">{JSON.stringify(event.payload, null, 2)}</pre>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Row({ label, val }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary w-20 shrink-0">{label}</span>
      <span className="text-sm text-text-primary font-mono">{val}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

export default function Events() {
  const navigate = useNavigate();

  // Publisher
  const [pubTab, setPubTab] = useState('kafka');
  const [kafkaTopic, setKafkaTopic] = useState(KAFKA_TOPICS[0]);
  const [kafkaPartition, setKafkaPartition] = useState(0);
  const [kafkaKey, setKafkaKey] = useState('');
  const [kafkaPayload, setKafkaPayload] = useState(() => JSON.stringify(topicPayload(KAFKA_TOPICS[0]), null, 2));
  const [mqttTopic, setMqttTopic] = useState('devices/sensor-001/temperature');
  const [mqttQos, setMqttQos] = useState(0);
  const [mqttRetain, setMqttRetain] = useState(false);
  const [mqttPayload, setMqttPayload] = useState(() => JSON.stringify({ sensorId: 'sensor-001', value: 24.5, unit: '°C', ts: Date.now() }, null, 2));
  const [publishing, setPublishing] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Stream
  const [events, setEvents] = useState([]);
  const [paused, setPaused] = useState(false);
  const [filterTopic, setFilterTopic] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Metrics
  const [totalPublished, setTotalPublished] = useState(0);
  const [eps, setEps] = useState(0);
  const [sparkData, setSparkData] = useState(() => Array.from({ length: 30 }, (_, i) => ({ t: i, v: 0 })));
  const [partitionDist, setPartitionDist] = useState([
    { p: 'P0', v: 0 }, { p: 'P1', v: 0 }, { p: 'P2', v: 0 }, { p: 'P3', v: 0 },
  ]);
  const epsCounter = useRef(0);

  // Auto-generate events
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const evt = generateEvent();
      setEvents((prev) => [evt, ...prev].slice(0, 20));
      setTotalPublished((p) => p + 1);
      epsCounter.current += 1;
      if (evt.partition !== null) {
        setPartitionDist((prev) => prev.map((d, i) => i === evt.partition ? { ...d, v: d.v + 1 } : d));
      }
    }, rnd(2000, 3000));
    return () => clearInterval(interval);
  }, [paused]);

  // EPS counter
  useEffect(() => {
    const interval = setInterval(() => {
      setEps(epsCounter.current);
      setSparkData((prev) => [...prev.slice(1), { t: prev[prev.length - 1].t + 1, v: epsCounter.current }]);
      epsCounter.current = 0;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeTopics = useMemo(() => {
    const set = new Set(events.map((e) => e.topic));
    return set.size;
  }, [events]);

  const allTopicsInStream = useMemo(() => {
    const set = new Set(events.map((e) => e.topic));
    return ['all', ...set];
  }, [events]);

  const handleKafkaTopicChange = useCallback((topic) => {
    setKafkaTopic(topic);
    setKafkaPayload(JSON.stringify(topicPayload(topic), null, 2));
  }, []);

  const filteredEvents = useMemo(() => {
    if (filterTopic === 'all') return events;
    return events.filter((e) => e.topic === filterTopic);
  }, [events, filterTopic]);

  const handlePublish = useCallback(() => {
    setPublishing(true);
    setTimeout(() => {
      const partition = pubTab === 'kafka' ? kafkaPartition : null;
      const offset = rnd(1000, 99999);
      let payload;
      try { payload = JSON.parse(pubTab === 'kafka' ? kafkaPayload : mqttPayload); } catch { payload = { raw: pubTab === 'kafka' ? kafkaPayload : mqttPayload }; }

      const evt = {
        id: rndId(),
        timestamp: new Date(),
        source: pubTab,
        topic: pubTab === 'kafka' ? kafkaTopic : mqttTopic,
        key: pubTab === 'kafka' ? (kafkaKey || null) : null,
        payload,
        partition,
        offset: pubTab === 'kafka' ? offset : null,
        qos: pubTab === 'mqtt' ? mqttQos : null,
      };

      setEvents((prev) => [evt, ...prev].slice(0, 20));
      setTotalPublished((p) => p + 1);
      if (partition !== null) {
        setPartitionDist((prev) => prev.map((d, i) => i === partition ? { ...d, v: d.v + 1 } : d));
      }
      setPublishing(false);
      setToast(pubTab === 'kafka'
        ? `Published to ${kafkaTopic} — Partition: ${partition}, Offset: ${offset}, Time: ${formatTs(new Date())}`
        : `Published to ${mqttTopic} — QoS: ${mqttQos}, Time: ${formatTs(new Date())}`);
    }, 600);
  }, [pubTab, kafkaTopic, kafkaPartition, kafkaKey, kafkaPayload, mqttTopic, mqttQos, mqttPayload]);

  /* ═══════ RENDER ═══════ */
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-surface-lighter">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-surface-light transition-colors"><ArrowLeft className="w-5 h-5 text-text-secondary" /></button>
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold gradient-text">Event Simulator</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Connection indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-surface-light px-3 py-1.5 rounded-full border border-success/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              <span className="text-xs text-success">Connected to Kafka Broker</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* ──────────── LEFT: Publisher + Stream (3 cols) ──────────── */}
          <div className="xl:col-span-3 space-y-6">
            {/* ======== EVENT PUBLISHER ======== */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface-light rounded-2xl border border-surface-lighter overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-surface-lighter">
                {['kafka', 'mqtt'].map((tab) => (
                  <button key={tab} onClick={() => setPubTab(tab)} className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${pubTab === tab ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                    {tab === 'kafka' ? <Radio className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                    {tab.toUpperCase()}
                    {pubTab === tab && <motion.div layoutId="pubTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                  </button>
                ))}
                <div className="ml-auto flex items-center px-4">
                  <span className="text-xs text-text-muted">Publisher</span>
                </div>
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  {pubTab === 'kafka' ? (
                    <motion.div key="kafka" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Dropdown label="Topic" value={kafkaTopic} onChange={handleKafkaTopicChange} options={KAFKA_TOPICS} />
                        <Dropdown label="Partition" value={String(kafkaPartition)} onChange={(v) => setKafkaPartition(Number(v))} options={['0', '1', '2', '3']} />
                        <div>
                          <label className="block text-xs text-text-secondary mb-1">Key</label>
                          <input value={kafkaKey} onChange={(e) => setKafkaKey(e.target.value)} placeholder="Optional key..." className="w-full bg-surface px-3 py-2 rounded-lg border border-surface-lighter text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Payload (JSON)</label>
                        <textarea value={kafkaPayload} onChange={(e) => setKafkaPayload(e.target.value)} rows={6} className="w-full bg-surface px-4 py-3 rounded-lg border border-surface-lighter text-sm text-text-primary font-mono focus:outline-none focus:border-primary/50 transition-colors resize-none" spellCheck={false} />
                      </div>
                      <motion.button onClick={handlePublish} disabled={publishing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50">
                        {publishing ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block"><Send className="w-4 h-4" /></motion.span> : <Send className="w-4 h-4" />}
                        {publishing ? 'Publishing...' : 'Publish Event'}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div key="mqtt" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                          <label className="block text-xs text-text-secondary mb-1">Topic</label>
                          <input value={mqttTopic} onChange={(e) => setMqttTopic(e.target.value)} className="w-full bg-surface px-3 py-2 rounded-lg border border-surface-lighter text-sm text-text-primary font-mono focus:outline-none focus:border-accent/50 transition-colors" />
                        </div>
                        <Dropdown label="QoS" value={String(mqttQos)} onChange={(v) => setMqttQos(Number(v))} options={[{ value: '0', label: '0 — At most once' }, { value: '1', label: '1 — At least once' }, { value: '2', label: '2 — Exactly once' }]} />
                        <div className="flex items-end">
                          <div>
                            <label className="block text-xs text-text-secondary mb-1">Retain</label>
                            <button onClick={() => setMqttRetain(!mqttRetain)} className="flex items-center gap-2 text-sm text-text-primary">
                              {mqttRetain ? <ToggleRight className="w-7 h-7 text-accent" /> : <ToggleLeft className="w-7 h-7 text-text-secondary" />}
                              {mqttRetain ? 'On' : 'Off'}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Payload (JSON)</label>
                        <textarea value={mqttPayload} onChange={(e) => setMqttPayload(e.target.value)} rows={6} className="w-full bg-surface px-4 py-3 rounded-lg border border-surface-lighter text-sm text-text-primary font-mono focus:outline-none focus:border-accent/50 transition-colors resize-none" spellCheck={false} />
                      </div>
                      <motion.button onClick={handlePublish} disabled={publishing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-50">
                        {publishing ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block"><Send className="w-4 h-4" /></motion.span> : <Send className="w-4 h-4" />}
                        {publishing ? 'Publishing...' : 'Publish Message'}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>

            {/* ======== EVENT STREAM ======== */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface-light rounded-2xl border border-surface-lighter overflow-hidden">
              <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-surface-lighter gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  <h2 className="text-sm font-semibold text-text-primary">Live Event Stream</h2>
                  {!paused && (
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Dropdown value={filterTopic} onChange={setFilterTopic} options={allTopicsInStream} className="w-44" />
                  <button onClick={() => setPaused(!paused)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${paused ? 'bg-success/20 text-success hover:bg-success/30' : 'bg-warning/20 text-warning hover:bg-warning/30'}`}>
                    {paused ? <><Play className="w-3.5 h-3.5" /> Resume</> : <><Pause className="w-3.5 h-3.5" /> Pause</>}
                  </button>
                  <button onClick={() => setEvents([])} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-danger/20 text-danger hover:bg-danger/30 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>

              <div className="divide-y divide-surface-lighter max-h-[420px] overflow-y-auto">
                <AnimatePresence initial={false}>
                  {filteredEvents.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-10 text-center text-text-muted text-sm">
                      {paused ? 'Stream paused — click Resume to continue' : 'Waiting for events...'}
                    </motion.div>
                  )}
                  {filteredEvents.map((evt) => (
                    <motion.div key={evt.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} onClick={() => setSelectedEvent(evt)} className="flex items-center gap-3 px-5 py-2.5 hover:bg-surface-lighter/50 cursor-pointer transition-colors group">
                      {/* Timestamp */}
                      <span className="text-xs text-text-muted font-mono w-24 shrink-0 hidden sm:block">{formatTs(evt.timestamp)}</span>
                      {/* Source icon */}
                      {evt.source === 'kafka' ? <Radio className="w-4 h-4 text-primary shrink-0" /> : <Wifi className="w-4 h-4 text-accent shrink-0" />}
                      {/* Topic badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${TOPIC_COLORS[evt.topic] || 'bg-surface-lighter text-text-secondary'}`}>{evt.topic}</span>
                      {/* Key */}
                      {evt.key && <span className="text-xs text-text-secondary font-mono truncate max-w-[100px] hidden md:block">{String(evt.key)}</span>}
                      {/* Payload preview */}
                      <span className="text-xs text-text-muted font-mono truncate flex-1 hidden lg:block">{JSON.stringify(evt.payload).slice(0, 80)}…</span>
                      {/* Partition/Offset */}
                      {evt.partition !== null && (
                        <span className="text-xs text-text-muted hidden md:block">P{evt.partition}:O{evt.offset}</span>
                      )}
                      {evt.qos !== null && (
                        <span className="text-xs text-text-muted hidden md:block">QoS {evt.qos}</span>
                      )}
                      <Eye className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>

          {/* ──────────── RIGHT: Metrics Sidebar ──────────── */}
          <div className="space-y-5">
            {/* EPS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-surface-light rounded-2xl border border-surface-lighter p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-warning" />
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Events / sec</span>
              </div>
              <motion.div key={eps} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-4xl font-bold text-warning">{eps}</motion.div>
            </motion.div>

            {/* Total published */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface-light rounded-2xl border border-surface-lighter p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Total Events</span>
              </div>
              <div className="text-4xl font-bold text-primary">{totalPublished}</div>
            </motion.div>

            {/* Active topics */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-surface-light rounded-2xl border border-surface-lighter p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-accent" />
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Active Topics</span>
              </div>
              <div className="text-4xl font-bold text-accent">{activeTopics}</div>
            </motion.div>

            {/* Sparkline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface-light rounded-2xl border border-surface-lighter p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-success" />
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Last 30s</span>
              </div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData}>
                    <defs>
                      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#10b981" fill="url(#sparkGrad)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Partition distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-surface-light rounded-2xl border border-surface-lighter p-5">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-danger" />
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Partition Dist.</span>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={partitionDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="p" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#f1f5f9' }} />
                    <Bar dataKey="v" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Connection card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface-light rounded-2xl border border-surface-lighter p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                </span>
                <span className="text-xs text-success font-medium">Kafka Broker</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                </span>
                <span className="text-xs text-success font-medium">MQTT Broker</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="text-center py-6 border-t border-surface-lighter mt-8">
        <span className="text-xs text-text-muted tracking-widest uppercase">Made by Senior SDET SHIVAM SHARMA</span>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </AnimatePresence>
    </div>
  );
}
