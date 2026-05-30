import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Rocket,
  Send,
  Database,
  GitBranch,
  Radio,
  BarChart3,
  Layers,
  BookOpen,
  ChevronRight,
  ArrowUp,
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

/* ───────────────────── reusable Section wrapper ───────────────────── */
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
      className={`relative py-20 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ───────────────────── code block component ───────────────────── */
function CodeBlock({ children, title }) {
  return (
    <div className="mt-4 rounded-lg overflow-hidden border border-surface-lighter/30">
      {title && (
        <div className="bg-surface-lighter/40 px-4 py-2 text-xs text-text-muted font-mono border-b border-surface-lighter/30">
          {title}
        </div>
      )}
      <pre className="bg-[#1a1a2e] rounded-b-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
}

/* ───────────────────── section heading ───────────────────── */
function SectionHeading({ icon: Icon, title, description }) {
  return (
    <motion.div variants={fadeUp} className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary">{title}</h2>
      </div>
      {description && (
        <p className="text-text-secondary text-lg leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </motion.div>
  );
}

/* ───────────────────── step component for guides ───────────────────── */
function Step({ number, title, children }) {
  return (
    <motion.div variants={fadeUp} className="flex gap-4 mb-6">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
        {number}
      </div>
      <div className="flex-1 pt-1">
        <h4 className="text-text-primary font-semibold mb-1">{title}</h4>
        <div className="text-text-secondary text-sm leading-relaxed">{children}</div>
      </div>
    </motion.div>
  );
}

/* ───────────────────── table of contents data ───────────────────── */
const tocItems = [
  { id: 'getting-started', label: 'Getting Started', icon: Rocket },
  { id: 'api-playground', label: 'API Playground', icon: Send },
  { id: 'db-sandbox', label: 'Database Sandbox', icon: Database },
  { id: 'workflow-engine', label: 'Workflow Engine', icon: GitBranch },
  { id: 'event-hub', label: 'Event Hub', icon: Radio },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'tech-stack', label: 'Tech Stack', icon: Layers },
];

/* ───────────────────── tech stack data ───────────────────── */
const techStack = [
  { name: 'React 19', desc: 'Modern UI library with hooks & concurrent features', color: 'text-accent' },
  { name: 'Vite 8', desc: 'Lightning-fast build tool & dev server', color: 'text-warning' },
  { name: 'Tailwind CSS 4', desc: 'Utility-first CSS framework with JIT engine', color: 'text-primary' },
  { name: 'Framer Motion', desc: 'Production-ready animations & gestures', color: 'text-success' },
  { name: 'Recharts', desc: 'Composable charting library built on D3', color: 'text-danger' },
  { name: 'Lucide React', desc: 'Beautiful & consistent icon library', color: 'text-accent' },
  { name: 'React Router', desc: 'Declarative routing for single-page apps', color: 'text-warning' },
];

/* ═══════════════════════════════════════════════════════════════ */
/*                     DOCUMENTATION PAGE                        */
/* ═══════════════════════════════════════════════════════════════ */
export default function Documentation() {
  const [activeSection, setActiveSection] = useState('getting-started');

  /* track which section is in viewport */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );

    tocItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface relative">
      {/* ── floating orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{ width: 340, height: 340, left: '5%', top: '20%', background: 'rgba(99,102,241,0.08)' }}
          animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{ width: 260, height: 260, right: '10%', top: '10%', background: 'rgba(6,182,212,0.07)' }}
          animate={{ y: [0, -30, 0], x: [0, 25, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full blur-3xl"
          style={{ width: 200, height: 200, left: '50%', bottom: '15%', background: 'rgba(16,185,129,0.06)' }}
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── hero ── */}
      <div className="relative pt-32 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="w-10 h-10 text-primary" />
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="gradient-text">APIForge Lab Documentation</span>
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Your comprehensive guide to mastering every feature of APIForge Lab —
            from API testing to workflow orchestration, database sandboxing, and beyond.
          </p>
        </motion.div>
      </div>

      {/* ── mobile TOC bar ── */}
      <div className="lg:hidden sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-surface-lighter/30">
        <div className="flex overflow-x-auto gap-1 px-4 py-3 scrollbar-hide">
          {tocItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeSection === id
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-light/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── main layout: sidebar + content ── */}
      <div className="relative max-w-7xl mx-auto px-6 pb-24 lg:flex lg:gap-10">
        {/* sidebar TOC (desktop) */}
        <aside className="hidden lg:block lg:w-64 flex-shrink-0">
          <nav className="sticky top-28 glass rounded-2xl p-5 space-y-1">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-3">
              On This Page
            </h3>
            {tocItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeSection === id
                    ? 'bg-primary/15 text-primary border border-primary/20 shadow-sm shadow-primary/5'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-lighter/30'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {activeSection === id && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* content */}
        <div className="flex-1 min-w-0 space-y-10">
          {/* ─── Getting Started ─── */}
          <Section id="getting-started">
            <SectionHeading
              icon={Rocket}
              title="Getting Started"
              description="Welcome to APIForge Lab! Follow these steps to get up and running in minutes. This guide will walk you through the setup process and introduce you to the core features."
            />

            <motion.div variants={fadeUp} className="glass rounded-2xl p-6 md:p-8 mb-8">
              <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Quick Start Guide
              </h3>

              <Step number={1} title="Clone the Repository">
                <p>Get the source code from GitHub to your local machine.</p>
                <CodeBlock title="terminal">git clone https://github.com/shivam-sharma/apiforge-lab.git{'\n'}cd apiforge-lab</CodeBlock>
              </Step>

              <Step number={2} title="Install Dependencies">
                <p>Install all required packages using npm.</p>
                <CodeBlock title="terminal">npm install</CodeBlock>
              </Step>

              <Step number={3} title="Start the Development Server">
                <p>Launch the Vite dev server with hot module replacement.</p>
                <CodeBlock title="terminal">npm run dev</CodeBlock>
              </Step>

              <Step number={4} title="Open in Browser">
                <p>Navigate to the local development URL displayed in your terminal.</p>
                <CodeBlock title="terminal">http://localhost:5173</CodeBlock>
              </Step>

              <Step number={5} title="Explore the Features">
                <p>Use the navigation bar to access the API Playground, Database Sandbox, Workflow Engine, Event Hub, and Dashboard.</p>
              </Step>

              <Step number={6} title="Build for Production">
                <p>Create an optimized production build when you're ready to deploy.</p>
                <CodeBlock title="terminal">npm run build{'\n'}npm run preview</CodeBlock>
              </Step>
            </motion.div>
          </Section>

          {/* ─── API Playground ─── */}
          <Section id="api-playground">
            <SectionHeading
              icon={Send}
              title="API Playground"
              description="Test and debug RESTful APIs with an intuitive interface. Send requests, inspect responses, and manage headers — all from one place."
            />

            <motion.div variants={fadeUp} className="glass rounded-2xl p-6 md:p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-text-primary font-semibold mb-3">How to Use</h4>
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Select an HTTP method (GET, POST, PUT, DELETE, PATCH)</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Enter the API endpoint URL</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Add custom headers (Authorization, Content-Type, etc.)</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Provide a request body for POST/PUT methods</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Click <span className="text-primary font-medium">Send</span> and inspect the response</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-text-primary font-semibold mb-3">Features</h4>
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />Syntax-highlighted JSON responses</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />Response status codes & timing metrics</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />Response header inspection</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />Request history tracking</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <CodeBlock title="Example Request">
{`POST /api/users
Content-Type: application/json
Authorization: Bearer eyJhbGci...

{
  "name": "Shivam Sharma",
  "email": "shivam@apiforge.dev",
  "role": "admin"
}`}
                </CodeBlock>

                <CodeBlock title="Example Response (200 OK)">
{`{
  "id": "usr_9f8a7b6c",
  "name": "Shivam Sharma",
  "email": "shivam@apiforge.dev",
  "role": "admin",
  "createdAt": "2025-01-15T10:30:00Z"
}`}
                </CodeBlock>
              </div>
            </motion.div>
          </Section>

          {/* ─── Database Sandbox ─── */}
          <Section id="db-sandbox">
            <SectionHeading
              icon={Database}
              title="Database Sandbox"
              description="Execute SQL queries and explore database schemas in a safe, sandboxed environment. Supports multiple database engines for realistic testing."
            />

            <motion.div variants={fadeUp} className="glass rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap gap-3 mb-4">
                {['PostgreSQL', 'MySQL', 'MongoDB'].map((db) => (
                  <span key={db} className="px-4 py-1.5 rounded-full bg-surface-lighter/50 text-text-secondary text-sm font-medium border border-surface-lighter/50">
                    {db}
                  </span>
                ))}
              </div>

              <div>
                <h4 className="text-text-primary font-semibold mb-3">Capabilities</h4>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Switch between PostgreSQL, MySQL, and MongoDB engines</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Write and execute SQL or NoSQL queries</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Browse table schemas, columns, and relationships</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />View query results in a formatted table</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Track query execution time and row counts</li>
                </ul>
              </div>

              <CodeBlock title="Example Query — PostgreSQL">
{`-- Fetch all active users with their order counts
SELECT
  u.id,
  u.name,
  u.email,
  COUNT(o.id) AS total_orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.status = 'active'
GROUP BY u.id, u.name, u.email
ORDER BY total_orders DESC
LIMIT 20;`}
              </CodeBlock>

              <CodeBlock title="Example Query — MongoDB">
{`db.users.aggregate([
  { $match: { status: "active" } },
  { $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "userId",
      as: "orders"
  }},
  { $project: {
      name: 1,
      email: 1,
      totalOrders: { $size: "$orders" }
  }},
  { $sort: { totalOrders: -1 } },
  { $limit: 20 }
]);`}
              </CodeBlock>
            </motion.div>
          </Section>

          {/* ─── Workflow Engine ─── */}
          <Section id="workflow-engine">
            <SectionHeading
              icon={GitBranch}
              title="Workflow Engine"
              description="Orchestrate complex BPMN workflows with visual execution tracking. Define multi-step processes, monitor progress, and inspect execution logs in real time."
            />

            <motion.div variants={fadeUp} className="glass rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <h4 className="text-text-primary font-semibold mb-3">Key Features</h4>
                <ul className="space-y-2 text-text-secondary text-sm">
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Define BPMN-compliant workflow definitions</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Execute workflows and monitor each step's progress</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />View real-time execution logs with timestamps</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Handle conditional branching and parallel execution</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Retry failed steps with configurable policies</li>
                </ul>
              </div>

              <CodeBlock title="Example Workflow Definition">
{`{
  "id": "user-onboarding",
  "name": "User Onboarding Flow",
  "version": "1.0.0",
  "steps": [
    {
      "id": "validate-input",
      "type": "task",
      "name": "Validate User Input",
      "next": "create-account"
    },
    {
      "id": "create-account",
      "type": "task",
      "name": "Create User Account",
      "next": "send-welcome-email"
    },
    {
      "id": "send-welcome-email",
      "type": "task",
      "name": "Send Welcome Email",
      "next": "assign-role"
    },
    {
      "id": "assign-role",
      "type": "task",
      "name": "Assign Default Role",
      "next": null
    }
  ]
}`}
              </CodeBlock>
            </motion.div>
          </Section>

          {/* ─── Event Hub ─── */}
          <Section id="event-hub">
            <SectionHeading
              icon={Radio}
              title="Event Hub"
              description="Publish and subscribe to real-time events using Kafka and MQTT protocols. Monitor live event streams and inspect message payloads with ease."
            />

            <motion.div variants={fadeUp} className="glass rounded-2xl p-6 md:p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-text-primary font-semibold mb-3">Publishing Events</h4>
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Select a protocol (Kafka or MQTT)</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Specify the target topic name</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Compose a JSON event payload</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />Publish and view delivery confirmation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-text-primary font-semibold mb-3">Subscribing to Topics</h4>
                  <ul className="space-y-2 text-text-secondary text-sm">
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />Enter a topic to subscribe</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />View live event stream in real time</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />Inspect individual event payloads</li>
                    <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />Filter events by key or timestamp</li>
                  </ul>
                </div>
              </div>

              <CodeBlock title="Example Kafka Event Payload">
{`{
  "topic": "user.events",
  "key": "usr_9f8a7b6c",
  "value": {
    "eventType": "USER_CREATED",
    "timestamp": "2025-01-15T10:30:00Z",
    "data": {
      "userId": "usr_9f8a7b6c",
      "name": "Shivam Sharma",
      "email": "shivam@apiforge.dev"
    }
  },
  "headers": {
    "correlationId": "corr-abc-123",
    "source": "apiforge-lab"
  }
}`}
              </CodeBlock>

              <CodeBlock title="Example MQTT Message">
{`Topic: sensors/temperature/room-1
QoS: 1
Retain: false

{
  "sensorId": "temp-sensor-01",
  "value": 23.5,
  "unit": "celsius",
  "timestamp": "2025-01-15T10:30:00Z"
}`}
              </CodeBlock>
            </motion.div>
          </Section>

          {/* ─── Dashboard ─── */}
          <Section id="dashboard">
            <SectionHeading
              icon={BarChart3}
              title="Dashboard"
              description="Get a bird's-eye view of your system with real-time metrics, health monitoring, and interactive charts. Stay informed with configurable alerts."
            />

            <motion.div variants={fadeUp} className="glass rounded-2xl p-6 md:p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: 'Metrics Overview', desc: 'Track API response times, throughput, error rates, and request volumes across all endpoints.', color: 'text-primary' },
                  { title: 'System Health', desc: 'Monitor CPU, memory, disk usage, and service uptime with real-time status indicators.', color: 'text-success' },
                  { title: 'Interactive Charts', desc: 'Visualize trends with line charts, bar graphs, area charts, and pie charts powered by Recharts.', color: 'text-accent' },
                  { title: 'Alert Configuration', desc: 'Set threshold-based alerts for latency spikes, error surges, or resource exhaustion.', color: 'text-warning' },
                ].map((item) => (
                  <div key={item.title} className="bg-surface-light/50 rounded-xl p-5 border border-surface-lighter/30">
                    <h4 className={`font-semibold mb-2 ${item.color}`}>{item.title}</h4>
                    <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </Section>

          {/* ─── Tech Stack ─── */}
          <Section id="tech-stack">
            <SectionHeading
              icon={Layers}
              title="Tech Stack"
              description="APIForge Lab is built with a modern, high-performance technology stack designed for developer productivity and exceptional user experience."
            />

            <motion.div variants={fadeUp}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {techStack.map((tech) => (
                  <motion.div
                    key={tech.name}
                    variants={fadeUp}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="glass rounded-xl p-5 border border-surface-lighter/30 hover:border-primary/30 transition-colors duration-300"
                  >
                    <h4 className={`font-bold text-lg mb-1 ${tech.color}`}>{tech.name}</h4>
                    <p className="text-text-muted text-sm">{tech.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Section>

          {/* ─── footer credit ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center pt-16 pb-8 border-t border-surface-lighter/20"
          >
            <p className="text-text-muted text-sm">
              Made with{' '}
              <span className="text-danger">❤</span>{' '}
              by{' '}
              <span className="gradient-text font-semibold">Senior SDET SHIVAM SHARMA</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── scroll-to-top button ── */}
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-primary/20 border border-primary/30 text-primary backdrop-blur-sm hover:bg-primary/30 transition-colors"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
