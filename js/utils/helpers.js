// ===== HELPER FUNCTIONS =====

// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let W, H;

function resizeCanvas() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Map dimensions
let mapWidth = 4000;
let mapHeight = 4000;

// Camera
const camera = {
    x: 0,
    y: 0,
    zoom: 1
};

// Rarity system
const RARITIES = {
    common: { color: '#888888', label: 'Common', multiplier: 1 },
    uncommon: { color: '#44ff44', label: 'Uncommon', multiplier: 1.3 },
    rare: { color: '#4488ff', label: 'Rare', multiplier: 1.7 },
    epic: { color: '#aa44ff', label: 'Epic', multiplier: 2.2 },
    legendary: { color: '#ffaa00', label: 'Legendary', multiplier: 3 },
    mythic: { color: '#ff44ff', label: 'Mythic', multiplier: 4 }
};

// ===== SHIP CLASSES =====
const SHIP_CLASSES = {
    light: { 
        label: 'Light', 
        icon: '⚡', 
        color: '#00ccff', 
        size: 30, 
        hpMult: 1, 
        speedMult: 1.5, 
        damageMult: 1,
        maxSpeedPercent: 0.95, // 95% light speed
        weightRange: '600-900'
    },
    medium: { 
        label: 'Medium', 
        icon: '⚖️', 
        color: '#ffcc00', 
        size: 40, 
        hpMult: 1.8, 
        speedMult: 1.1, 
        damageMult: 1.2,
        maxSpeedPercent: 0.75, // 75% light speed
        weightRange: '1400-1800'
    },
    heavy: { 
        label: 'Heavy', 
        icon: '🛡️', 
        color: '#ff4444', 
        size: 50, 
        hpMult: 2.8, 
        speedMult: 0.8, 
        damageMult: 1.5,
        maxSpeedPercent: 0.55, // 55% light speed
        weightRange: '2800-3800'
    },
    superheavy: { 
        label: 'Super Heavy', 
        icon: '🏛️', 
        color: '#ff44cc', 
        size: 65, 
        hpMult: 4.5, 
        speedMult: 0.55, 
        damageMult: 2.0,
        maxSpeedPercent: 0.40, // 40% light speed
        weightRange: '5500-6500'
    },
    carrier: { 
        label: 'Carrier', 
        icon: '🚁', 
        color: '#00ffcc', 
        size: 70, 
        hpMult: 3.5, 
        speedMult: 0.6, 
        damageMult: 0.5,
        maxSpeedPercent: 0.40, // 40% light speed
        weightRange: '5000-5000'
    }
};

// ===== RANK SYSTEM (without icons) =====
const RANKS = [
    { title: 'Recruit', xpRequired: 0, color: '#888888' },
    { title: 'Soldier', xpRequired: 100, color: '#44ff44' },
    { title: 'Defender', xpRequired: 300, color: '#4488ff' },
    { title: 'Veteran', xpRequired: 600, color: '#aa44ff' },
    { title: 'Elite', xpRequired: 1000, color: '#ff8800' },
    { title: 'Commander', xpRequired: 1500, color: '#ff4444' },
    { title: 'Champion', xpRequired: 2500, color: '#ffaa00' },
    { title: 'Legendary', xpRequired: 4000, color: '#ff44ff' },
    { title: 'Cosmic', xpRequired: 6000, color: '#00ffcc' },
    { title: 'Transcendent', xpRequired: 10000, color: '#ffdd00' }
];

function getRank(xp) {
    let rank = RANKS[0];
    for (const r of RANKS) {
        if (xp >= r.xpRequired) {
            rank = r;
        }
    }
    return rank;
}

function getRankProgress(xp) {
    let currentRank = RANKS[0];
    let nextRank = RANKS[RANKS.length - 1];
    
    for (let i = 0; i < RANKS.length; i++) {
        if (xp >= RANKS[i].xpRequired) {
            currentRank = RANKS[i];
            if (i < RANKS.length - 1) {
                nextRank = RANKS[i + 1];
            } else {
                nextRank = null;
            }
        }
    }
    
    if (!nextRank) {
        return { current: currentRank, next: null, progress: 1 };
    }
    
    const xpInRank = xp - currentRank.xpRequired;
    const xpNeeded = nextRank.xpRequired - currentRank.xpRequired;
    const progress = Math.min(1, xpInRank / xpNeeded);
    
    return { current: currentRank, next: nextRank, progress };
}

// Particles system
const particles = [];

function spawnExplosion(x, y, color = '#ff0', count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30 + Math.random() * 20,
            maxLife: 50,
            color,
            size: Math.random() * 3 + 1
        });
    }
}

function updateParticles() {
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; });
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
}

function drawParticles(ctx, camX, camY, zoom) {
    particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
        const sx = (p.x - camX + W / 2 / zoom) * zoom;
        const sy = (p.y - camY + H / 2 / zoom) * zoom;
        ctx.fillRect(sx - p.size / 2, sy - p.size / 2, p.size, p.size);
    });
}

// Background stars and nebulae
const stars = [];
const nebulae = [];

function generateBackground() {
    stars.length = 0;
    for (let i = 0; i < 500; i++) {
        stars.push({
            x: Math.random() * mapWidth,
            y: Math.random() * mapHeight,
            r: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.7 + 0.3,
            twinkle: Math.random() * Math.PI * 2
        });
    }
    nebulae.length = 0;
    for (let i = 0; i < 15; i++) {
        nebulae.push({
            x: Math.random() * mapWidth,
            y: Math.random() * mapHeight,
            r: Math.random() * 200 + 100,
            color: `rgba(${Math.random() * 100 + 50},${Math.random() * 100 + 100},${Math.random() * 100 + 200},0.03)`
        });
    }
}

function drawBackground(ctx, camX, camY, zoom) {
    stars.forEach(s => {
        const sx = s.x - camX + W / 2 / zoom;
        const sy = s.y - camY + H / 2 / zoom;
        if (sx < -10 || sx > W / zoom + 10 || sy < -10 || sy > H / zoom + 10) return;
        const alpha = s.alpha * (0.5 + 0.5 * Math.sin(Date.now() / 1000 + s.twinkle));
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(sx * zoom, sy * zoom, s.r * zoom, s.r * zoom);
    });
    nebulae.forEach(n => {
        const sx = n.x - camX + W / 2 / zoom;
        const sy = n.y - camY + H / 2 / zoom;
        if (sx < -n.r * 2 || sx > W / zoom + n.r * 2 || sy < -n.r * 2 || sy > H / zoom + n.r * 2) return;
        const grad = ctx.createRadialGradient(sx * zoom, sy * zoom, 0, sx * zoom, sy * zoom, n.r * zoom);
        grad.addColorStop(0, n.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect((sx - n.r) * zoom, (sy - n.r) * zoom, n.r * 2 * zoom, n.r * 2 * zoom);
    });
}

// Collision detection
function checkCollision(a, b, dist) {
    const ax = a.x + (a.size || 0) / 2;
    const ay = a.y + (a.size || 0) / 2;
    const bx = b.x + (b.size || 0) / 2;
    const by = b.y + (b.size || 0) / 2;
    return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2) < dist;
}

// Mobile device detection - kept but not used
function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
}

// Username management
function getUsername() {
    return localStorage.getItem('username') || 'Guest';
}

function setUsername(name) {
    localStorage.setItem('username', name || 'Guest');
}

// Game state
let gameRunning = false;
let gameMode = 'explore';
let animationId = null;