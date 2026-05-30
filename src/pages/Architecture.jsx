import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Monitor, Globe, Shield, Lock, Gauge, Users, ShoppingCart,
  Package, Database, Server, Radio, Bell, GitBranch, Workflow,
  ArrowDown, Zap, Layers, CheckCircle2, Send,
  Code2, Palette, FileJson, Activity,
  Cpu, Wifi,
} from 'lucide-react';

/* ───────────────── animation variants ───────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const pulse = {
  animate: {
    scale: [1, 1.4, 1],
    opacity: [0.6, 1, 0.6],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

/* ───────────────── reusable Section wrapper ───────────────── */
function Section({ children, className = '', id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={`relative py-20 px-6 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────── animated connection line ───────────────── */
function ConnectionLine() {
  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative w-px h-12 bg-gradient-to-b from-primary/60 to-accent/60">
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(6,182,212,0.8)]"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <ArrowDown className="w-4 h-4 text-accent/70" />
    </div>
  );
}

/* ───────────────── layer card component ───────────────── */
function LayerCard({ icon: Icon, title, desc, color = 'border-primary', delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(99,102,241,0.25)' }}
      className={`glass rounded-xl p-4 border-l-4 ${color} flex items-start gap-3 cursor-default transition-shadow`}
    >
      <div className="mt-0.5 shrink-0 p-2 rounded-lg bg-surface-lighter/60">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div>
        <h4 className="text-text-primary font-semibold text-sm">{title}</h4>
        <p className="text-text-muted text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ───────────────── layer wrapper ───────────────── */
function ArchLayer({ label, color, children, delay = 0 }) {
  return (
    <motion.div variants={fadeUp} custom={delay}>
      <div className="mb-2 flex items-center gap-2">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-bold tracking-widest uppercase text-text-secondary">
          {label}
        </span>
      </div>
      <div className="glass rounded-2xl p-5 gradient-border">
        {children}
      </div>
    </motion.div>
  );
}

/* ───────────────── data ───────────────── */
const microservices = [
  { icon: Lock, title: 'Auth Service', desc: 'JWT auth, OAuth2, session management', color: 'border-primary' },
  { icon: Users, title: 'Users Service', desc: 'Profile CRUD, roles & permissions', color: 'border-accent' },
  { icon: ShoppingCart, title: 'Orders Service', desc: 'Order lifecycle, payment flow', color: 'border-success' },
  { icon: Package, title: 'Products Service', desc: 'Catalog, inventory, pricing', color: 'border-warning' },
];

const databases = [
  { icon: Database, title: 'PostgreSQL', desc: 'Relational, ACID transactions', color: 'border-primary' },
  { icon: Database, title: 'MySQL', desc: 'Read replicas, analytics', color: 'border-accent' },
  { icon: FileJson, title: 'MongoDB', desc: 'Document store, flexible schema', color: 'border-success' },
  { icon: Zap, title: 'Redis', desc: 'In-memory cache, pub/sub', color: 'border-danger' },
];

const requestSteps = [
  { icon: Send, title: 'Client sends HTTP request', desc: 'Browser or mobile app dispatches REST / GraphQL call via HTTPS.' },
  { icon: Shield, title: 'API Gateway validates & routes', desc: 'Rate limiting, JWT verification, request schema validation, load balancing.' },
  { icon: Cpu, title: 'Microservice processes logic', desc: 'Business rules executed, domain events created, orchestration triggered.' },
  { icon: Database, title: 'Database query / mutation', desc: 'Optimized SQL or NoSQL operation with connection pooling and caching.' },
  { icon: Radio, title: 'Event published to broker', desc: 'Kafka / MQTT topic receives domain event for downstream consumers.' },
  { icon: CheckCircle2, title: 'Response returned to client', desc: 'Serialized JSON payload with proper status code, headers, and timing.' },
];

const techDecisions = [
  { icon: Code2, title: 'React', reason: 'Component-based UI with hooks, virtual DOM, and massive ecosystem.' },
  { icon: Palette, title: 'Tailwind CSS', reason: 'Utility-first styling enabling rapid, consistent design systems.' },
  { icon: Database, title: 'PostgreSQL', reason: 'ACID compliance, complex queries, and robust transaction support.' },
  { icon: FileJson, title: 'MongoDB', reason: 'Flexible document storage for evolving schemas and nested data.' },
  { icon: Zap, title: 'Redis', reason: 'Sub-millisecond in-memory caching and real-time pub/sub messaging.' },
  { icon: Activity, title: 'Kafka', reason: 'High-throughput, fault-tolerant event streaming at scale.' },
  { icon: Wifi, title: 'MQTT', reason: 'Lightweight IoT messaging with minimal bandwidth overhead.' },
  { icon: Workflow, title: 'Camunda', reason: 'Visual BPMN workflow orchestration with audit trails.' },
];

/* ═══════════════════════════════════════════════════════════ */
/*                      MAIN COMPONENT                        */
/* ═══════════════════════════════════════════════════════════ */
export default function Architecture() {
  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* ── background orbs ── */}
      {[
        { size: 340, x: '8%', y: '12%', color: 'rgba(99,102,241,0.10)', dur: 20 },
        { size: 260, x: '80%', y: '8%', color: 'rgba(6,182,212,0.08)', dur: 24 },
        { size: 200, x: '55%', y: '65%', color: 'rgba(16,185,129,0.06)', dur: 22 },
      ].map((o, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full blur-3xl pointer-events-none"
          style={{ width: o.size, height: o.size, left: o.x, top: o.y, background: o.color }}
          animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* ══════════ HERO ══════════ */}
      <Section className="pt-32 pb-12 text-center">
        <motion.div variants={fadeUp} custom={0} className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-accent mb-6">
            <Layers className="w-3.5 h-3.5" /> Architecture Overview
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold gradient-text leading-tight">
            System Architecture
          </h1>
          <p className="mt-5 text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            A comprehensive look at how APIForge Lab's layers interconnect — from the
            client browser through microservices, databases, event brokers, and workflow
            engines.
          </p>
        </motion.div>
      </Section>

      {/* ══════════ ARCHITECTURE DIAGRAM ══════════ */}
      <Section id="diagram">
        <div className="max-w-4xl mx-auto space-y-0">
          {/* Client Layer */}
          <ArchLayer label="Client Layer" color="#6366f1" delay={0}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LayerCard icon={Monitor} title="React SPA" desc="Single-page application with component-driven UI" color="border-primary" delay={0.1} />
              <LayerCard icon={Globe} title="Vite Dev Server" desc="Lightning-fast HMR, ESM-native bundling" color="border-accent" delay={0.2} />
            </div>
          </ArchLayer>

          <ConnectionLine />

          {/* API Gateway */}
          <ArchLayer label="API Gateway" color="#06b6d4" delay={0.3}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LayerCard icon={Server} title="Load Balancer" desc="Round-robin, health checks" color="border-accent" delay={0.3} />
              <LayerCard icon={Gauge} title="Rate Limiter" desc="Token bucket, sliding window" color="border-warning" delay={0.4} />
              <LayerCard icon={Shield} title="Auth Middleware" desc="JWT validation, RBAC" color="border-primary" delay={0.5} />
            </div>
          </ArchLayer>

          <ConnectionLine />

          {/* Microservices */}
          <ArchLayer label="Microservices Layer" color="#10b981" delay={0.5}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {microservices.map((s, i) => (
                <LayerCard key={s.title} {...s} delay={0.5 + i * 0.1} />
              ))}
            </div>
          </ArchLayer>

          <ConnectionLine />

          {/* Databases */}
          <ArchLayer label="Database Layer" color="#f59e0b" delay={0.8}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {databases.map((d, i) => (
                <LayerCard key={d.title} {...d} delay={0.8 + i * 0.1} />
              ))}
            </div>
          </ArchLayer>

          <ConnectionLine />

          {/* Event Layer */}
          <ArchLayer label="Event Layer" color="#ef4444" delay={1.0}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LayerCard icon={Radio} title="Apache Kafka" desc="High-throughput distributed event streaming" color="border-danger" delay={1.0} />
              <LayerCard icon={Bell} title="MQTT Broker" desc="Lightweight pub/sub for IoT and telemetry" color="border-warning" delay={1.1} />
            </div>
          </ArchLayer>

          <ConnectionLine />

          {/* Workflow Engine */}
          <ArchLayer label="Workflow Engine" color="#8b5cf6" delay={1.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LayerCard icon={GitBranch} title="Camunda BPMN" desc="Visual process orchestration and decision tables" color="border-primary" delay={1.2} />
              <LayerCard icon={Workflow} title="Apache NiFi" desc="Data flow automation with drag-and-drop DAGs" color="border-accent" delay={1.3} />
            </div>
          </ArchLayer>
        </div>
      </Section>

      {/* ══════════ REQUEST LIFECYCLE ══════════ */}
      <Section id="lifecycle" className="bg-surface-light/30">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text">Request Lifecycle</h2>
            <p className="text-text-secondary mt-3">
              Follow a single request as it traverses every layer of the stack.
            </p>
          </motion.div>

          <div className="relative">
            {/* vertical timeline line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-success" />

            <div className="space-y-10">
              {requestSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i * 0.15}
                    className="relative pl-16 md:pl-20"
                  >
                    {/* step number dot */}
                    <div className="absolute left-3 md:left-5 top-1 flex items-center justify-center w-7 h-7 rounded-full bg-surface border-2 border-primary text-xs font-bold text-primary z-10">
                      {i + 1}
                    </div>
                    {/* pulsing indicator */}
                    <motion.div
                      className="absolute left-[18px] md:left-[26px] top-[10px] w-3 h-3 rounded-full bg-primary/40"
                      variants={pulse}
                      animate="animate"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />

                    <motion.div
                      whileHover={{ x: 6 }}
                      className="glass rounded-xl p-5 border-l-4 border-primary/60 hover:border-accent transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-accent" />
                        <h4 className="font-semibold text-text-primary text-sm">{step.title}</h4>
                      </div>
                      <p className="text-text-muted text-xs leading-relaxed">{step.desc}</p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════ TECHNOLOGY DECISIONS ══════════ */}
      <Section id="tech">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text">Technology Decisions</h2>
            <p className="text-text-secondary mt-3">
              Why each technology was chosen for the APIForge Lab stack.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {techDecisions.map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.div
                  key={t.title}
                  variants={fadeUp}
                  custom={i * 0.08}
                  whileHover={{ y: -6, boxShadow: '0 0 30px rgba(99,102,241,0.18)' }}
                  className="glass rounded-xl p-5 text-center cursor-default group"
                >
                  <div className="mx-auto w-12 h-12 rounded-xl bg-surface-lighter/70 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-accent group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="font-bold text-text-primary text-sm mb-1">{t.title}</h4>
                  <p className="text-text-muted text-xs leading-relaxed">{t.reason}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ══════════ FOOTER CREDIT ══════════ */}
      <footer className="py-10 text-center border-t border-surface-lighter/40">
        <p className="text-text-muted text-sm">
          Designed by{' '}
          <span className="gradient-text font-semibold">Senior SDET SHIVAM SHARMA</span>
        </p>
      </footer>
    </div>
  );
}
