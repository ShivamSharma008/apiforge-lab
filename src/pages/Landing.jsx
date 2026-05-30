import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import heroImage from '../assets/hero.png';
import {
  Zap,
  Database,
  GitBranch,
  Radio,
  TestTube2,
  BookOpen,
  ArrowRight,
  Play,
  ChevronRight,
  Shield,
  Server,
  Globe,
  Layers,
  Send,
  CheckCircle2,
  Bell,
  Workflow,
  Sparkles,
} from 'lucide-react';

/* ───────────────────── animation helpers ───────────────────── */
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
      className={`relative py-24 px-6 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(rgba(168,179,194,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(168,179,194,0.08) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-surface to-transparent" />
    </div>
  );
}

/* ───────────────── 1. HERO ───────────────── */
function Hero() {
  const codeSnippet = `// POST /api/v1/users
fetch('/api/v1/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    name: 'Shivam Sharma',
    role: 'Senior SDET'
  })
})

// ✅ 201 Created
{
  "id": "usr_8x4k2",
  "name": "Shivam Sharma",
  "role": "Senior SDET",
  "createdAt": "2025-07-08T10:30:00Z"
}`;

  const stats = [
    '10+ Modules',
    '5 Database Types',
    'Real-time Events',
    'Workflow Engine',
  ];

  return (
    <section className="relative min-h-[82svh] flex items-center overflow-hidden border-b border-surface-lighter/40">
      <HeroBackdrop />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        {/* left */}
        <motion.div
          className="flex flex-col justify-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary-light"
          >
            <Sparkles size={14} />
            Made by Senior SDET SHIVAM SHARMA
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight"
          >
            <span className="gradient-text">Build. Test.</span>
            <br />
            <span className="gradient-text">Simulate.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 max-w-xl text-lg text-text-secondary leading-relaxed"
          >
            The ultimate playground for{' '}
            <span className="text-accent font-semibold">APIs</span>,{' '}
            <span className="text-primary-light font-semibold">Databases</span>,{' '}
            <span className="text-success font-semibold">Workflows</span> &amp;{' '}
            <span className="text-warning font-semibold">Event-Driven Integrations</span>
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark hover:shadow-primary/40"
            >
              Explore Platform <ArrowRight size={18} />
            </Link>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 rounded-lg border border-surface-lighter px-6 py-3 font-semibold text-text-secondary transition hover:border-primary hover:text-text-primary"
            >
              View Architecture <ChevronRight size={18} />
            </a>
          </motion.div>

          {/* stats bar */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-12 flex flex-wrap gap-6 text-sm text-text-muted"
          >
            {stats.map((s, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {s}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* right — product scene */}
        <motion.div
          className="hidden lg:flex items-center justify-center"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative w-full max-w-xl">
            <motion.img
              src={heroImage}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 opacity-35"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative animate-float"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="rounded-lg border border-surface-lighter bg-[#080b10] shadow-2xl shadow-primary/10">
                <div className="flex items-center gap-2 border-b border-surface-lighter px-4 py-2.5">
                  <span className="h-3 w-3 rounded-full bg-danger" />
                  <span className="h-3 w-3 rounded-full bg-warning" />
                  <span className="h-3 w-3 rounded-full bg-success" />
                  <span className="ml-3 text-xs text-text-muted">api-request.js</span>
                  <span className="ml-auto rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                    201 CREATED
                  </span>
                </div>
                <pre className="code-editor max-h-[480px] overflow-x-auto p-4 text-xs leading-relaxed">
                  <code className="text-text-secondary">{codeSnippet}</code>
                </pre>
              </div>
            </motion.div>
            <div className="relative z-10 mt-4 grid grid-cols-4 gap-3 rounded-lg border border-surface-lighter bg-surface-light/80 p-3 shadow-xl shadow-black/20 backdrop-blur">
              {[
                ['99.9%', 'Gateway uptime'],
                ['83ms', 'Avg mock latency'],
                ['8', 'Ready endpoints'],
                ['Live', 'Event stream'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-md bg-surface/80 px-3 py-2">
                  <p className="text-base font-bold text-text-primary">{value}</p>
                  <p className="text-[11px] text-text-secondary">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────── 2. FEATURES GRID ───────────────── */
const features = [
  {
    icon: Zap,
    title: 'API Playground',
    desc: 'Create, test, and simulate REST APIs with real-time response validation',
    color: 'text-primary-light',
    glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]',
  },
  {
    icon: Database,
    title: 'Database Sandbox',
    desc: 'Practice SQL & NoSQL with PostgreSQL, MySQL, MongoDB sandboxes',
    color: 'text-accent',
    glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.25)]',
  },
  {
    icon: GitBranch,
    title: 'Workflow Engine',
    desc: 'Design and execute BPMN workflows with Camunda integration',
    color: 'text-success',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.25)]',
  },
  {
    icon: Radio,
    title: 'Event Simulator',
    desc: 'Publish and consume Kafka, MQTT events in real-time',
    color: 'text-warning',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]',
  },
  {
    icon: TestTube2,
    title: 'Test Runner',
    desc: 'Create test suites, assertions, and automated validation',
    color: 'text-danger',
    glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.25)]',
  },
  {
    icon: BookOpen,
    title: 'Learning Labs',
    desc: 'Interactive tutorials from beginner to advanced',
    color: 'text-primary-light',
    glow: 'hover:shadow-[0_0_30px_rgba(129,140,248,0.25)]',
  },
];

function Features() {
  return (
    <Section className="max-w-7xl mx-auto">
      <motion.h2
        variants={fadeUp}
        className="text-center text-3xl sm:text-4xl font-bold gradient-text mb-4"
      >
        Everything You Need
      </motion.h2>
      <motion.p
        variants={fadeUp}
        custom={1}
        className="text-center text-text-secondary mb-14 max-w-2xl mx-auto"
      >
        A comprehensive suite of tools designed for API development, testing, and simulation
      </motion.p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              className={`group relative glass rounded-xl p-6 transition-all duration-300 cursor-default ${f.glow} hover:border-primary/40`}
            >
              {/* gradient border on hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border border-transparent bg-gradient-to-br from-primary/20 via-accent/10 to-success/10" />

              <div className="relative z-10">
                <div
                  className={`mb-4 inline-flex items-center justify-center h-12 w-12 rounded-lg bg-surface-light ${f.color}`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}

/* ───────────────── 2B. LEARNING PATH ───────────────── */
const learningPath = [
  {
    title: 'Send a Mock API',
    detail: 'Choose an endpoint, add headers, send, and inspect status, time, body, and response headers.',
    to: '/api-playground',
    icon: Zap,
    accent: 'text-primary-light',
  },
  {
    title: 'Run a Database Query',
    detail: 'Try SQL shortcuts, inspect schemas, sort returned rows, and review query history.',
    to: '/db-sandbox',
    icon: Database,
    accent: 'text-accent',
  },
  {
    title: 'Watch Systems React',
    detail: 'Publish Kafka or MQTT events, run a workflow, then verify live metrics on the dashboard.',
    to: '/events',
    icon: Workflow,
    accent: 'text-success',
  },
];

function LearningPath() {
  return (
    <Section className="border-y border-surface-lighter/40 bg-surface-light/30">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <motion.div variants={fadeUp}>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary-light">
            Guided learning flow
          </p>
          <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Learn API testing by doing the real workflow.
          </h2>
          <p className="mt-4 max-w-xl text-text-secondary">
            The app now points learners toward a simple end-to-end path: request, data,
            event, workflow, and dashboard verification.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {learningPath.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                custom={index + 1}
                className="rounded-lg border border-surface-lighter bg-surface/70 p-5"
              >
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-surface-lighter ${item.accent}`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.detail}</p>
                <Link
                  to={item.to}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-light hover:text-accent"
                >
                  Open lab <ArrowRight size={15} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ───────────────── 3. ARCHITECTURE ───────────────── */
const services = [
  { name: 'Auth', icon: Shield, color: 'bg-primary/20 text-primary-light' },
  { name: 'Project', icon: Layers, color: 'bg-accent/20 text-accent' },
  { name: 'API Sandbox', icon: Zap, color: 'bg-primary/20 text-primary-light' },
  { name: 'DB Sandbox', icon: Database, color: 'bg-accent/20 text-accent' },
  { name: 'Test Runner', icon: TestTube2, color: 'bg-danger/20 text-danger' },
  { name: 'Workflow', icon: GitBranch, color: 'bg-success/20 text-success' },
  { name: 'Event', icon: Radio, color: 'bg-warning/20 text-warning' },
  { name: 'Learning', icon: BookOpen, color: 'bg-primary/20 text-primary-light' },
  { name: 'Audit', icon: Shield, color: 'bg-text-muted/20 text-text-muted' },
];

const infra = [
  { name: 'PostgreSQL', color: 'bg-primary/20 text-primary-light border-primary/30' },
  { name: 'MongoDB', color: 'bg-success/20 text-success border-success/30' },
  { name: 'Redis', color: 'bg-danger/20 text-danger border-danger/30' },
  { name: 'Kafka', color: 'bg-warning/20 text-warning border-warning/30' },
  { name: 'MQTT', color: 'bg-accent/20 text-accent border-accent/30' },
  { name: 'Camunda', color: 'bg-primary/20 text-primary-light border-primary/30' },
  { name: 'NiFi', color: 'bg-success/20 text-success border-success/30' },
];

function Architecture() {
  return (
    <Section id="architecture" className="max-w-7xl mx-auto">
      <motion.h2
        variants={fadeUp}
        className="text-center text-3xl sm:text-4xl font-bold gradient-text mb-4"
      >
        Enterprise-Grade Architecture
      </motion.h2>
      <motion.p
        variants={fadeUp}
        custom={1}
        className="text-center text-text-secondary mb-16 max-w-2xl mx-auto"
      >
        Built on a microservices foundation with event-driven communication
      </motion.p>

      <div className="space-y-8">
        {/* Frontend */}
        <motion.div variants={fadeUp} custom={2} className="flex justify-center">
          <div className="glass rounded-xl px-8 py-4 flex items-center gap-3 glow-primary">
            <Globe size={20} className="text-primary-light" />
            <span className="font-semibold text-text-primary">React Frontend</span>
          </div>
        </motion.div>

        {/* connector */}
        <div className="flex justify-center">
          <div className="w-px h-10 bg-gradient-to-b from-primary/60 to-accent/60" />
        </div>

        {/* API Gateway */}
        <motion.div variants={fadeUp} custom={3} className="flex justify-center">
          <div className="glass rounded-xl px-8 py-4 flex items-center gap-3 glow-accent">
            <Server size={20} className="text-accent" />
            <span className="font-semibold text-text-primary">API Gateway</span>
          </div>
        </motion.div>

        {/* connector */}
        <div className="flex justify-center">
          <div className="w-px h-10 bg-gradient-to-b from-accent/60 to-success/60" />
        </div>

        {/* Microservices */}
        <motion.div
          variants={fadeUp}
          custom={4}
          className="glass rounded-xl p-6"
        >
          <h4 className="text-center text-sm font-semibold text-text-muted uppercase tracking-wider mb-5">
            Microservices
          </h4>
          <div className="flex flex-wrap justify-center gap-3">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.name}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${s.color}`}
                >
                  <Icon size={16} />
                  {s.name}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* connector */}
        <div className="flex justify-center">
          <div className="w-px h-10 bg-gradient-to-b from-success/60 to-warning/60" />
        </div>

        {/* Infrastructure */}
        <motion.div
          variants={fadeUp}
          custom={5}
          className="glass rounded-xl p-6"
        >
          <h4 className="text-center text-sm font-semibold text-text-muted uppercase tracking-wider mb-5">
            Infrastructure & Data
          </h4>
          <div className="flex flex-wrap justify-center gap-3">
            {infra.map((inf) => (
              <div
                key={inf.name}
                className={`rounded-lg border px-4 py-2.5 text-sm font-medium ${inf.color}`}
              >
                {inf.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ───────────────── 4. SCENARIO DEMO ───────────────── */
const steps = [
  {
    step: 1,
    title: 'Create API Endpoint',
    detail: 'POST /api/users',
    icon: Zap,
    color: 'text-primary-light',
    ring: 'ring-primary/40',
    bg: 'bg-primary/15',
  },
  {
    step: 2,
    title: 'Execute Request',
    detail: 'Send JSON payload { name, email, role }',
    icon: Send,
    color: 'text-accent',
    ring: 'ring-accent/40',
    bg: 'bg-accent/15',
  },
  {
    step: 3,
    title: 'Database Updated',
    detail: 'Row inserted → users table',
    icon: CheckCircle2,
    color: 'text-success',
    ring: 'ring-success/40',
    bg: 'bg-success/15',
  },
  {
    step: 4,
    title: 'Event Published',
    detail: 'Kafka topic → user.created',
    icon: Bell,
    color: 'text-warning',
    ring: 'ring-warning/40',
    bg: 'bg-warning/15',
  },
  {
    step: 5,
    title: 'Workflow Triggered',
    detail: 'Approval process started in Camunda',
    icon: Workflow,
    color: 'text-danger',
    ring: 'ring-danger/40',
    bg: 'bg-danger/15',
  },
];

function ScenarioDemo() {
  return (
    <Section className="max-w-4xl mx-auto">
      <motion.h2
        variants={fadeUp}
        className="text-center text-3xl sm:text-4xl font-bold gradient-text mb-4"
      >
        See It In Action
      </motion.h2>
      <motion.p
        variants={fadeUp}
        custom={1}
        className="text-center text-text-secondary mb-16 max-w-xl mx-auto"
      >
        Watch how a single API call cascades through the entire platform
      </motion.p>

      <div className="relative">
        {/* timeline line */}
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/50 via-success/50 via-warning/50 to-danger/50" />

        <div className="space-y-10">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                variants={fadeUp}
                custom={i + 2}
                className="relative flex items-start gap-6 pl-2"
              >
                {/* dot */}
                <div
                  className={`relative z-10 flex-shrink-0 flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full ${s.bg} ring-2 ${s.ring}`}
                >
                  <Icon size={22} className={s.color} />
                </div>

                {/* content */}
                <div className="glass rounded-xl px-6 py-4 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${s.color}`}>
                      Step {s.step}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-text-primary">{s.title}</h4>
                  <p className="text-sm text-text-secondary mt-1 font-mono">{s.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* ───────────────── 5. TECH STACK ───────────────── */
const techStack = [
  { name: 'React', color: 'text-accent border-accent/30 bg-accent/10' },
  { name: 'Node.js', color: 'text-success border-success/30 bg-success/10' },
  { name: 'PostgreSQL', color: 'text-primary-light border-primary/30 bg-primary/10' },
  { name: 'MongoDB', color: 'text-success border-success/30 bg-success/10' },
  { name: 'Redis', color: 'text-danger border-danger/30 bg-danger/10' },
  { name: 'Kafka', color: 'text-warning border-warning/30 bg-warning/10' },
  { name: 'Camunda', color: 'text-primary-light border-primary/30 bg-primary/10' },
  { name: 'NiFi', color: 'text-accent border-accent/30 bg-accent/10' },
  { name: 'MQTT', color: 'text-success border-success/30 bg-success/10' },
  { name: 'Docker', color: 'text-accent border-accent/30 bg-accent/10' },
];

function TechStack() {
  return (
    <Section className="max-w-5xl mx-auto">
      <motion.h2
        variants={fadeUp}
        className="text-center text-3xl sm:text-4xl font-bold gradient-text mb-4"
      >
        Powered By Modern Tech
      </motion.h2>
      <motion.p
        variants={fadeUp}
        custom={1}
        className="text-center text-text-secondary mb-14 max-w-xl mx-auto"
      >
        Industry-standard tools and frameworks under the hood
      </motion.p>

      <div className="flex flex-wrap justify-center gap-4">
        {techStack.map((t, i) => (
          <motion.div
            key={t.name}
            variants={fadeUp}
            custom={i}
            className={`rounded-xl border px-6 py-3 text-sm font-semibold tracking-wide transition hover:scale-105 ${t.color}`}
          >
            {t.name}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ───────────────── 6. CTA ───────────────── */
function CTA() {
  return (
    <Section className="max-w-4xl mx-auto text-center">
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-12 sm:p-16"
        style={{
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.10), rgba(16,185,129,0.08))',
          border: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        <motion.h2
          variants={fadeUp}
          custom={1}
          className="text-3xl sm:text-4xl font-bold gradient-text mb-4"
        >
          Ready to Build?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={2}
          className="text-text-secondary max-w-lg mx-auto mb-8"
        >
          Start exploring the platform — create APIs, run queries, simulate events, and design
          workflows.
        </motion.p>
        <motion.div variants={fadeUp} custom={3}>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-dark hover:shadow-primary/40"
          >
            <Play size={20} /> Launch Platform
          </Link>
        </motion.div>
      </motion.div>
    </Section>
  );
}

/* ───────────────── PAGE ───────────────── */
export default function Landing() {
  return (
    <main className="bg-surface min-h-screen">
      <Hero />
      <Features />
      <LearningPath />
      <Architecture />
      <ScenarioDemo />
      <TechStack />
      <CTA />
    </main>
  );
}
