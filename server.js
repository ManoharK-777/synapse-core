const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simulated Data Store (In-Memory)
let nodes = [
    { id: '1', name: 'Neural-Alpha', status: 'Active', latency: '12ms', type: 'Processing' },
    { id: '2', name: 'Core-Sigma', status: 'Active', latency: '45ms', type: 'Storage' },
    { id: '3', name: 'Nexus-Beta', status: 'Idle', latency: '120ms', type: 'Routing' }
];

// Logging Middleware for that "Futuristic Terminal" feel
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Incoming Request: ${req.method} ${req.url}`);
    next();
});

// RESTful API Endpoints

// GET all nodes
app.get('/api/nodes', (req, res) => {
    res.json(nodes);
});

// POST new node
app.post('/api/nodes', (req, res) => {
    const newNode = {
        id: Date.now().toString(),
        name: req.body.name || `Node-${Math.floor(Math.random() * 1000)}`,
        status: req.body.status || 'Active',
        latency: req.body.latency || `${Math.floor(Math.random() * 100)}ms`,
        type: req.body.type || 'Generic'
    };
    nodes.push(newNode);
    res.status(201).json(newNode);
});

// PUT update node
app.put('/api/nodes/:id', (req, res) => {
    const { id } = req.params;
    const index = nodes.findIndex(node => node.id === id);
    if (index !== -1) {
        nodes[index] = { ...nodes[index], ...req.body };
        res.json(nodes[index]);
    } else {
        res.status(404).json({ message: 'Node not found' });
    }
});

// DELETE all nodes (Purge All)
app.delete('/api/nodes/purge-all', (req, res) => {
    nodes = [];
    res.status(200).json({ message: 'All nodes purged' });
});

// DELETE node
app.delete('/api/nodes/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = nodes.length;
    nodes = nodes.filter(node => node.id !== id);
    if (nodes.length < initialLength) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Node not found' });
    }
});

// System Stats Endpoint
app.get('/api/stats', (req, res) => {
    res.json({
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeCount: nodes.length,
        networkLoad: `${Math.floor(Math.random() * 100)}%`
    });
});

app.listen(PORT, () => {
    console.log(`
    ========================================
    🚀 SYNAPSE CORE API DEPLOYED
    🔗 Port: ${PORT}
    📡 Status: Operational
    ========================================
    `);
});
