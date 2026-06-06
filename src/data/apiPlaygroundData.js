// Mock data for the API Playground page.
//
// Extracted from ApiPlayground.jsx to keep the component focused on UI/behavior
// and to make the simulated API catalog easy to extend independently.

export const MOCK_RESPONSES = {
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

export const SAMPLE_BODIES = {
  'POST /api/users': JSON.stringify({ name: 'New User', email: 'newuser@example.com', role: 'developer' }, null, 2),
  'PUT /api/users/:id': JSON.stringify({ name: 'Updated Name', email: 'updated@example.com' }, null, 2),
  'POST /api/orders': JSON.stringify({ userId: 1, items: [{ product: 'Starter Plan', quantity: 1, price: 19.99 }] }, null, 2),
};

export const DEFAULT_BODY = JSON.stringify({ key: 'value' }, null, 2);

export const API_CATALOG = [
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

export const BASE_URL = 'https://api.apiforge.dev';

export const MOCK_RESPONSE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'X-Request-Id': 'req_a1b2c3d4e5f6',
  'X-RateLimit-Limit': '1000',
  'X-RateLimit-Remaining': '997',
  'Cache-Control': 'no-cache',
  Server: 'ApiForge/1.0',
  'Access-Control-Allow-Origin': '*',
};
