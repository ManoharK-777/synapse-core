// --- Neural Background Animation ---
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 60;

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00E5FF';
        ctx.fill();
    }
}

function createParticles() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(138, 46, 255, ${1 - distance / 150})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

// --- API Integration ---
let editingNodeId = null;

async function fetchNodes() {
    try {
        logTerminal('Fetching neural nodes from API...');
        const res = await fetch('/api/nodes');
        const data = await res.json();
        renderNodes(data);
        logTerminal(`Successfully loaded ${data.length} nodes.`);
    } catch (err) {
        logTerminal('ERROR: Failed to fetch nodes.', 'error');
    }
}

async function fetchStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        document.getElementById('uptime-val').innerText = `${Math.floor(data.uptime)}s`;
        document.getElementById('load-val').innerText = data.networkLoad;
        
        // Randomize decorative stats for "attractive" feel
        document.getElementById('cpu-stat').innerText = `${Math.floor(Math.random() * 20 + 20)}%`;
        document.getElementById('mem-stat').innerText = `${(Math.random() * 0.5 + 1.1).toFixed(1)}GB`;
        document.getElementById('task-stat').innerText = Math.floor(Math.random() * 50 + 120);
    } catch (err) {}
}

function renderNodes(nodes) {
    const list = document.getElementById('node-list');
    list.innerHTML = '';
    nodes.forEach(node => {
        const item = document.createElement('div');
        item.className = 'node-item card';
        item.innerHTML = `
            <div>
                <strong style="color: var(--neural-blue)">${node.name}</strong>
                <p style="font-size: 0.8rem; opacity: 0.6">${node.type} | Latency: ${node.latency}</p>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <span class="status-pill ${node.status === 'Active' ? 'status-active' : 'status-idle'}">${node.status}</span>
                <button class="btn btn-outline btn-sm" onclick="editNode('${node.id}', '${node.name}', '${node.type}')">Edit</button>
                <button class="btn btn-outline btn-sm" style="border-color: #ff4444; color: #ff4444" onclick="deleteNode('${node.id}')">Delete</button>
            </div>
        `;
        list.appendChild(item);
    });
}

async function handleNodeSubmit() {
    const name = document.getElementById('node-name').value;
    const type = document.getElementById('node-type').value;
    
    if (!name) return alert('Node name required');

    const method = editingNodeId ? 'PUT' : 'POST';
    const url = editingNodeId ? `/api/nodes/${editingNodeId}` : '/api/nodes';

    logTerminal(`${editingNodeId ? 'Updating' : 'Creating'} node: ${name}...`);

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type })
        });

        if (res.ok) {
            logTerminal(`SUCCESS: Node ${name} ${editingNodeId ? 'updated' : 'created'}.`);
            closeModal();
            fetchNodes();
        }
    } catch (err) {
        logTerminal('ERROR: Operation failed.', 'error');
    }
}

async function deleteNode(id) {
    document.getElementById('purge-modal').style.display = 'flex';
    document.getElementById('confirm-purge-btn').onclick = async () => {
        logTerminal(`PURGING node ${id}...`);
        try {
            const res = await fetch(`/api/nodes/${id}`, { method: 'DELETE' });
            if (res.status === 204) {
                logTerminal(`SUCCESS: Node ${id} purged.`);
                closePurgeModal();
                fetchNodes();
            }
        } catch (err) {
            logTerminal('ERROR: Purge failed.', 'error');
        }
    };
}

async function openPurgeAllModal() {
    document.getElementById('purge-modal').style.display = 'flex';
    document.getElementById('confirm-purge-btn').onclick = async () => {
        logTerminal(`PURGING ALL NODES...`);
        try {
            const res = await fetch('/api/nodes/purge-all', { method: 'DELETE' });
            if (res.ok) {
                logTerminal(`SUCCESS: System nodes purged.`);
                closePurgeModal();
                fetchNodes();
            }
        } catch (err) {
            logTerminal('ERROR: System purge failed.', 'error');
        }
    };
}

function closePurgeModal() {
    document.getElementById('purge-modal').style.display = 'none';
}

// --- UI Helpers ---
function logTerminal(message, type = 'info') {
    const terminal = document.getElementById('terminal');
    const line = document.createElement('div');
    line.className = 'terminal-line';
    if (type === 'error') line.style.color = '#ff4444';
    line.innerText = `> ${new Date().toLocaleTimeString()} | ${message}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function scrollToDashboard() {
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
}

function openCreateModal() {
    editingNodeId = null;
    document.getElementById('modal-title').innerText = 'Initialize New Node';
    document.getElementById('node-name').value = '';
    document.getElementById('node-modal').style.display = 'flex';
}

function editNode(id, name, type) {
    editingNodeId = id;
    document.getElementById('modal-title').innerText = 'Modify Neural Node';
    document.getElementById('node-name').value = name;
    document.getElementById('node-type').value = type;
    document.getElementById('node-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('node-modal').style.display = 'none';
}

// --- Health Chart Animation ---
const healthCanvas = document.getElementById('health-chart');
const hctx = healthCanvas.getContext('2d');
let healthData = Array(20).fill(50);

function drawHealthChart() {
    hctx.clearRect(0, 0, healthCanvas.width, healthCanvas.height);
    hctx.beginPath();
    hctx.strokeStyle = '#00E5FF';
    hctx.lineWidth = 2;
    
    const step = healthCanvas.width / (healthData.length - 1);
    healthData.forEach((val, i) => {
        const x = i * step;
        const y = healthCanvas.height - (val / 100 * healthCanvas.height);
        if (i === 0) hctx.moveTo(x, y);
        else hctx.lineTo(x, y);
    });
    
    hctx.stroke();
    
    // Add new data point
    healthData.shift();
    healthData.push(Math.max(20, Math.min(90, healthData[healthData.length - 1] + (Math.random() - 0.5) * 20)));
}

setInterval(drawHealthChart, 500);

// --- Preloader Logic ---
function runPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progress-bar');
    const loaderLogs = document.getElementById('loader-logs');
    
    const logs = [
        "> Syncing with Neural Mesh...",
        "> Loading Quantum Modules...",
        "> Verifying API Credentials...",
        "> Calibrating Synapse Core...",
        "> SYSTEM READY."
    ];
    
    let progress = 0;
    let logIndex = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = `${progress}%`;
        
        if (progress > (logIndex + 1) * 20 && logIndex < logs.length) {
            const p = document.createElement('p');
            p.innerText = logs[logIndex];
            loaderLogs.appendChild(p);
            logIndex++;
        }
        
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 1000);
        }
    }, 400);
}

// --- Initialization ---
window.addEventListener('load', runPreloader);
window.addEventListener('resize', () => {
    initCanvas();
    // healthCanvas doesn't need resize logic as much as main canvas
});
initCanvas();
createParticles();
animate();

// Initial data load
fetchNodes();
fetchStats();
setInterval(fetchStats, 5000);
