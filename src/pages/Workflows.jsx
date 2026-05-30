import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  UserPlus,
  ShieldCheck,
  Database,
  CreditCard,
  Package,
  Truck,
  ClipboardCheck,
  FileCode2,
  Search,
  BookCheck,
  Upload,
  Filter,
  BarChart3,
  Circle,
  Diamond,
  Activity,
  Clock,
  TrendingUp,
  Info,
  Layers,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   WORKFLOW DATA
   ══════════════════════════════════════════════════════════════ */

const WORKFLOWS = [
  {
    id: 'user-registration',
    name: 'User Registration Approval',
    status: 'Active',
    stepCount: 6,
    totalRuns: 1247,
    successRate: 94.2,
    avgDuration: '4.2s',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', x: 80, y: 180, icon: Circle, description: 'Workflow initiated', input: '{ "trigger": "user_signup" }', output: '{ "workflowId": "wf-001" }', duration: '0.0s' },
      { id: 'submit', type: 'task', label: 'User Submits Registration', x: 240, y: 180, icon: UserPlus, description: 'User fills and submits the registration form with personal details.', input: '{ "name": "John Doe", "email": "john@example.com" }', output: '{ "submissionId": "sub-4821" }', duration: '0.3s' },
      { id: 'db-create', type: 'task', label: 'DB Record Created', x: 440, y: 180, icon: Database, description: 'A new user record is created in PostgreSQL with pending status.', input: '{ "submissionId": "sub-4821" }', output: '{ "userId": "usr-9912", "status": "pending" }', duration: '0.5s' },
      { id: 'approval', type: 'task', label: 'Admin Approval', x: 640, y: 180, icon: ShieldCheck, description: 'Admin reviews the registration and decides to approve or reject.', input: '{ "userId": "usr-9912" }', output: '{ "decision": "approved", "approvedBy": "admin@company.com" }', duration: '2.1s' },
      { id: 'decision', type: 'decision', label: 'Approved?', x: 840, y: 180, icon: Diamond, description: 'Decision gateway — routes based on admin approval result.', input: '{ "decision": "approved" }', output: '{ "route": "activate" }', duration: '0.1s' },
      { id: 'end', type: 'end', label: 'End', x: 1040, y: 180, icon: Circle, description: 'Workflow completed. User is activated or rolled back.', input: '{ "route": "activate" }', output: '{ "finalStatus": "activated", "totalDuration": "4.2s" }', duration: '0.0s' },
    ],
    edges: [
      { from: 'start', to: 'submit' },
      { from: 'submit', to: 'db-create' },
      { from: 'db-create', to: 'approval' },
      { from: 'approval', to: 'decision' },
      { from: 'decision', to: 'end' },
    ],
    logs: [
      { level: 'INFO', message: 'Workflow "User Registration" started' },
      { level: 'INFO', message: 'Step 1: User submitting registration form...' },
      { level: 'SUCCESS', message: 'Registration form submitted successfully' },
      { level: 'INFO', message: 'Step 2: Creating user record in PostgreSQL...' },
      { level: 'SUCCESS', message: 'User record created in PostgreSQL (usr-9912)' },
      { level: 'INFO', message: 'Step 3: Publishing Kafka event user.created...' },
      { level: 'SUCCESS', message: 'Event published to topic: user.created' },
      { level: 'INFO', message: 'Step 4: Waiting for admin approval...' },
      { level: 'SUCCESS', message: 'Admin approved the request' },
      { level: 'INFO', message: 'Step 5: Evaluating decision gateway...' },
      { level: 'SUCCESS', message: 'Route: activate user account' },
      { level: 'SUCCESS', message: 'Workflow completed in 4.2s' },
    ],
  },
  {
    id: 'order-processing',
    name: 'Order Processing',
    status: 'Active',
    stepCount: 7,
    totalRuns: 3892,
    successRate: 97.8,
    avgDuration: '6.5s',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', x: 80, y: 180, icon: Circle, description: 'Order workflow initiated', input: '{ "trigger": "order_placed" }', output: '{ "workflowId": "wf-002" }', duration: '0.0s' },
      { id: 'order', type: 'task', label: 'Order Placed', x: 220, y: 180, icon: ClipboardCheck, description: 'Customer places an order through the storefront.', input: '{ "customerId": "cust-442", "items": 3 }', output: '{ "orderId": "ord-7821" }', duration: '0.4s' },
      { id: 'payment', type: 'task', label: 'Payment Validation', x: 400, y: 180, icon: CreditCard, description: 'Payment is validated through the payment gateway.', input: '{ "orderId": "ord-7821", "amount": 149.99 }', output: '{ "paymentStatus": "confirmed", "txnId": "txn-331" }', duration: '1.2s' },
      { id: 'inventory', type: 'task', label: 'Inventory Check', x: 580, y: 180, icon: Package, description: 'Inventory service checks stock availability for all items.', input: '{ "orderId": "ord-7821" }', output: '{ "allInStock": true }', duration: '0.8s' },
      { id: 'decision', type: 'decision', label: 'In Stock?', x: 750, y: 180, icon: Diamond, description: 'Decision gateway — checks if all items are in stock.', input: '{ "allInStock": true }', output: '{ "route": "ship" }', duration: '0.1s' },
      { id: 'shipping', type: 'task', label: 'Shipping', x: 920, y: 180, icon: Truck, description: 'Order is dispatched via the shipping partner.', input: '{ "orderId": "ord-7821" }', output: '{ "trackingId": "TRK-99281" }', duration: '2.5s' },
      { id: 'end', type: 'end', label: 'Delivered', x: 1080, y: 180, icon: Circle, description: 'Delivery confirmed. Order workflow completed.', input: '{ "trackingId": "TRK-99281" }', output: '{ "deliveryStatus": "confirmed", "totalDuration": "6.5s" }', duration: '0.0s' },
    ],
    edges: [
      { from: 'start', to: 'order' },
      { from: 'order', to: 'payment' },
      { from: 'payment', to: 'inventory' },
      { from: 'inventory', to: 'decision' },
      { from: 'decision', to: 'shipping' },
      { from: 'shipping', to: 'end' },
    ],
    logs: [
      { level: 'INFO', message: 'Workflow "Order Processing" started' },
      { level: 'INFO', message: 'Step 1: Order placed by customer cust-442...' },
      { level: 'SUCCESS', message: 'Order ord-7821 created successfully' },
      { level: 'INFO', message: 'Step 2: Validating payment through gateway...' },
      { level: 'SUCCESS', message: 'Payment confirmed — txn-331 ($149.99)' },
      { level: 'INFO', message: 'Step 3: Checking inventory for 3 items...' },
      { level: 'SUCCESS', message: 'All items in stock' },
      { level: 'INFO', message: 'Step 4: Decision gateway — routing to shipping...' },
      { level: 'SUCCESS', message: 'Route: proceed to shipping' },
      { level: 'INFO', message: 'Step 5: Dispatching order via shipping partner...' },
      { level: 'SUCCESS', message: 'Shipped — tracking ID: TRK-99281' },
      { level: 'SUCCESS', message: 'Delivery confirmed. Workflow completed in 6.5s' },
    ],
  },
  {
    id: 'api-contract',
    name: 'API Contract Review',
    status: 'Draft',
    stepCount: 6,
    totalRuns: 582,
    successRate: 88.5,
    avgDuration: '3.8s',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', x: 80, y: 180, icon: Circle, description: 'API contract review initiated', input: '{ "trigger": "api_change_submitted" }', output: '{ "workflowId": "wf-003" }', duration: '0.0s' },
      { id: 'submit', type: 'task', label: 'Submit API Change', x: 240, y: 180, icon: FileCode2, description: 'Developer submits an API schema change for review.', input: '{ "developer": "dev-alice", "endpoint": "/api/v2/users" }', output: '{ "changeId": "chg-221" }', duration: '0.3s' },
      { id: 'review', type: 'task', label: 'Review Task', x: 440, y: 180, icon: Search, description: 'Automated and manual review of the API contract changes.', input: '{ "changeId": "chg-221" }', output: '{ "issues": 0, "score": 95 }', duration: '1.8s' },
      { id: 'decision', type: 'decision', label: 'Approve?', x: 640, y: 180, icon: Diamond, description: 'Decision gateway — approve or reject based on review score.', input: '{ "score": 95 }', output: '{ "route": "publish" }', duration: '0.1s' },
      { id: 'publish', type: 'task', label: 'Publish Version', x: 840, y: 180, icon: BookCheck, description: 'New API version is published to the API gateway.', input: '{ "changeId": "chg-221", "version": "v2.1.0" }', output: '{ "published": true, "url": "/api/v2.1/users" }', duration: '1.2s' },
      { id: 'end', type: 'end', label: 'End', x: 1020, y: 180, icon: Circle, description: 'API contract review completed.', input: '{ "version": "v2.1.0" }', output: '{ "status": "published", "totalDuration": "3.8s" }', duration: '0.0s' },
    ],
    edges: [
      { from: 'start', to: 'submit' },
      { from: 'submit', to: 'review' },
      { from: 'review', to: 'decision' },
      { from: 'decision', to: 'publish' },
      { from: 'publish', to: 'end' },
    ],
    logs: [
      { level: 'INFO', message: 'Workflow "API Contract Review" started' },
      { level: 'INFO', message: 'Step 1: Developer submitting API change...' },
      { level: 'SUCCESS', message: 'API change chg-221 submitted for /api/v2/users' },
      { level: 'INFO', message: 'Step 2: Running automated contract review...' },
      { level: 'SUCCESS', message: 'Review passed — score: 95, issues: 0' },
      { level: 'INFO', message: 'Step 3: Evaluating approval gateway...' },
      { level: 'SUCCESS', message: 'Route: publish new version' },
      { level: 'INFO', message: 'Step 4: Publishing API version v2.1.0...' },
      { level: 'SUCCESS', message: 'Version v2.1.0 published to API gateway' },
      { level: 'SUCCESS', message: 'Workflow completed in 3.8s' },
    ],
  },
  {
    id: 'data-import',
    name: 'Data Import Pipeline',
    status: 'Completed',
    stepCount: 7,
    totalRuns: 2105,
    successRate: 91.3,
    avgDuration: '8.1s',
    nodes: [
      { id: 'start', type: 'start', label: 'Start', x: 80, y: 180, icon: Circle, description: 'Data import pipeline initiated', input: '{ "trigger": "csv_uploaded" }', output: '{ "workflowId": "wf-004" }', duration: '0.0s' },
      { id: 'upload', type: 'task', label: 'CSV Uploaded', x: 220, y: 180, icon: Upload, description: 'User uploads a CSV file for data import.', input: '{ "fileName": "users_q4.csv", "size": "2.4MB" }', output: '{ "fileId": "file-881", "rows": 15420 }', duration: '0.6s' },
      { id: 'nifi', type: 'task', label: 'NiFi Processing', x: 400, y: 180, icon: Layers, description: 'Apache NiFi processes and transforms the CSV data.', input: '{ "fileId": "file-881" }', output: '{ "processedRows": 15420, "transforms": 3 }', duration: '2.5s' },
      { id: 'validate', type: 'task', label: 'Validation', x: 580, y: 180, icon: Filter, description: 'Data validation rules applied to all records.', input: '{ "processedRows": 15420 }', output: '{ "valid": 15102, "invalid": 318 }', duration: '1.8s' },
      { id: 'decision', type: 'decision', label: 'Valid?', x: 740, y: 180, icon: Diamond, description: 'Decision gateway — check if validation threshold is met.', input: '{ "validRate": 97.9 }', output: '{ "route": "insert" }', duration: '0.1s' },
      { id: 'insert', type: 'task', label: 'DB Insert', x: 900, y: 180, icon: Database, description: 'Valid records are bulk-inserted into the database.', input: '{ "validRecords": 15102 }', output: '{ "inserted": 15102, "table": "users_import" }', duration: '2.8s' },
      { id: 'end', type: 'end', label: 'Report', x: 1060, y: 180, icon: BarChart3, description: 'Summary report generated and workflow completed.', input: '{ "inserted": 15102 }', output: '{ "report": "import_summary_q4.pdf", "totalDuration": "8.1s" }', duration: '0.0s' },
    ],
    edges: [
      { from: 'start', to: 'upload' },
      { from: 'upload', to: 'nifi' },
      { from: 'nifi', to: 'validate' },
      { from: 'validate', to: 'decision' },
      { from: 'decision', to: 'insert' },
      { from: 'insert', to: 'end' },
    ],
    logs: [
      { level: 'INFO', message: 'Workflow "Data Import Pipeline" started' },
      { level: 'INFO', message: 'Step 1: CSV file uploaded — users_q4.csv (2.4MB)...' },
      { level: 'SUCCESS', message: 'File uploaded — 15,420 rows detected' },
      { level: 'INFO', message: 'Step 2: NiFi processing file with 3 transforms...' },
      { level: 'SUCCESS', message: 'NiFi processing complete — 15,420 rows processed' },
      { level: 'INFO', message: 'Step 3: Validating data against schema rules...' },
      { level: 'WARNING', message: '318 rows failed validation (2.1% error rate)' },
      { level: 'SUCCESS', message: '15,102 rows passed validation' },
      { level: 'INFO', message: 'Step 4: Decision gateway — validation threshold met (97.9%)' },
      { level: 'INFO', message: 'Step 5: Bulk inserting 15,102 records into users_import...' },
      { level: 'SUCCESS', message: 'All records inserted successfully' },
      { level: 'SUCCESS', message: 'Summary report generated. Workflow completed in 8.1s' },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════ */

const statusBadgeColor = {
  Active: 'bg-success/20 text-success',
  Draft: 'bg-warning/20 text-warning',
  Completed: 'bg-accent/20 text-accent',
};

const nodeStatusColor = {
  pending: { bg: 'rgba(100,116,139,0.25)', border: '#64748b', text: '#94a3b8' },
  'in-progress': { bg: 'rgba(245,158,11,0.25)', border: '#f59e0b', text: '#fbbf24' },
  completed: { bg: 'rgba(16,185,129,0.25)', border: '#10b981', text: '#34d399' },
  failed: { bg: 'rgba(239,68,68,0.25)', border: '#ef4444', text: '#f87171' },
};

const logColor = {
  INFO: 'text-accent',
  SUCCESS: 'text-success',
  WARNING: 'text-warning',
  ERROR: 'text-danger',
};

const timestamp = () => {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
};

const createInitialNodeStatuses = (workflow) =>
  workflow.nodes.reduce((acc, node) => ({ ...acc, [node.id]: 'pending' }), {});

/* ══════════════════════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════════════════════ */

/* ─── Workflow Node ─── */
function WorkflowNode({ node, status, isSelected, onClick }) {
  const colors = nodeStatusColor[status];
  const Icon = node.icon;
  const isStart = node.type === 'start';
  const isEnd = node.type === 'end';
  const isDecision = node.type === 'decision';

  const shapeClass = isStart || isEnd
    ? 'rounded-full w-16 h-16'
    : isDecision
      ? 'w-20 h-20 rotate-45'
      : 'rounded-xl w-36 h-20';

  return (
    <motion.g
      onClick={() => onClick(node)}
      style={{ cursor: 'pointer' }}
    >
      <foreignObject
        x={node.x - (isStart || isEnd ? 32 : isDecision ? 40 : 72)}
        y={node.y - (isStart || isEnd ? 32 : 40)}
        width={isStart || isEnd ? 64 : isDecision ? 80 : 144}
        height={isStart || isEnd ? 64 : 80}
      >
        <motion.div
          animate={{
            boxShadow: status === 'in-progress'
              ? [
                  `0 0 8px ${colors.border}`,
                  `0 0 24px ${colors.border}`,
                  `0 0 8px ${colors.border}`,
                ]
              : status === 'completed'
                ? `0 0 12px ${colors.border}`
                : '0 0 0px transparent',
          }}
          transition={status === 'in-progress' ? { duration: 1.2, repeat: Infinity } : {}}
          className={`${shapeClass} flex items-center justify-center border-2 transition-colors duration-300`}
          style={{
            backgroundColor: colors.bg,
            borderColor: isSelected ? '#6366f1' : colors.border,
          }}
        >
          <div className={isDecision ? '-rotate-45 flex flex-col items-center' : 'flex flex-col items-center'}>
            <Icon
              size={isStart || isEnd ? 22 : 18}
              style={{ color: isStart ? '#10b981' : isEnd ? '#ef4444' : colors.text }}
            />
          </div>
        </motion.div>
      </foreignObject>
      {/* label below node */}
      <foreignObject
        x={node.x - 70}
        y={node.y + (isStart || isEnd ? 36 : isDecision ? 46 : 44)}
        width={140}
        height={36}
      >
        <p className="text-center text-[11px] font-medium text-text-secondary leading-tight truncate">
          {node.label}
        </p>
      </foreignObject>
    </motion.g>
  );
}

/* ─── Animated Edge ─── */
function AnimatedEdge({ fromNode, toNode, edgeStatus }) {
  const x1 = fromNode.type === 'start' || fromNode.type === 'end' ? fromNode.x + 32
    : fromNode.type === 'decision' ? fromNode.x + 40 : fromNode.x + 72;
  const y1 = fromNode.y;
  const x2 = toNode.type === 'start' || toNode.type === 'end' ? toNode.x - 32
    : toNode.type === 'decision' ? toNode.x - 40 : toNode.x - 72;
  const y2 = toNode.y;

  const midX = (x1 + x2) / 2;
  const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

  const strokeColor = edgeStatus === 'completed' ? '#10b981'
    : edgeStatus === 'in-progress' ? '#f59e0b' : '#475569';

  return (
    <g>
      <path d={path} fill="none" stroke={strokeColor} strokeWidth={2} strokeOpacity={0.4} />
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeDasharray="8 6"
        strokeLinecap="round"
      >
        {edgeStatus === 'in-progress' && (
          <animate attributeName="stroke-dashoffset" from="28" to="0" dur="0.8s" repeatCount="indefinite" />
        )}
        {edgeStatus === 'completed' && (
          <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.5s" repeatCount="indefinite" />
        )}
      </path>
      {/* arrowhead */}
      <polygon
        points={`${x2},${y2} ${x2 - 8},${y2 - 5} ${x2 - 8},${y2 + 5}`}
        fill={strokeColor}
      />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */

export default function Workflows() {
  const [selected, setSelected] = useState(WORKFLOWS[0]);
  const [nodeStatuses, setNodeStatuses] = useState(() => createInitialNodeStatuses(WORKFLOWS[0]));
  const [selectedNode, setSelectedNode] = useState(null);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [logs, setLogs] = useState([]);
  const pausedRef = useRef(false);
  const runningRef = useRef(false);
  const logEndRef = useRef(null);

  // auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = useCallback((level, message) => {
    setLogs((prev) => [...prev, { level, message, time: timestamp() }]);
  }, []);

  const sleep = (ms) =>
    new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!pausedRef.current) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        if (!pausedRef.current) {
          clearInterval(interval);
          resolve();
        }
      }, ms);
    });

  const runWorkflow = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    setPaused(false);
    pausedRef.current = false;

    setNodeStatuses(createInitialNodeStatuses(selected));
    setLogs([]);

    let logIdx = 0;
    const pushLog = () => {
      if (logIdx < selected.logs.length) {
        const entry = selected.logs[logIdx];
        addLog(entry.level, entry.message);
        logIdx++;
      }
    };

    for (let i = 0; i < selected.nodes.length; i++) {
      if (!runningRef.current) break;
      const node = selected.nodes[i];
      setSelectedNode(node);

      // in-progress
      setNodeStatuses((prev) => ({ ...prev, [node.id]: 'in-progress' }));
      pushLog();
      await sleep(1000);

      if (!runningRef.current) break;

      // completed
      setNodeStatuses((prev) => ({ ...prev, [node.id]: 'completed' }));
      pushLog();

      if (i < selected.nodes.length - 1) await sleep(300);
    }

    setRunning(false);
    runningRef.current = false;
  }, [selected, addLog]);

  const resetWorkflow = useCallback(() => {
    runningRef.current = false;
    setRunning(false);
    setPaused(false);
    pausedRef.current = false;
    setNodeStatuses(createInitialNodeStatuses(selected));
    setSelectedNode(null);
    setLogs([]);
  }, [selected]);

  const selectWorkflow = useCallback((workflow) => {
    runningRef.current = false;
    pausedRef.current = false;
    setSelected(workflow);
    setNodeStatuses(createInitialNodeStatuses(workflow));
    setSelectedNode(null);
    setLogs([]);
    setRunning(false);
    setPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      pausedRef.current = !p;
      return !p;
    });
  }, []);

  const getEdgeStatus = (edge) => {
    const fromStatus = nodeStatuses[edge.from];
    const toStatus = nodeStatuses[edge.to];
    if (fromStatus === 'completed' && toStatus === 'completed') return 'completed';
    if (fromStatus === 'completed' && toStatus === 'in-progress') return 'in-progress';
    return 'pending';
  };

  const nodeMap = {};
  selected.nodes.forEach((n) => (nodeMap[n.id] = n));

  const svgWidth = Math.max(...selected.nodes.map((n) => n.x)) + 120;

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <div className="flex h-screen overflow-hidden">
        {/* ─── LEFT SIDEBAR ─── */}
        <motion.aside
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-[30%] min-w-[280px] max-w-[380px] border-r border-surface-lighter bg-surface-light/50 flex flex-col"
        >
          <div className="p-5 border-b border-surface-lighter">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Layers size={20} className="text-primary" />
              Workflow Catalog
            </h2>
            <p className="text-xs text-text-secondary mt-1">Select a workflow to visualize</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {WORKFLOWS.map((wf) => (
              <motion.button
                key={wf.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => selectWorkflow(wf)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  selected.id === wf.id
                    ? 'border-primary bg-primary/10 glow-primary'
                    : 'border-surface-lighter bg-surface-light hover:border-text-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-text-primary">{wf.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeColor[wf.status]}`}>
                    {wf.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Activity size={12} /> {wf.stepCount} steps
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={12} /> {wf.successRate}%
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {wf.avgDuration}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.aside>

        {/* ─── MAIN AREA ─── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Stats Bar */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between px-6 py-3 border-b border-surface-lighter bg-surface-light/30"
          >
            <div>
              <h1 className="text-xl font-bold">{selected.name}</h1>
              <p className="text-xs text-text-secondary mt-0.5">BPMN-style workflow visualizer</p>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-text-secondary text-[10px] uppercase tracking-wider">Total Runs</p>
                <p className="font-bold text-primary">{selected.totalRuns.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-text-secondary text-[10px] uppercase tracking-wider">Success Rate</p>
                <p className="font-bold text-success">{selected.successRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-text-secondary text-[10px] uppercase tracking-wider">Avg Duration</p>
                <p className="font-bold text-accent">{selected.avgDuration}</p>
              </div>

              <div className="flex gap-2 ml-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={runWorkflow}
                  disabled={running && !paused}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-40 hover:bg-primary-dark transition-colors"
                >
                  <Play size={14} /> Run Workflow
                </motion.button>
                {running && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePause}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-warning/20 text-warning text-xs font-semibold hover:bg-warning/30 transition-colors"
                  >
                    {paused ? <Play size={14} /> : <Pause size={14} />}
                    {paused ? 'Resume' : 'Pause'}
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetWorkflow}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-lighter text-text-secondary text-xs font-semibold hover:text-text-primary transition-colors"
                >
                  <RotateCcw size={14} /> Reset
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Visualizer + Details */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* SVG Flow Diagram */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 min-h-0 overflow-auto p-4"
            >
              <div className="bg-surface-light/40 rounded-2xl border border-surface-lighter p-2 h-full min-h-[260px] overflow-auto flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${svgWidth} 360`}
                  className="w-full h-full"
                  style={{ minWidth: svgWidth, maxHeight: 340 }}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* edges */}
                  {selected.edges.map((edge, i) => (
                    <AnimatedEdge
                      key={i}
                      fromNode={nodeMap[edge.from]}
                      toNode={nodeMap[edge.to]}
                      edgeStatus={getEdgeStatus(edge)}
                    />
                  ))}
                  {/* nodes */}
                  {selected.nodes.map((node) => (
                    <WorkflowNode
                      key={node.id}
                      node={node}
                      status={nodeStatuses[node.id] || 'pending'}
                      isSelected={selectedNode?.id === node.id}
                      onClick={setSelectedNode}
                    />
                  ))}
                </svg>
              </div>
            </motion.div>

            {/* Bottom Panels: Step Details + Execution Log */}
            <div className="h-[280px] flex border-t border-surface-lighter shrink-0">
              {/* Step Details */}
              <div className="w-1/2 border-r border-surface-lighter overflow-y-auto p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                  <Info size={13} /> Step Details
                </h3>
                <AnimatePresence mode="wait">
                  {selectedNode ? (
                    <motion.div
                      key={selectedNode.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <selectedNode.icon size={16} className="text-primary" />
                        <span className="font-semibold text-sm">{selectedNode.label}</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
                          style={{
                            backgroundColor: nodeStatusColor[nodeStatuses[selectedNode.id] || 'pending'].bg,
                            color: nodeStatusColor[nodeStatuses[selectedNode.id] || 'pending'].text,
                          }}
                        >
                          {nodeStatuses[selectedNode.id] || 'pending'}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">{selectedNode.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-text-muted">
                        <Clock size={12} />
                        Duration: <span className="text-accent font-semibold">{selectedNode.duration}</span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Input</p>
                        <pre className="text-[11px] bg-surface rounded-lg p-2 text-accent overflow-x-auto font-mono">
                          {JSON.stringify(JSON.parse(selectedNode.input), null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Output</p>
                        <pre className="text-[11px] bg-surface rounded-lg p-2 text-success overflow-x-auto font-mono">
                          {JSON.stringify(JSON.parse(selectedNode.output), null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-text-muted italic"
                    >
                      Click a node or run the workflow to see step details
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Execution Log */}
              <div className="w-1/2 overflow-y-auto p-4 bg-surface/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-1.5">
                  <Activity size={13} /> Execution Log
                </h3>
                {logs.length === 0 ? (
                  <p className="text-xs text-text-muted italic">Run the workflow to see execution logs</p>
                ) : (
                  <div className="space-y-1 font-mono text-[11px]">
                    <AnimatePresence>
                      {logs.map((log, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex gap-2"
                        >
                          <span className="text-text-muted shrink-0">{log.time}</span>
                          <span className={`font-bold shrink-0 ${logColor[log.level]}`}>[{log.level}]</span>
                          <span className="text-text-secondary">{log.message}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={logEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="text-center py-2 border-t border-surface-lighter">
            <p className="text-[10px] text-text-muted tracking-widest uppercase">
              Made by Senior SDET <span className="text-primary font-semibold">SHIVAM SHARMA</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
